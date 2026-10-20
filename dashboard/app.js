/* =========================================================
   JAGA Care Dashboard – front-end only (sample data)
   TODO for backend teammates: replace `state` with API calls
   (alerts, doses, timeline, analysis) and WebSocket/push updates.
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Sample data ---------- */
const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULLDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = [
  { id: "morning",   label: "Morning",   at: "8:00 AM" },
  { id: "afternoon", label: "Afternoon", at: "2:00 PM" },
  { id: "night",     label: "Night",     at: "8:00 PM" },
];
const ALLDAYS = [0, 1, 2, 3, 4, 5, 6];
/* Sample medicines (mock names for the demo). The caregiver can add, edit and remove them. */
const defaultMeds = [
  { id: "m1", name: "Paracetamol", strength: "500 mg",   days: ALLDAYS,      times: ["morning", "night"], note: "After food" },
  { id: "m2", name: "Amlodipine",  strength: "5 mg",     days: ALLDAYS,      times: ["morning"],          note: "" },
  { id: "m3", name: "Metformin",   strength: "500 mg",   days: ALLDAYS,      times: ["morning", "night"], note: "With meals" },
  { id: "m4", name: "Omeprazole",  strength: "20 mg",    days: ALLDAYS,      times: ["morning"],          note: "Before breakfast" },
  { id: "m5", name: "Vitamin D3",  strength: "1000 IU",  days: [0, 2, 4],    times: ["afternoon"],        note: "" },
  { id: "m6", name: "Calcium",     strength: "600 mg",   days: [1, 3, 5],    times: ["afternoon"],        note: "" },
];
let medList = defaultMeds.map((m) => ({ ...m, days: [...m.days], times: [...m.times] }));
try { const saved = JSON.parse(localStorage.getItem("jaga-meds")); if (Array.isArray(saved)) medList = saved; } catch (e) {}
const saveMeds = () => { try { localStorage.setItem("jaga-meds", JSON.stringify(medList)); } catch (e) {} };

/* "Clear all" only hides older items from the two lists. Nothing is deleted from Firebase. */
let clearedAt = { timeline: 0, notifs: 0 };
try { clearedAt = { ...clearedAt, ...JSON.parse(localStorage.getItem("jaga-cleared")) }; } catch (e) {}
const saveCleared = () => { try { localStorage.setItem("jaga-cleared", JSON.stringify(clearedAt)); } catch (e) {} };
const BOX   = [1, 1, 1, 1, 0, 0, 0];          // times the medicine box was opened

const state = {
  alerts: [
    { id: "pain",   kind: "pain",   title: "Patient may be in pain", mins: 6,  handled: false },
    { id: "toilet", kind: "toilet", title: "Patient needs toilet",   mins: 10, handled: false },
  ],
  doses: [
    { id: "am", label: "Morning dose", due: "8:00 AM", given: "8:02 AM" },
    { id: "pm", label: "Night dose",   due: "8:00 PM", given: null },
  ],
  tiles: [
    { name: "Pain",    note: "Mild, 2 spikes" },
    { name: "Toilet",  note: "3 visits" },
    { name: "Food",    note: "2 meals logged" },
    { name: "General", note: "Calm day" },
  ],
  timeline: [
    { text: "Patient may be in pain", time: "6 mins ago" },
    { text: "Patient needs toilet",   time: "10 mins ago" },
    { text: "Lunch logged by you",    time: "12:30 PM" },
    { text: "Morning dose given",     time: "8:02 AM" },
  ],
  medicines: [
    { name: "Medicine A", when: "Mon, Wed, Fri" },
    { name: "Medicine B", when: "Every day" },
    { name: "Medicine C", when: "Sunday" },
  ],
  notifs: [
    { kind: "pain",   title: "Patient may be in pain", time: "6 mins ago" },
    { kind: "toilet", title: "Patient needs toilet",   time: "10 mins ago" },
    { kind: "toilet", title: "Patient needs toilet",   time: "1:15 PM" },
    { kind: "pain",   title: "Patient may be in pain", time: "9:10 AM" },
    { kind: "meds",   title: "Morning dose given",     time: "8:02 AM" },
  ],
  overview: {
    today: [
      { key: "pain",     name: "Pain",     value: "2 spikes",      trend: "Down from 4 yesterday", tone: "good" },
      { key: "toilet",   name: "Toilet",   value: "3 visits",      trend: "Same as usual",         tone: "ok" },
      { key: "food",     name: "Food",     value: "2 of 3 meals",  trend: "Dinner not logged",     tone: "watch" },
      { key: "medicine", name: "Medicine", value: "1 of 2 doses",  trend: "Night dose due 8 PM",   tone: "watch" },
    ],
    week: [
      { key: "pain",     name: "Pain",     value: "23 spikes",       trend: "Down 12% vs last week", tone: "good" },
      { key: "toilet",   name: "Toilet",   value: "23 visits",       trend: "Steady all week",       tone: "ok" },
      { key: "food",     name: "Food",     value: "18 of 21 meals",  trend: "3 meals missed",        tone: "watch" },
      { key: "medicine", name: "Medicine", value: "95% given",       trend: "Up from 88%",           tone: "good" },
    ],
  },
  // level: "good" | "ok" | "watch"
  analysis: {
    pain: {
      title: "Pain",
      tips: ["Note what the patient was doing before each spike.", "Tell the doctor if pain keeps happening at the same time."],
      today: { labels: ["6a", "9a", "12p", "3p", "6p", "9p"], vals: [0, 1, 0, 0, 1, 0], sub: "Spikes at about 9 AM and 6 PM",
        insights: [{ level: "good", text: "The 9 AM spike settled within 20 minutes." }, { level: "watch", text: "The latest spike was 6 minutes ago. Check how the patient is feeling." }] },
      week:  { labels: DAYS, vals: [4, 3, 5, 4, 2, 3, 2], sub: "Highest on Wednesday",
        insights: [{ level: "good", text: "Fewer spikes toward the weekend." }, { level: "watch", text: "Most spikes happen in the afternoon." }] },
    },
    toilet: {
      title: "Toilet",
      tips: ["Offer water through the day.", "Tell the doctor if visits suddenly increase or decrease."],
      today: { labels: ["6a", "9a", "12p", "3p", "6p", "9p"], vals: [1, 0, 1, 0, 1, 0], sub: "Visits at about 6 AM, 12 PM and 6 PM",
        insights: [{ level: "ok", text: "Timing is regular compared with the past week." }, { level: "watch", text: "The latest toilet alert was 10 minutes ago." }] },
      week:  { labels: DAYS, vals: [3, 4, 3, 3, 4, 3, 3], sub: "Between 3 and 4 visits a day",
        insights: [{ level: "ok", text: "The pattern is steady all week." }, { level: "ok", text: "Tuesday and Friday had one extra visit." }] },
    },
    food: {
      title: "Food",
      tips: ["Log meals soon after serving so the AI stays accurate.", "Tell the doctor if the patient keeps leaving meals unfinished."],
      today: { labels: ["Breakfast", "Lunch", "Dinner"], vals: [1, 1, 0], sub: "2 of 3 meals logged",
        insights: [{ level: "good", text: "Breakfast and lunch were logged." }, { level: "watch", text: "Dinner is not logged yet." }] },
      week:  { labels: DAYS, vals: [3, 3, 2, 3, 3, 2, 2], sub: "18 of 21 meals logged",
        insights: [{ level: "watch", text: "Dinner was missed most often." }, { level: "good", text: "Breakfast was logged every day." }] },
    },
    medicine: {
      title: "Medicine",
      tips: ["Set the night dose reminder 15 minutes early.", "Check the medicine box against the schedule if a dose is missed."],
      today: { labels: ["Morning", "Night"], vals: [1, 0], sub: "1 of 2 doses given",
        insights: [{ level: "good", text: "Morning dose was given at 8:02 AM." }, { level: "watch", text: "Night dose is due at 8:00 PM." }] },
      week:  { labels: DAYS, vals: [3, 7, 1, 4, 2, 3, 1], sub: "21 of 22 doses given",
        insights: [{ level: "good", text: "Almost every dose was given on time." }, { level: "watch", text: "Tuesday had 8 doses scheduled and 1 was missed." }] },
    },
  },
};

