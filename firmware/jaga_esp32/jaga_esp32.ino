/* =========================================================
   JAGA ESP32 firmware
   - 4 buttons  -> a new document in Firestore "events"
   - 7 LDR modules (tray slots Mon-Sun) -> updates "meds/<day>" when a slot opens
   - 2 LEDs: green = Wi-Fi connected, red = blinks when a button press is registered
   Board: ESP32 Dev Module. Serial Monitor: 115200 baud.
   ========================================================= */
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <time.h>

// ---------- 1. EDIT THESE (do not commit your real Wi-Fi password) ----------
const char* WIFI_SSID  = "Wokwi-GUEST";         // Wokwi simulator. Real board: your own 2.4 GHz Wi-Fi name
const char* WIFI_PASS  = "";                    // Wokwi simulator. Real board: your Wi-Fi password
const char* PROJECT_ID = "jaga-2";              // Firebase project ID
const char* API_KEY    = "AIzaSyBKwLO950eJJn6gtTTnJrAltqZOYbh7EyM";   // apiKey from firebaseConfig
const char* DEVICE     = "jaga-01";

// Which DO level means "slot opened" (light reaches the sensor).
// Most LM393 modules give LOW in light. Test it in the Serial Monitor and flip if needed.
const int OPEN_LEVEL = LOW;

// ---------- 2. PINS (same as the wiring diagram) ----------
const int NUM_BTN = 4;
// Buttons use the ESP32's built-in pull-up: no resistor needed. Button goes GPIO -> GND.
const int BTN_PINS[NUM_BTN]       = {25, 26, 27, 14};
const char* BTN_TYPES[NUM_BTN]    = {"toilet", "eating", "pain", "general"};

const int NUM_LDR = 7;
const int LDR_PINS[NUM_LDR]       = {23, 22, 21, 19, 18, 5, 4};   // Mon to Sun, top to bottom on the ESP32's right side
const char* LDR_DAYS[NUM_LDR]     = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"};

// LEDs are OPTIONAL. Only connect one with a 220 ohm resistor in series. Without LEDs everything still works.
const int LED_RED   = 33;                        // blinks when a button is pressed
const int LED_GREEN = 32;                        // on = Wi-Fi connected
unsigned long redOffAt = 0;

// ---------- State ----------
bool btnRaw[NUM_BTN], btnStable[NUM_BTN];
unsigned long btnT[NUM_BTN];
bool ldrRaw[NUM_LDR], ldrOpen[NUM_LDR];
unsigned long ldrT[NUM_LDR];
unsigned long nextSend = 0, lastWifiTry = 0;

// ---------- Queue (events wait here until they are sent) ----------
struct Item { bool isBtn; int idx; time_t t; };
const int QMAX = 16;
Item queueArr[QMAX];
int qCount = 0;

void enqueue(bool isBtn, int idx) {
  if (qCount >= QMAX) {                          // full: drop the oldest
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

// ---------- Wi-Fi and time ----------
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

String isoTime(time_t t) {                       // UTC, like 2026-10-12T08:15:30Z
  struct tm tm;
  gmtime_r(&t, &tm);
  char b[25];
  strftime(b, sizeof(b), "%Y-%m-%dT%H:%M:%SZ", &tm);
  return String(b);
}

// ---------- Sending to Firestore (REST API) ----------
bool sendHttp(const char* method, const String& url, const String& body) {
  WiFiClientSecure client;
  client.setInsecure();                          // fine for a prototype; skips certificate check
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
  time_t t = it.t > 1700000000 ? it.t : time(nullptr);   // if the clock was not ready, use now
  if (t < 1700000000) { Serial.println("Waiting for the clock..."); return false; }

  String base = String("https://firestore.googleapis.com/v1/projects/") + PROJECT_ID + "/databases/(default)/documents";
  String ts = isoTime(t), url, body;
  const char* method;

  if (it.isBtn) {                                // new document in "events"
    method = "POST";
    url = base + "/events?key=" + API_KEY;
    body = String("{\"fields\":{\"type\":{\"stringValue\":\"") + BTN_TYPES[it.idx] +
           "\"},\"ts\":{\"timestampValue\":\"" + ts +
           "\"},\"device\":{\"stringValue\":\"" + DEVICE + "\"}}}";
  } else {                                       // update document "meds/<day>"
    method = "PATCH";
    url = base + "/meds/" + LDR_DAYS[it.idx] + "?updateMask.fieldPaths=opened&updateMask.fieldPaths=ts&key=" + API_KEY;
    body = String("{\"fields\":{\"opened\":{\"booleanValue\":true},\"ts\":{\"timestampValue\":\"") + ts + "\"}}}";
  }
  return sendHttp(method, url, body);
}

// ---------- Reading the inputs ----------
void readButtons() {
  for (int i = 0; i < NUM_BTN; i++) {
    bool r = digitalRead(BTN_PINS[i]);           // HIGH = not pressed (pull-up)
    if (r != btnRaw[i]) { btnRaw[i] = r; btnT[i] = millis(); }
    if (millis() - btnT[i] > 50 && btnRaw[i] != btnStable[i]) {   // 50 ms debounce
      btnStable[i] = btnRaw[i];
      if (!btnStable[i]) {                       // went LOW = pressed
        Serial.printf("Button pressed: %s\n", BTN_TYPES[i]);
        digitalWrite(LED_RED, HIGH); redOffAt = millis() + 1000;   // feedback: press received
        enqueue(true, i);
      }
    }
  }
}

void readLdrs() {
  for (int i = 0; i < NUM_LDR; i++) {
    bool o = (digitalRead(LDR_PINS[i]) == OPEN_LEVEL);
    if (o != ldrRaw[i]) { ldrRaw[i] = o; ldrT[i] = millis(); }
    if (millis() - ldrT[i] > 300 && ldrRaw[i] != ldrOpen[i]) {    // 300 ms debounce
      ldrOpen[i] = ldrRaw[i];
      Serial.printf("Slot %s: %s\n", LDR_DAYS[i], ldrOpen[i] ? "OPENED" : "closed");
      if (ldrOpen[i]) enqueue(false, i);         // only report when a slot is opened
    }
  }
}

// ---------- Arduino ----------
void setup() {
  Serial.begin(115200);
  for (int i = 0; i < NUM_BTN; i++) {
    pinMode(BTN_PINS[i], INPUT_PULLUP);
    btnRaw[i] = btnStable[i] = true;
    btnT[i] = 0;
  }
  for (int i = 0; i < NUM_LDR; i++) {
    pinMode(LDR_PINS[i], INPUT);
    ldrRaw[i] = ldrOpen[i] = (digitalRead(LDR_PINS[i]) == OPEN_LEVEL);   // start state, nothing sent
    ldrT[i] = 0;
  }
  pinMode(LED_RED, OUTPUT); pinMode(LED_GREEN, OUTPUT);
  digitalWrite(LED_RED, LOW); digitalWrite(LED_GREEN, LOW);
  connectWifi();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");   // UTC clock
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
    else nextSend = millis() + 3000;             // try again in 3 seconds
  }
}
