// Jaga ESP32 firmware: 4 buttons and 7 tray sensors send events to Firestore.
// Serial Monitor: 115200 baud.
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <time.h>

// Settings. Wokwi uses Wokwi-GUEST with no password. Use your own Wi-Fi on a real board.
const char* WIFI_SSID  = "Wokwi-GUEST";
const char* WIFI_PASS  = "";
const char* PROJECT_ID = "jaga-2";
const char* API_KEY    = "AIzaSyBKwLO950eJJn6gtTTnJrAltqZOYbh7EyM";
const char* DEVICE     = "jaga-01";

// LOW means the slot is open (light reaches the sensor). Flip it if yours works the other way.
const int OPEN_LEVEL = LOW;

// Pins
const int NUM_BTN = 4;

const int BTN_PINS[NUM_BTN]       = {25, 26, 27, 14};
const char* BTN_TYPES[NUM_BTN]    = {"toilet", "eating", "pain", "general"};

const int NUM_LDR = 7;
// One sensor per weekday, Monday to Sunday
const int LDR_PINS[NUM_LDR]       = {23, 22, 21, 19, 18, 5, 4};
const char* LDR_DAYS[NUM_LDR]     = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"};

const int LED_RED   = 33;
const int LED_GREEN = 32;
unsigned long redOffAt = 0;

bool btnRaw[NUM_BTN], btnStable[NUM_BTN];
unsigned long btnT[NUM_BTN];
bool ldrRaw[NUM_LDR], ldrOpen[NUM_LDR];
unsigned long ldrT[NUM_LDR];
unsigned long nextSend = 0, lastWifiTry = 0;

// Events wait here until they are sent
struct Item { bool isBtn; int idx; time_t t; };
const int QMAX = 16;
Item queueArr[QMAX];
int qCount = 0;

void enqueue(bool isBtn, int idx) {
  if (qCount >= QMAX) {
    for (int i = 1; i < QMAX; i++) queueArr[i - 1] = queueArr[i];
    qCount--;
  }
  Item it; it.isBtn = isBtn; it.idx = idx; it.t = time(nullptr);
  queueArr[qCount++] = it;
}

void dequeue() {
  for (int i = 1; i < qCount; i++) queueArr[i - 1] = queueArr[i];
  qCount--;
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " connected" : " FAILED (will retry)");
}

String isoTime(time_t t) {
  struct tm tm;
  gmtime_r(&t, &tm);
  char b[25];
  strftime(b, sizeof(b), "%Y-%m-%dT%H:%M:%SZ", &tm);
  return String(b);
}

// Sends one request to the Firestore REST API
bool sendHttp(const char* method, const String& url, const String& body) {
  WiFiClientSecure client;
  client.setInsecure();  // prototype only: skips the certificate check
  HTTPClient http;
  if (!http.begin(client, url)) return false;
  http.addHeader("Content-Type", "application/json");
  int code = http.sendRequest(method, body);
  Serial.printf("%s -> HTTP %d\n", method, code);
  if (code < 200 || code >= 300) Serial.println(http.getString());
  http.end();
  return code >= 200 && code < 300;
}

bool sendItem(const Item& it) {
  time_t t = it.t > 1700000000 ? it.t : time(nullptr);
  if (t < 1700000000) { Serial.println("Waiting for the clock..."); return false; }

  String base = String("https://firestore.googleapis.com/v1/projects/") + PROJECT_ID + "/databases/(default)/documents";
  String ts = isoTime(t), url, body;
  const char* method;

  if (it.isBtn) {
    method = "POST";
    url = base + "/events?key=" + API_KEY;
    body = String("{\"fields\":{\"type\":{\"stringValue\":\"") + BTN_TYPES[it.idx] +
           "\"},\"ts\":{\"timestampValue\":\"" + ts +
           "\"},\"device\":{\"stringValue\":\"" + DEVICE + "\"}}}";
  } else {
    method = "PATCH";
    url = base + "/meds/" + LDR_DAYS[it.idx] + "?updateMask.fieldPaths=opened&updateMask.fieldPaths=ts&key=" + API_KEY;
    body = String("{\"fields\":{\"opened\":{\"booleanValue\":true},\"ts\":{\"timestampValue\":\"") + ts + "\"}}}";
  }
  return sendHttp(method, url, body);
}

void readButtons() {
  for (int i = 0; i < NUM_BTN; i++) {
    bool r = digitalRead(BTN_PINS[i]);
    if (r != btnRaw[i]) { btnRaw[i] = r; btnT[i] = millis(); }
    // 50 ms debounce
    if (millis() - btnT[i] > 50 && btnRaw[i] != btnStable[i]) {
      btnStable[i] = btnRaw[i];
      if (!btnStable[i]) {
        Serial.printf("Button pressed: %s\n", BTN_TYPES[i]);
        digitalWrite(LED_RED, HIGH); redOffAt = millis() + 1000;
        enqueue(true, i);
      }
    }
  }
}

void readLdrs() {
  for (int i = 0; i < NUM_LDR; i++) {
    bool o = (digitalRead(LDR_PINS[i]) == OPEN_LEVEL);
    if (o != ldrRaw[i]) { ldrRaw[i] = o; ldrT[i] = millis(); }
    if (millis() - ldrT[i] > 300 && ldrRaw[i] != ldrOpen[i]) {
      ldrOpen[i] = ldrRaw[i];
      Serial.printf("Slot %s: %s\n", LDR_DAYS[i], ldrOpen[i] ? "OPENED" : "closed");
      if (ldrOpen[i]) enqueue(false, i);
    }
  }
}

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < NUM_BTN; i++) {
    pinMode(BTN_PINS[i], INPUT_PULLUP);
    btnRaw[i] = btnStable[i] = true;
    btnT[i] = 0;
  }
  for (int i = 0; i < NUM_LDR; i++) {
    pinMode(LDR_PINS[i], INPUT);
    ldrRaw[i] = ldrOpen[i] = (digitalRead(LDR_PINS[i]) == OPEN_LEVEL);
    ldrT[i] = 0;
  }
  pinMode(LED_RED, OUTPUT); pinMode(LED_GREEN, OUTPUT);
  digitalWrite(LED_RED, LOW); digitalWrite(LED_GREEN, LOW);
  connectWifi();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  unsigned long start = millis();
  while (time(nullptr) < 1700000000 && millis() - start < 10000) delay(250);
  Serial.println(time(nullptr) > 1700000000 ? "Clock ready" : "Clock not ready yet");
  Serial.println("Jaga ready. Press a button or open a tray slot.");
}

void loop() {
  readButtons();
  readLdrs();

  digitalWrite(LED_GREEN, WiFi.status() == WL_CONNECTED ? HIGH : LOW);
  if (redOffAt && millis() > redOffAt) { digitalWrite(LED_RED, LOW); redOffAt = 0; }

  if (WiFi.status() != WL_CONNECTED && millis() - lastWifiTry > 10000) {
    lastWifiTry = millis();
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASS);
  }

  if (qCount > 0 && WiFi.status() == WL_CONNECTED && millis() >= nextSend) {
    if (sendItem(queueArr[0])) dequeue();
    else nextSend = millis() + 3000;
  }
}