/* ---------- Settings (saved in the browser) ---------- */
const defaultSettings = { name: "Patient name", doctor: "", sound: true, cgName: "", cgRel: "", age: "", notes: "", famName: "", famPhone: "", pain: true, toilet: true, meds: true, push: true };
let settings = { ...defaultSettings };
try { settings = { ...defaultSettings, ...JSON.parse(localStorage.getItem("jaga-settings")) }; } catch (e) {}

/* ---------- Helpers ---------- */
const nowTime = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const ago = (m) => tr(m === 1 ? "{n} min ago" : "{n} mins ago", { n: m });
/* translate text that was saved in Firestore in English (timeline / logs) */
function trDyn(s) {
  if (LANG !== "ms") return s;
  if (MS[s] !== undefined) return MS[s];
  let m;
  if ((m = s.match(/^You responded: (.*)$/))) {
    const orig = Object.values(TITLES).find((v) => v.toLowerCase() === m[1]);
    return tr("You responded: {x}", { x: orig ? tr(orig).toLowerCase() : m[1] });
  }
  if ((m = s.match(/^(Food|Toilet|Note|Medicine) logged by you(?:: (.*))?$/)))
    return tr("{type} logged by you", { type: tr(m[1]) }) + (m[2] ? ": " + m[2] : "");
  return s;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = tr(msg);
  t.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.remove("show"), 2600);
}

function addTimeline(text) {
  if (LIVE) { fs.addDoc(fs.collection(db, "logs"), { text, ts: fs.Timestamp.now() }).catch(() => toast("Could not save")); return; }
  state.timeline.unshift({ text, time: tr("Just now") });
  renderTimeline();
}

/* ---------- Router (hash based: #home, #medicine, ...) ---------- */
const PAGES = ["home", "medicine", "analysis", "settings"];

