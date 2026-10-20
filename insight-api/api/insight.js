/* =========================================================
   JAGA AI insight function (Vercel serverless, Node 18+)
   POST /api/insight
   1. reads the last 7 days of "events" from Firestore (REST)
   2. counts presses per type, today vs the daily average
   3. asks Claude for a short summary in English + Bahasa Melayu
   4. saves it to "insights" and returns it as JSON
   If Claude is unavailable, a plain summary built by code is used,
   so the demo never shows an empty box.

   Environment variables (set in Vercel, never in code):
     ANTHROPIC_API_KEY   your Claude API key
     FIREBASE_PROJECT_ID same as projectId in firebase-config.js
     FIREBASE_API_KEY    same as apiKey in firebase-config.js
     CLAUDE_MODEL        optional, default claude-haiku-5-5
   ========================================================= */

const TYPES = ["toilet", "eating", "pain", "general"];
const MY_OFFSET_MS = 8 * 60 * 60 * 1000; // Malaysia = UTC+8

const cors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const dayKey = (ms) => new Date(ms + MY_OFFSET_MS).toISOString().slice(0, 10);

/* ---------- Firestore (REST) ---------- */
function fsBase() {
  return `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

async function readEvents(sinceIso) {
  const url = `${fsBase()}:runQuery?key=${process.env.FIREBASE_API_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "events" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "ts" },
          op: "GREATER_THAN_OR_EQUAL",
          value: { timestampValue: sinceIso },
        },
      },
      limit: 2000,
    },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Firestore read failed: HTTP ${r.status} ${await r.text()}`);
  const rows = await r.json();
  return rows
    .filter((x) => x.document)
    .map((x) => ({
      type: x.document.fields?.type?.stringValue,
      ts: Date.parse(x.document.fields?.ts?.timestampValue),
    }))
    .filter((e) => TYPES.includes(e.type) && !Number.isNaN(e.ts));
}

async function saveInsight(doc) {
  const url = `${fsBase()}/insights?key=${process.env.FIREBASE_API_KEY}`;
  const stats = {};
  for (const [k, v] of Object.entries(doc.stats.week)) stats[k] = { integerValue: String(v) };
  const body = {
    fields: {
      createdAt: { timestampValue: new Date().toISOString() },
      text_en: { stringValue: doc.text_en },
      text_ms: { stringValue: doc.text_ms },
      stats: { mapValue: { fields: stats } },
    },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Firestore write failed: HTTP ${r.status} ${await r.text()}`);
}

/* ---------- Stats ---------- */
function buildStats(events, nowMs) {
  const today = dayKey(nowMs);
  const week = Object.fromEntries(TYPES.map((t) => [t, 0]));
  const todayCt = Object.fromEntries(TYPES.map((t) => [t, 0]));
  const prior = Object.fromEntries(TYPES.map((t) => [t, 0]));
  for (const e of events) {
    week[e.type]++;
    if (dayKey(e.ts) === today) todayCt[e.type]++;
    else prior[e.type]++;
  }
  // average per day over the 6 days before today
  const avg = Object.fromEntries(TYPES.map((t) => [t, Math.round((prior[t] / 6) * 10) / 10]));
  return { week, today: todayCt, dailyAvg: avg, total: events.length };
}

/* ---------- Fallback summary (no AI) ---------- */
function fallbackText(s) {
  const name = { toilet: "toilet", eating: "eating", pain: "pain", general: "general" };
  const nameMs = { toilet: "tandas", eating: "makan", pain: "sakit", general: "umum" };
  const en = `In the last 7 days: ` +
    TYPES.map((t) => `${s.week[t]} ${name[t]}`).join(", ") +
    `. Today: ${s.today.pain} pain and ${s.today.toilet} toilet requests (daily average ${s.dailyAvg.pain} and ${s.dailyAvg.toilet}). ` +
    `These are patterns only, not a diagnosis. Please discuss any changes with a doctor.`;
  const ms = `Dalam 7 hari lepas: ` +
    TYPES.map((t) => `${s.week[t]} ${nameMs[t]}`).join(", ") +
    `. Hari ini: ${s.today.pain} sakit dan ${s.today.toilet} tandas (purata harian ${s.dailyAvg.pain} dan ${s.dailyAvg.toilet}). ` +
    `Ini hanya corak, bukan diagnosis. Sila bincangkan sebarang perubahan dengan doktor.`;
  return { text_en: en, text_ms: ms };
}

/* ---------- Claude ---------- */
const SYSTEM = `You help a family caregiver who looks after a bedridden parent.
You receive counts of button presses the parent made: toilet, eating, pain, general.
Rules:
- Describe PATTERNS only (counts, today vs the daily average, trends).
- NEVER diagnose, name diseases, or recommend medicines or doses.
- If pain or toilet counts look higher than the average, say so calmly and suggest the caregiver talk to a doctor.
- If everything looks normal, say that kindly and briefly.
- Warm, plain language. Maximum 3 sentences per language.
- Write the same message in English and in Bahasa Melayu.
Reply with ONLY valid JSON: {"text_en": "...", "text_ms": "..."}`;

async function askClaude(stats) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-haiku-5-5",
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            "Counts for the last 7 days, today so far, and the average per day over the 6 days before today:\n" +
            JSON.stringify(stats, null, 2),
        },
      ],
    }),
  });
  if (!r.ok) throw new Error(`Claude failed: HTTP ${r.status} ${await r.text()}`);
  const data = await r.json();
  const raw = (data.content || []).map((b) => b.text || "").join("");
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Claude reply had no JSON");
  const j = JSON.parse(m[0]);
  if (!j.text_en || !j.text_ms) throw new Error("Claude JSON missing fields");
  return { text_en: String(j.text_en), text_ms: String(j.text_ms) };
}

/* ---------- Handler ---------- */
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_API_KEY) {
      return res.status(500).json({ error: "Missing FIREBASE_PROJECT_ID or FIREBASE_API_KEY" });
    }
    const now = Date.now();
    const events = await readEvents(new Date(now - 7 * 24 * 3600 * 1000).toISOString());
    const stats = buildStats(events, now);

    let text, source = "claude";
    if (stats.total === 0) {
      text = {
        text_en: "No button presses in the last 7 days yet, so there is nothing to summarise.",
        text_ms: "Belum ada tekanan butang dalam 7 hari lepas, jadi tiada apa untuk diringkaskan.",
      };
      source = "empty";
    } else {
      try {
        if (!process.env.ANTHROPIC_API_KEY) throw new Error("No ANTHROPIC_API_KEY");
        text = await askClaude(stats);
      } catch (err) {
        console.error(err.message);
        text = fallbackText(stats);
        source = "fallback";
      }
    }

    const out = { ...text, stats };
    await saveInsight(out);
    return res.status(200).json({ ok: true, source, ...out });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports._test = { buildStats, fallbackText, dayKey };