function route() {
  const page = PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";
  PAGES.forEach((p) => { $("#" + p).hidden = p !== page; });
  $$("[data-link]").forEach((a) => {
    a.classList.toggle("on", a.dataset.link === page);
    a.toggleAttribute("aria-current", a.dataset.link === page);
  });
  const el = $("#" + page);
  el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ---------- Home ---------- */
function renderGreeting() {
  const h = new Date().getHours();
  const hello = tr(h < 12 ? "Good morning!" : h < 18 ? "Good afternoon!" : "Good evening!");
  const base = hello.replace("!", "");
  $("#greeting").innerHTML = settings.cgName ? `${esc(base)}, <span class="who">${esc(settings.cgName)}</span>!` : esc(hello);
  const pname = tr(settings.name);
  $("#patientName").textContent = pname;
  $("#avatar").textContent = (pname.trim()[0] || "P").toUpperCase();
  const ageEl = $("#patientAge");
  ageEl.hidden = !settings.age;
  ageEl.textContent = settings.age ? tr("{n} yrs", { n: settings.age }) : "";
  const night = h < 6 || h >= 19;
  $("#heroIcon").className = "hero-icon " + (night ? "moon" : "sun");
  $("#heroIcon").innerHTML = night
    ? '<svg viewBox="0 0 64 64"><path class="m" d="M44 40A20 20 0 0 1 24 12a20 20 0 1 0 20 28z"/><circle class="s s1" cx="46" cy="16" r="2"/><circle class="s s2" cx="54" cy="30" r="1.5"/><circle class="s s3" cx="38" cy="8" r="1.5"/></svg>'
    : '<svg viewBox="0 0 64 64"><g class="rays"><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M12 52l6-6M46 18l6-6"/></g><circle class="core" cx="32" cy="32" r="12"/></svg>';
}

function renderAlerts() {
  const visible = state.alerts.filter((a) => settings[a.kind] !== false);
  $("#alerts").innerHTML = visible.length
    ? visible.map((a) => `
      <div class="alert ${a.handled ? "done" : a.kind}">
        <b>${esc(tr(a.title))}</b>
        <small>${a.handled ? tr("You are on it") : ago(a.mins)}</small>
        <div class="acts">
          <button class="main" data-handle="${a.id}" ${a.handled ? "disabled" : ""}>
            ${a.handled ? tr("Responding") : a.kind === "pain" ? tr("I'm checking") : tr("I'm helping")}
          </button>
          <button data-details="${a.kind}">${tr("Details")}</button>
        </div>
      </div>`).join("")
    : `<p class="muted">${tr("No alerts right now.")}</p>`;
}

function renderHomeDoses() {
  $("#homeDoses").innerHTML = state.doses.map((d) => `
    <div class="row-item">
      <span>${esc(tr(d.label))}</span>
      ${d.given
        ? `<span class="pill">${esc(tr("Given {t}", { t: d.given }))}</span>`
        : `<small>${esc(tr("Due {t}", { t: d.due }))}</small>`}
    </div>`).join("") +
    state.doses.filter((d) => !d.given).map((d) =>
      `<button class="btn give block" data-give="${d.id}">${esc(tr("Mark {label} as given", { label: tr(d.label).toLowerCase() }))}</button>`).join("");
}

function renderTiles() {
  $("#tiles").innerHTML = state.tiles.map((t) =>
    `<div class="tile"><b>${esc(tr(t.name))}</b>${esc(t.note)}</div>`).join("");
}

function renderTimeline() {
  $("#timeline").innerHTML = state.timeline.length
    ? state.timeline.map((e) => `<li>${esc(trDyn(e.text))}<small>${esc(trDyn(e.time))}</small></li>`).join("")
    : `<li class="empty muted">${tr("Nothing here yet.")}${clearedAt.timeline ? ` <button type="button" class="link" data-restore="timeline">${tr("Show cleared items")}</button>` : ""}</li>`;
  $("#clearTimeline").hidden = !state.timeline.length;
}

/* ---------- Medicine ---------- */
const todayIdx = () => (new Date().getDay() + 6) % 7;     // Monday = 0
let selectedDay = todayIdx();
let editingList = false, pendingDel = null, delTimer = null;

/* what to give on one day, grouped by time of day */
function slotsFor(day) {
  return TIMES.map((t) => ({ t, items: medList.filter((m) => m.days.includes(day) && m.times.includes(t.id)) }))
    .filter((s) => s.items.length);
}

function whenText(m) {
  const days = m.days.length === 7 ? tr("Every day") : [...m.days].sort().map((d) => tr(DAYS[d])).join(", ");
  const times = TIMES.filter((t) => m.times.includes(t.id)).map((t) => tr(t.label)).join(", ");
  return days + " · " + times;
}

function renderDays() {
  const today = todayIdx();
  $("#days").innerHTML = DAYS.map((d, i) =>
    `<button role="tab" data-day="${i}" class="${i === selectedDay ? "on" : ""}${i === today ? " today" : ""}" aria-selected="${i === selectedDay}">${esc(tr(d))}<i class="tick ${BOX[i] ? "on" : ""}"></i></button>`).join("");

  const slots = slotsFor(selectedDay);
  const count = new Set(slots.flatMap((s) => s.items.map((m) => m.id))).size;
  const opened = BOX[selectedDay] ? 1 : 0;
  const doseFor = { morning: "am", night: "pm" };
  const rows = slots.map((s) => {
    const dose = selectedDay === today && doseFor[s.t.id] ? state.doses.find((x) => x.id === doseFor[s.t.id]) : null;
    const status = dose ? (dose.given ? `<span class="pill">${esc(tr("Given {t}", { t: dose.given }))}</span>` : `<span class="slot-state">${esc(tr("Due {t}", { t: dose.due }))}</span>`) : "";
    return `<div class="slot">
      <div class="slot-time"><b>${esc(tr(s.t.label))}</b><small>${s.t.at}</small></div>
      <div class="slot-meds">${s.items.map((m) => `<span class="med">${esc(m.name)}${m.strength ? `<small>${esc(m.strength)}</small>` : ""}</span>`).join("")}</div>
      ${status}
    </div>`;
  }).join("");
  $("#dayCard").innerHTML = `
    <div class="day-head">
      <h2>${esc(tr(FULLDAYS[selectedDay]))}${selectedDay === today ? ` <span class="pill">${esc(tr("Today"))}</span>` : ""}</h2>
      <span class="boxstat ${opened ? "ok" : ""}">${esc(tr(opened ? "Box opened" : "Box not opened"))}</span>
    </div>
    <p class="muted small day-sub">${slots.length ? esc(tr(slots.length === 1 ? "{n} dose time" : "{n} dose times", { n: slots.length })) + " · " + esc(tr(count === 1 ? "{n} medicine" : "{n} medicines", { n: count })) : ""}</p>
    ${rows || `<p class="muted">${tr("No medicine scheduled for this day.")}</p>`}
    <button type="button" class="btn ghost block" id="editSchedule">${tr("Edit schedule")}</button>`;
}

function renderMedList() {
  $("#medList").innerHTML = medList.length
    ? medList.map((m) => `<div class="med-row">
        <div class="med-main"><b>${esc(m.name)}</b>${m.strength ? ` <span class="muted">${esc(m.strength)}</span>` : ""}
          <small>${esc(whenText(m))}${m.note ? " · " + esc(m.note) : ""}</small></div>
        ${editingList ? `<div class="med-acts">
          <button type="button" class="mini" data-med-edit="${m.id}">${tr("Edit")}</button>
          <button type="button" class="mini warn" data-med-del="${m.id}">${tr(pendingDel === m.id ? "Tap again to remove" : "Remove")}</button>
        </div>` : ""}
      </div>`).join("")
    : `<p class="muted">${tr("No medicines yet. Tap Edit list to add one.")}</p>`;
  $("#editList").textContent = tr(editingList ? "Done" : "Edit list");
  $("#addMed").hidden = !editingList;
}

/* ---- add / edit dialog ---- */
const medDialog = $("#medDialog");
let medEditId = null, medDraft = { days: [], times: [] };

function drawToggles() {
  $("#medDays").innerHTML = DAYS.map((d, i) =>
    `<button type="button" class="tg ${medDraft.days.includes(i) ? "on" : ""}" data-tgl-day="${i}" aria-pressed="${medDraft.days.includes(i)}">${esc(tr(d))}</button>`).join("");
  $("#medTimes").innerHTML = TIMES.map((t) =>
    `<button type="button" class="tg ${medDraft.times.includes(t.id) ? "on" : ""}" data-tgl-time="${t.id}" aria-pressed="${medDraft.times.includes(t.id)}">${esc(tr(t.label))}<small>${t.at}</small></button>`).join("");
}

function openMedDialog(id) {
  medEditId = id;
  const m = id ? medList.find((x) => x.id === id) : { name: "", strength: "", days: ALLDAYS, times: ["morning"], note: "" };
  $("#medDlgTitle").textContent = tr(id ? "Edit medicine" : "Add medicine");
  $("#medName").value = m.name; $("#medStrength").value = m.strength || ""; $("#medNote").value = m.note || "";
  medDraft = { days: [...m.days], times: [...m.times] };
  drawToggles();
  medDialog.showModal();
}

/* ---- edit one day's schedule: tick which medicines are given on that day ---- */
const schedDialog = $("#schedDialog");
function openSched() {
  $("#schedTitle").textContent = tr("Schedule for {d}", { d: tr(FULLDAYS[selectedDay]) });
  $("#schedList").innerHTML = medList.length ? medList.map((m) =>
    `<label class="switch"><input type="checkbox" value="${m.id}" ${m.days.includes(selectedDay) ? "checked" : ""}> ${esc(m.name)} ${m.strength ? `<span class="muted">${esc(m.strength)}</span>` : ""}
      <small class="muted">${esc(TIMES.filter((t) => m.times.includes(t.id)).map((t) => tr(t.label)).join(", "))}</small></label>`).join("")
    : `<p class="muted">${tr("No medicines yet. Tap Edit list to add one.")}</p>`;
  schedDialog.showModal();
}
schedDialog.addEventListener("close", () => {
  if (schedDialog.returnValue !== "save") return;
  const on = [...document.querySelectorAll("#schedList input:checked")].map((i) => i.value);
  medList = medList.map((m) => {
    const has = m.days.includes(selectedDay), want = on.includes(m.id);
    return has === want ? m : { ...m, days: want ? [...m.days, selectedDay].sort() : m.days.filter((d) => d !== selectedDay) };
  });
  saveMeds(); renderMedList(); renderDays(); toast("Schedule saved");
});

$("#medForm").addEventListener("submit", (e) => {
  if (e.submitter && e.submitter.value === "save" && (!medDraft.days.length || !medDraft.times.length)) {
    e.preventDefault(); toast("Pick at least one day and one time");
  }
});

medDialog.addEventListener("close", () => {
  if (medDialog.returnValue !== "save") return;
  const m = {
    id: medEditId || "m" + Date.now(),
    name: $("#medName").value.trim(),
    strength: $("#medStrength").value.trim(),
    days: [...medDraft.days].sort(),
    times: TIMES.map((t) => t.id).filter((id) => medDraft.times.includes(id)),
    note: $("#medNote").value.trim(),
  };
  if (!m.name) return;
  medList = medEditId ? medList.map((x) => (x.id === medEditId ? m : x)) : [...medList, m];
  saveMeds(); renderMedList(); renderDays(); toast("Medicine saved");
});

/* ---------- Analysis ---------- */
let anaRange = "today";
let anaTab = "pain";
let notifFilter = "all";

function showAnalysis(key) { anaTab = key; renderAnalysis(); }

function renderAnalysis() {
  const d = state.analysis[anaTab];
  const r = d[anaRange];
  const isToday = anaRange === "today";

  $$("#range button").forEach((b) => {
    const on = b.dataset.range === anaRange;
    b.classList.toggle("on", on); b.setAttribute("aria-selected", on);
  });
  $$("#seg button").forEach((b) => {
    const on = b.dataset.k === anaTab;
    b.classList.toggle("on", on); b.setAttribute("aria-selected", on);
  });

  // Overview cards
  $("#overview").innerHTML = state.overview[anaRange].map((o) => `
    <button class="tile ${o.key === anaTab ? "sel" : ""}" data-card="${o.key}">
      <b>${esc(tr(o.name))}</b>
      <span class="big">${esc(o.value)}</span>
      <span class="trend ${o.tone}">${esc(o.trend)}</span>
    </button>`).join("");

  // Chart
  const max = Math.max(...r.vals, 1);
  const top = Math.max(...r.vals);
  const peak = r.vals.filter((v) => v === top).length === 1 ? r.vals.indexOf(top) : -1; // only mark a single clear highest
  $("#aTitle").textContent = tr(isToday ? "{topic} today" : "{topic} in the last 7 days", { topic: tr(d.title) });
  $("#aSub").textContent = r.sub;
  $("#bars").setAttribute("aria-label", tr("{topic} chart. {sub}", { topic: tr(d.title), sub: r.sub }));
  $("#bars").innerHTML = r.vals.map((v, i) => `
    <div class="col ${i === peak && v > 0 ? "peak" : ""}">
      <span class="val">${v}</span>
      <div class="bar" style="height:${Math.round((v / max) * 100)}px"></div>
      <span class="lab">${esc(tr(r.labels[i]))}</span>
    </div>`).join("");

  // Insights and tips
  $("#insights").innerHTML = r.insights.map((i) =>
    `<div class="insight ${i.level}"><small>${tr(i.level === "watch" ? "Keep an eye on this" : i.level === "good" ? "Good news" : "Noted")}</small>${esc(i.text)}</div>`).join("");
  $("#tips").innerHTML = d.tips.map((t) => `<li>${esc(tr(t))}</li>`).join("");

  renderNotifs();
}

function renderNotifs() {
  $$("#filter button").forEach((b) => b.classList.toggle("on", b.dataset.filter === notifFilter));
  const items = state.notifs.filter((n) => notifFilter === "all" || n.kind === notifFilter);
  $("#notifs").innerHTML = items.length
    ? items.map((n) => `<li class="row-item"><span>${esc(trDyn(n.title))}</span><small>${esc(n.time)}</small></li>`).join("")
    : `<li class="muted">${tr("Nothing here yet.")}${clearedAt.notifs && !state.notifs.length ? ` <button type="button" class="link" data-restore="notifs">${tr("Show cleared items")}</button>` : ""}</li>`;
  $("#clearNotifs").hidden = !state.notifs.length;
}

function summaryText() {
  const lines = [tr(anaRange === "today" ? "{name} - today summary" : "{name} - last 7 days summary", { name: tr(settings.name) + (settings.age ? ", " + tr("{n} yrs", { n: settings.age }) : "") })];
  if (settings.notes) lines.push(tr("Doctor's notes:") + " " + settings.notes);
  if (settings.cgName) lines.push(tr("Caregiver:") + " " + settings.cgName + (settings.cgRel ? " (" + tr(settings.cgRel) + ")" : ""));
  state.overview[anaRange].forEach((o) => lines.push(`${tr(o.name)}: ${o.value} (${o.trend})`));
  lines.push("", tr("AI notes:"));
  state.analysis[anaTab][anaRange].insights.forEach((i) => lines.push("- " + i.text));
  return lines.join("\n");
}

async function copySummary() {
  const text = summaryText();
  try {
    await navigator.clipboard.writeText(text);
    toast("Summary copied");
  } catch (err) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    toast(ok ? "Summary copied" : "Could not copy. Try again.");
  }
}

/* ---------- Settings ---------- */
function fillSettings() {
  $("#setName").value = settings.name;
  $("#setDoctor").value = settings.doctor;
  $("#setCgName").value = settings.cgName; $("#setCgRel").value = settings.cgRel;
  $("#setAge").value = settings.age; $("#setNotes").value = settings.notes;
  $("#setFamName").value = settings.famName; $("#setFamPhone").value = settings.famPhone;
  const fam = $("#callFamily");
  fam.hidden = !settings.famPhone;
  fam.href = "tel:" + settings.famPhone.replace(/[^\d+]/g, "");
  fam.textContent = settings.famName ? tr("Call {name}", { name: settings.famName }) : tr("Call family");
  $("#setPain").checked = settings.pain;
  $("#setToilet").checked = settings.toilet;
  $("#setMeds").checked = settings.meds;
  $("#setPush").checked = settings.push;
  $("#setSound").checked = settings.sound !== false;
  $("#callDoctor").href = settings.doctor ? "tel:" + settings.doctor.replace(/[^\d+]/g, "") : "#settings";
}

$("#settingsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  settings = {
    name: $("#setName").value.trim() || defaultSettings.name,
    doctor: $("#setDoctor").value.trim(),
    cgName: $("#setCgName").value.trim(), cgRel: $("#setCgRel").value,
    age: $("#setAge").value.trim(), notes: $("#setNotes").value.trim(),
    famName: $("#setFamName").value.trim(), famPhone: $("#setFamPhone").value.trim(),
    pain: $("#setPain").checked,
    toilet: $("#setToilet").checked,
    meds: $("#setMeds").checked,
    push: $("#setPush").checked,
    sound: $("#setSound").checked,
  };
  try { localStorage.setItem("jaga-settings", JSON.stringify(settings)); } catch (err) {}
  fillSettings(); renderGreeting(); renderAlerts();
  toast("Changes saved");
});

/* ---------- Click handling (one listener for the whole page) ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button, a");
  if (!t) return;

  if (t.dataset.handle) {
    const a = state.alerts.find((x) => x.id === t.dataset.handle);
    a.handled = true;
    if (LIVE) fs.updateDoc(fs.doc(db, "events", a.id), { handled: true }).catch(() => toast("Could not save"));
    renderAlerts();
    addTimeline(`You responded: ${a.title.toLowerCase()}`);
    toast("Marked as handled");
  }
  if (t.dataset.details) { showAnalysis(state.analysis[t.dataset.details] ? t.dataset.details : t.dataset.details === "eating" ? "food" : "pain"); location.hash = "#analysis"; }
  if (t.dataset.give) {
    const d = state.doses.find((x) => x.id === t.dataset.give);
    d.given = nowTime();
    if (LIVE) fs.setDoc(fs.doc(db, "doses", dayKey(new Date()) + "_" + d.id), { given: fs.Timestamp.now() }).catch(() => toast("Could not save"));
    renderHomeDoses();
    addTimeline(`${d.label} given`);
    toast(tr("{label} marked as given", { label: tr(d.label) }));
  }
  if (t.dataset.day) { selectedDay = Number(t.dataset.day); renderDays(); }
  if (t.dataset.k)   { showAnalysis(t.dataset.k); }
  if (t.dataset.card) { showAnalysis(t.dataset.card); }
  if (t.dataset.range) { anaRange = t.dataset.range; renderAnalysis(); }
  if (t.dataset.filter) { notifFilter = t.dataset.filter; renderNotifs(); }
  if (t.id === "copySummary") copySummary();
  if (t.dataset.log) { openLog(t.dataset.log); }
  if (t.id === "editSchedule") openSched();
  if (t.id === "editList") { editingList = !editingList; pendingDel = null; renderMedList(); }
  if (t.id === "addMed") openMedDialog(null);
  if (t.dataset.medEdit) openMedDialog(t.dataset.medEdit);
  if (t.dataset.medDel) {
    const id = t.dataset.medDel;
    if (pendingDel === id) {
      medList = medList.filter((m) => m.id !== id); saveMeds(); pendingDel = null;
      renderMedList(); renderDays(); toast("Medicine removed");
    } else {
      pendingDel = id; renderMedList();
      clearTimeout(delTimer); delTimer = setTimeout(() => { pendingDel = null; renderMedList(); }, 3000);
    }
  }
  if (t.dataset.tglDay !== undefined) {
    const i = Number(t.dataset.tglDay);
    medDraft.days = medDraft.days.includes(i) ? medDraft.days.filter((x) => x !== i) : [...medDraft.days, i];
    drawToggles();
  }
  if (t.dataset.tglTime) {
    const id = t.dataset.tglTime;
    medDraft.times = medDraft.times.includes(id) ? medDraft.times.filter((x) => x !== id) : [...medDraft.times, id];
    drawToggles();
  }
  if (t.id === "clearTimeline" || t.id === "clearNotifs") {
    const k = t.id === "clearTimeline" ? "timeline" : "notifs";
    clearedAt[k] = Date.now(); saveCleared();
    if (LIVE) rebuild(); else { state[k] = []; renderTimeline(); renderNotifs(); }
    toast(k === "timeline" ? "Timeline cleared" : "Notifications cleared");
  }
  if (t.dataset.restore) {
    clearedAt[t.dataset.restore] = 0; saveCleared();
    if (LIVE) rebuild(); else location.reload();
  }
  if (t.id === "callDoctor" && !settings.doctor) toast("Add the doctor's number in Settings first");
});

/* ---------- Quick log dialog ---------- */
const dialog = $("#logDialog");
let logType = "";

function openLog(type) {
  logType = type;
  $("#logTitle").textContent = tr("Log {type}", { type: tr(type).toLowerCase() });
  $("#logText").value = "";
  dialog.showModal();
}

dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "save") return;
  const extra = $("#logText").value.trim();
  addTimeline(`${logType} logged by you${extra ? ": " + extra : ""}`);
  toast(tr("{type} logged", { type: tr(logType) }));
});

/* =========================================================
   FIREBASE (live data). Runs only when firebase-config.js has real keys.
   Collections: events, meds, doses, logs, insights (see DATA_CONTRACT.md)
   ========================================================= */
const CFG = window.JAGA_CONFIG || {};
const LIVE = !!(CFG.firebase && !String(CFG.firebase.apiKey).startsWith("PASTE"));
const FB = "https://www.gstatic.com/firebasejs/10.14.1/";
let fs, db, events = [], meds = {}, doseDocs = {}, logs = [], aiDoc = null, firstEv = true;

const TITLES = { pain: "Patient may be in pain", toilet: "Patient needs toilet", eating: "Patient wants to eat", general: "Patient needs help" };
const D = (v) => (v && v.toDate ? v.toDate() : v ? new Date(v) : new Date());
const dayKey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const midnight = (off = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
const minsAgo = (d) => Math.max(0, Math.floor((Date.now() - d) / 6e4));
const clock = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const when = (d) => (minsAgo(d) < 60 ? ago(minsAgo(d)) : clock(d));
// a vs b: normally "up" = watch, "down" = good (inv flips it, e.g. for meals)
const cmp = (a, b, than, inv) => {
  const up = a > b;
  return { level: a === b ? "ok" : up !== !!inv ? "watch" : "good", text: a === b ? tr("Same as " + than) : tr((up ? "Up" : "Down") + " from {b} " + than, { b }) };
};

function series(type, range) {
  const d0 = midnight(), labels = [], v = [];
  if (range === "today") {
    ["6a", "9a", "12p", "3p", "6p", "9p"].forEach((l) => { labels.push(l); v.push(0); });
    events.forEach((e) => { if (e.type === type && e.ts >= d0) v[Math.min(5, Math.max(0, Math.floor((e.ts.getHours() - 6) / 3)))]++; });
  } else {
    for (let i = 6; i >= 0; i--) { labels.push(midnight(-i).toLocaleDateString(LANG === "ms" ? "ms-MY" : [], { weekday: "short" })); v.push(0); }
    events.forEach((e) => {
      if (e.type !== type) return;
      const k = Math.round((d0 - new Date(e.ts.getFullYear(), e.ts.getMonth(), e.ts.getDate())) / 864e5);
      if (k >= 0 && k < 7) v[6 - k]++;
    });
  }
  return { labels, vals: v };
}
const describe = (s, word) => {
  const n = s.vals.reduce((a, b) => a + b, 0), top = Math.max(...s.vals);
  return n ? tr("{n} " + word + ", most at {at}", { n, at: s.labels[s.vals.indexOf(top)] }) : tr("No " + word + " recorded");
};

/* Turn the raw Firestore data into the shapes the screens already use */
function rebuild() {
  const d0 = midnight(), y0 = midnight(-1), w0 = midnight(-6), p0 = midnight(-13);
  const count = (type, from, to = Infinity) => events.filter((e) => e.type === type && e.ts >= from && e.ts < to).length;

  state.alerts = events.filter((e) => Date.now() - e.ts < 72e5).slice(0, 8)
    .map((e) => ({ id: e.id, kind: e.type, title: TITLES[e.type] || e.type, mins: minsAgo(e.ts), handled: !!e.handled }));
  state.doses.forEach((x) => { const g = doseDocs[dayKey(new Date()) + "_" + x.id]; x.given = g ? clock(g) : null; });
  state.timeline = events.filter((e) => e.ts >= d0).map((e) => ({ t: e.ts, text: TITLES[e.type] || e.type }))
    .concat(logs.filter((l) => l.ts >= d0).map((l) => ({ t: l.ts, text: l.text })))
    .sort((a, b) => b.t - a.t).filter((x) => +x.t > clearedAt.timeline).map((x) => ({ text: x.text, time: when(x.t), t: x.t }));
  state.notifs = events.slice(0, 30).map((e) => ({ t: e.ts, kind: e.type, title: TITLES[e.type] || e.type }))
    .concat(Object.entries(doseDocs).map(([k, g]) => ({ t: g, kind: "meds", title: k.endsWith("_am") ? "Morning dose given" : "Night dose given" })))
    .sort((a, b) => b.t - a.t).slice(0, 30).filter((n) => +n.t > clearedAt.notifs).map((n) => ({ kind: n.kind, title: n.title, time: when(n.t), t: n.t }));
  state.tiles = [["Pain", "pain"], ["Toilet", "toilet"], ["Food", "eating"], ["General", "general"]]
    .map(([name, k]) => ({ name, note: tr("{n} today", { n: count(k, d0) }) }));

  // tray: which days the medicine box was opened this week
  ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach((id, i) => {
    const m = meds[id];
    BOX[i] = m && m.opened && m.ts >= midnight(-((new Date().getDay() + 6) % 7)) ? 1 : 0;
  });

  // analysis: pain, toilet, food come from button presses
  const ov = { today: [], week: [] };
  [["pain", "pain", "spikes", false], ["toilet", "toilet", "visits", false], ["food", "eating", "meals", true]].forEach(([key, type, word, inv]) => {
    ["today", "week"].forEach((r) => {
      const s = series(type, r), cur = count(type, r === "today" ? d0 : w0), prev = r === "today" ? count(type, y0, d0) : count(type, p0, w0);
      const c = cmp(cur, prev, r === "today" ? "yesterday" : "the week before", inv), last = events.find((e) => e.type === type);
      const ins = [c];
      if (last) ins.push({ level: minsAgo(last.ts) < 60 ? "watch" : "ok", text: tr("The latest {kind} alert was {ago}.", { kind: tr(key), ago: ago(minsAgo(last.ts)) }) });
      if (aiDoc && aiDoc.text_en) ins.push({ level: "ok", text: tr("AI summary: {text}", { text: LANG === "ms" ? (aiDoc.text_ms || aiDoc.text_en) : aiDoc.text_en }) });
      state.analysis[key][r] = { labels: s.labels, vals: s.vals, sub: describe(s, word), insights: ins };
      ov[r].push({ key, name: key[0].toUpperCase() + key.slice(1), value: tr("{n} " + word, { n: cur }), trend: c.text, tone: c.level });
    });
  });

  // analysis: medicine comes from "Mark as given" + the tray
  const n = state.doses.length, g = state.doses.filter((x) => x.given).length, wl = series("x", "week").labels;
  const wv = wl.map((_, i) => { const k = dayKey(midnight(i - 6)); return Object.keys(doseDocs).filter((id) => id.startsWith(k)).length; });
  const wt = wv.reduce((a, b) => a + b, 0), box = BOX.map((b, i) => (b ? DAYS[i] : null)).filter(Boolean);
  const boxNote = { level: "ok", text: box.length ? tr("Medicine box opened on: {days}.", { days: box.map((d) => tr(d)).join(", ") }) : tr("Medicine box not opened this week.") };
  state.analysis.medicine.today = { labels: state.doses.map((x) => tr(x.label.split(" ")[0])), vals: state.doses.map((x) => (x.given ? 1 : 0)), sub: tr("{g} of {n} doses given", { g, n }),
    insights: [g === n ? { level: "good", text: tr("All doses given today.") } : { level: "watch", text: tr("{n} dose(s) still to give today.", { n: n - g }) }, boxNote] };
  state.analysis.medicine.week = { labels: wl, vals: wv, sub: tr("{g} of {n} doses given", { g: wt, n: n * 7 }),
    insights: [wt >= n * 7 ? { level: "good", text: tr("Every dose was marked as given this week.") } : { level: "watch", text: tr("{n} dose(s) not marked as given this week.", { n: n * 7 - wt }) }, boxNote] };
  ov.today.push({ key: "medicine", name: "Medicine", value: tr("{g} of {n} doses", { g, n }), trend: g === n ? tr("All given") : tr("Next dose due {t}", { t: state.doses.find((x) => !x.given).due }), tone: g === n ? "good" : "watch" });
  ov.week.push({ key: "medicine", name: "Medicine", value: tr("{g} of {n} given", { g: wt, n: n * 7 }), trend: wt >= n * 7 ? tr("Nothing missed") : tr("Some not marked"), tone: wt >= n * 7 ? "good" : "watch" });
  state.overview = ov;

  renderAlerts(); renderHomeDoses(); renderTiles(); renderTimeline(); renderDays(); renderAnalysis();
}

function notifyNew(type) {
  if (settings[type] === false) return;
  toast(tr("New alert: {title}", { title: tr(TITLES[type] || type) }));
  if (settings.push) { try { navigator.vibrate(type === "pain" ? [200, 100, 200] : 100); } catch (e) {} }
  playSound(type === "pain" ? "pain" : type === "toilet" ? "toilet" : "info");
}

/* ---------- Sounds (made in the browser, no audio files needed) ---------- */
let audioCtx = null;
function beep(freq, at, len, vol, type) {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime + at;
  o.type = type || "sine"; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + len + 0.02);
}
function playSound(kind) {
  if (settings.sound === false) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (kind === "tap")    beep(660, 0, 0.07, 0.08);
    if (kind === "pain")   [0, 0.22, 0.44].forEach((t, i) => beep(i % 2 ? 660 : 880, t, 0.18, 0.25, "square"));
    if (kind === "toilet") { beep(660, 0, 0.2, 0.2); beep(880, 0.2, 0.3, 0.2); }
    if (kind === "info")   beep(784, 0, 0.3, 0.15);
  } catch (e) {}
}
/* a soft click on every button or link */
document.addEventListener("click", (e) => {
  const b = e.target.closest("button, a, .tile");
  if (b && !b.disabled) playSound("tap");
}, true);

async function startFirebase() {
  const app = await import(FB + "firebase-app.js");
  fs = await import(FB + "firebase-firestore.js");
  db = fs.getFirestore(app.initializeApp(CFG.firebase));
  const on = (q, fn) => fs.onSnapshot(q, fn, () => toast("Connection problem"));
  on(fs.query(fs.collection(db, "events"), fs.orderBy("ts", "desc"), fs.limit(500)), (s) => {
    events = s.docs.map((d) => ({ id: d.id, type: d.data().type, ts: D(d.data().ts), handled: d.data().handled }));
    if (!firstEv) s.docChanges().forEach((c) => { if (c.type === "added") notifyNew(c.doc.data().type); });
    firstEv = false; rebuild();
  });
  on(fs.collection(db, "meds"), (s) => { meds = {}; s.forEach((d) => { meds[d.id] = { opened: !!d.data().opened, ts: D(d.data().ts) }; }); rebuild(); });
  on(fs.collection(db, "doses"), (s) => { doseDocs = {}; s.forEach((d) => { doseDocs[d.id] = D(d.data().given); }); rebuild(); });
  on(fs.query(fs.collection(db, "logs"), fs.orderBy("ts", "desc"), fs.limit(100)), (s) => { logs = s.docs.map((d) => ({ text: d.data().text, ts: D(d.data().ts) })); rebuild(); });
  on(fs.query(fs.collection(db, "insights"), fs.orderBy("createdAt", "desc"), fs.limit(1)), (s) => { aiDoc = s.empty ? null : s.docs[0].data(); rebuild(); });
}

/* "Refresh AI summary" button: asks the Cloud Function to write a new insight */
document.addEventListener("click", async (e) => {
  if (e.target.id !== "refreshAI") return;
  if (!CFG.insightUrl) { toast("AI function not connected yet"); return; }
  toast("Asking the AI...");
  try { await fetch(CFG.insightUrl, { method: "POST" }); toast("Summary updated"); } catch (err) { toast("Could not reach the AI"); }
});

/* ---------- Language toggle (EN / BM) ---------- */
function renderAll() {
  fillSettings(); renderGreeting(); renderAlerts(); renderHomeDoses(); renderTiles();
  renderTimeline(); renderDays(); renderMedList(); renderAnalysis();
}
window.onLang = () => { if (LIVE) rebuild(); else renderAll(); renderGreeting(); renderMedList(); fillSettings(); };
$("#langBtn").addEventListener("click", () => setLang(LANG === "ms" ? "en" : "ms"));

/* ---------- Start ---------- */
fillSettings();
renderGreeting();
renderAlerts();
renderHomeDoses();
renderTiles();
renderTimeline();
renderDays();
renderMedList();
renderAnalysis();
route();
if (LIVE) { rebuild(); startFirebase().catch(() => toast("Could not connect to Firebase")); }
translateStatic();


/* ---------- Splash (logo shows briefly when the app opens) ---------- */
(function () {
  const logo = document.querySelector(".top .logo");
  if (!logo) return;
  const sp = document.createElement("div");
  sp.id = "splash";
  sp.innerHTML = `<img src="${logo.src}" alt=""><p>JAGA</p>`;
  document.body.appendChild(sp);
  setTimeout(() => sp.classList.add("out"), 1400);
  setTimeout(() => sp.remove(), 2000);
})();
