/* =========================================================
   JAGA – English / Bahasa Melayu
   tr("English text", {vars})  -> returns Malay when the language is BM.
   To fix a translation, edit the Malay side (right) in MS below.
   ========================================================= */
const MS = {
  /* navigation + page titles */
  "Home": "Utama", "Medicine": "Ubat", "Analysis": "Analisis", "Settings": "Tetapan",
  "Main": "Utama", "Language": "Bahasa", "JAGA logo": "Logo JAGA",
  "Care Dashboard": "Papan Pemuka Penjagaan", "Monitoring:": "Memantau:", "Patient name": "Nama pesakit",
  "Resting": "Berehat", "Updated just now": "Baru dikemas kini",

  /* home */
  "Good morning!": "Selamat pagi!", "Good afternoon!": "Selamat petang!", "Good evening!": "Selamat malam!",
  "Needs your attention": "Perlu perhatian anda",
  "Medicine to give today": "Ubat untuk diberi hari ini",
  "AI analysis today": "Analisis AI hari ini",
  "Quick log": "Catatan pantas",
  "Food": "Makanan", "Toilet": "Tandas", "Note": "Nota", "Pain": "Sakit", "General": "Umum",
  "Today's timeline": "Garis masa hari ini",
  "Patient may be in pain": "Pesakit mungkin sakit",
  "Patient needs toilet": "Pesakit perlu ke tandas",
  "Patient wants to eat": "Pesakit mahu makan",
  "Patient needs help": "Pesakit perlukan bantuan",
  "You are on it": "Anda sedang menguruskannya", "Responding": "Sedang bertindak",
  "I'm checking": "Saya periksa", "I'm helping": "Saya bantu", "Details": "Butiran",
  "No alerts right now.": "Tiada amaran buat masa ini.",
  "Morning dose": "Dos pagi", "Night dose": "Dos malam", "Morning": "Pagi", "Night": "Malam",
  "Given {t}": "Diberi {t}", "Due {t}": "Dijadualkan {t}",
  "Mark {label} as given": "Tandakan {label} sebagai diberi",
  "{n} today": "{n} hari ini",
  "{n} min ago": "{n} minit lalu", "{n} mins ago": "{n} minit lalu", "Just now": "Baru sebentar tadi",

  /* medicine page */
  "My medicine list": "Senarai ubat saya", "Edit list": "Sunting senarai", "Edit schedule": "Sunting jadual",
  "Day of the week": "Hari dalam minggu",
  "Mon": "Isn", "Tue": "Sel", "Wed": "Rab", "Thu": "Kha", "Fri": "Jum", "Sat": "Sab", "Sun": "Ahd",
  "{n} dose": "{n} dos", "{n} doses": "{n} dos", "Dose {i}": "Dos {i}",
  "Medicine box opened {n} time.": "Kotak ubat dibuka {n} kali.",
  "Medicine box opened {n} times.": "Kotak ubat dibuka {n} kali.",
  "Medicine box opened on: {days}.": "Kotak ubat dibuka pada: {days}.",
  "Medicine box not opened this week.": "Kotak ubat tidak dibuka minggu ini.",
  "Medicine A": "Ubat A", "Medicine B": "Ubat B", "Medicine C": "Ubat C",
  "Every day": "Setiap hari", "Sunday": "Ahad", "Mon, Wed, Fri": "Isn, Rab, Jum",

  /* analysis page */
  "AI analysis": "Analisis AI", "Today": "Hari ini", "Last 7 days": "7 hari lepas",
  "Time range": "Julat masa", "Topic": "Topik", "Highest": "Tertinggi",
  "{topic} today": "{topic} hari ini", "{topic} in the last 7 days": "{topic} dalam 7 hari lepas",
  "{topic} chart. {sub}": "Carta {topic}. {sub}",
  "What the AI noticed": "Apa yang AI perhatikan", "Refresh AI summary": "Muat semula ringkasan AI",
  "Keep an eye on this": "Perlu diberi perhatian", "Good news": "Berita baik", "Noted": "Dicatat",
  "Things to consider": "Perkara untuk dipertimbangkan",
  "Share with the doctor": "Kongsi dengan doktor",
  "Copy a short summary you can paste into a message.": "Salin ringkasan pendek untuk ditampal dalam mesej.",
  "Copy summary": "Salin ringkasan",
  "Notifications": "Notifikasi", "Notification type": "Jenis notifikasi", "All": "Semua",
  "Nothing here yet.": "Belum ada apa-apa lagi.",
  "Morning dose given": "Dos pagi diberi", "Night dose given": "Dos malam diberi",
  "pain": "sakit", "toilet": "tandas", "food": "makanan",
  "The latest {kind} alert was {ago}.": "Amaran {kind} terkini ialah {ago}.",
  "AI summary: {text}": "Ringkasan AI: {text}",

  "Same as yesterday": "Sama seperti semalam", "Same as the week before": "Sama seperti minggu sebelumnya",
  "Up from {b} yesterday": "Naik (semalam: {b})", "Down from {b} yesterday": "Turun (semalam: {b})",
  "Up from {b} the week before": "Naik (minggu sebelumnya: {b})", "Down from {b} the week before": "Turun (minggu sebelumnya: {b})",

  "{n} spikes": "{n} lonjakan", "{n} visits": "{n} kali", "{n} meals": "{n} hidangan",
  "{n} spikes, most at {at}": "{n} lonjakan, paling banyak pada {at}",
  "{n} visits, most at {at}": "{n} kali, paling banyak pada {at}",
  "{n} meals, most at {at}": "{n} hidangan, paling banyak pada {at}",
  "No spikes recorded": "Tiada lonjakan direkodkan",
  "No visits recorded": "Tiada lawatan tandas direkodkan",
  "No meals recorded": "Tiada makanan direkodkan",

  "{g} of {n} doses given": "{g} daripada {n} dos diberi",
  "{g} of {n} doses": "{g} daripada {n} dos",
  "{g} of {n} given": "{g} daripada {n} diberi",
  "All doses given today.": "Semua dos telah diberi hari ini.",
  "{n} dose(s) still to give today.": "{n} dos lagi perlu diberi hari ini.",
  "Every dose was marked as given this week.": "Setiap dos ditandakan sebagai diberi minggu ini.",
  "{n} dose(s) not marked as given this week.": "{n} dos tidak ditandakan sebagai diberi minggu ini.",
  "All given": "Semua diberi", "Next dose due {t}": "Dos seterusnya {t}",
  "Nothing missed": "Tiada yang tertinggal", "Some not marked": "Ada yang belum ditandakan",

  "Note what the patient was doing before each spike.": "Catat apa yang pesakit lakukan sebelum setiap lonjakan sakit.",
  "Tell the doctor if pain keeps happening at the same time.": "Beritahu doktor jika sakit sering berlaku pada waktu yang sama.",
  "Offer water through the day.": "Tawarkan air sepanjang hari.",
  "Tell the doctor if visits suddenly increase or decrease.": "Beritahu doktor jika kekerapan ke tandas tiba-tiba bertambah atau berkurang.",
  "Log meals soon after serving so the AI stays accurate.": "Catat makanan sejurus selepas dihidang supaya AI kekal tepat.",
  "Tell the doctor if the patient keeps leaving meals unfinished.": "Beritahu doktor jika pesakit sering tidak menghabiskan makanan.",
  "Set the night dose reminder 15 minutes early.": "Tetapkan peringatan dos malam 15 minit lebih awal.",
  "Check the medicine box against the schedule if a dose is missed.": "Semak kotak ubat berbanding jadual jika ada dos yang tertinggal.",

  "{name} - today summary": "{name} - ringkasan hari ini",
  "{name} - last 7 days summary": "{name} - ringkasan 7 hari lepas",
  "AI notes:": "Nota AI:",

  /* settings */
  "Doctor's phone number": "Nombor telefon doktor", "e.g. 012-345 6789": "cth. 012-345 6789",
  "Alerts I want to get": "Amaran yang saya mahu terima",
  "Toilet time": "Waktu tandas", "Medicine reminders": "Peringatan ubat", "Phone notifications": "Notifikasi telefon",
  "Save changes": "Simpan perubahan",

  /* emergency bar + log dialog */
  "Call doctor": "Hubungi doktor", "Emergency 999": "Kecemasan 999",
  "Details (optional)": "Butiran (pilihan)", "Cancel": "Batal", "Save log": "Simpan catatan", "Log": "Catat",
  "e.g. Ate half a bowl of porridge": "cth. Makan separuh mangkuk bubur",
  "Log {type}": "Catat {type}", "{type} logged": "{type} dicatat", "{type} logged by you": "{type} dicatat oleh anda",
  "You responded: {x}": "Anda bertindak: {x}",
  "{label} marked as given": "{label} ditandakan sebagai diberi",

  /* settings: caregiver, patient, contacts */
  "Monitoring": "Memantau",
  "Caregiver": "Penjaga", "Your name": "Nama anda", "Your relationship to the patient": "Hubungan anda dengan pesakit",
  "Not set": "Belum ditetapkan", "Daughter": "Anak perempuan", "Son": "Anak lelaki", "Spouse": "Pasangan",
  "Relative": "Saudara", "Helper or nurse": "Pembantu atau jururawat", "Other": "Lain-lain",
  "Patient": "Pesakit", "Age": "Umur", "Doctor's notes": "Nota doktor",
  "Emergency contacts": "Hubungan kecemasan", "Family contact name": "Nama ahli keluarga", "Family contact phone": "Telefon ahli keluarga",
  "e.g. Aisyah": "cth. Aisyah", "e.g. 78": "cth. 78", "e.g. Brother Amir": "cth. Abang Amir", "e.g. 013-456 7890": "cth. 013-456 7890",
  "e.g. Allergic to penicillin. Uses a walking frame.": "cth. Alah penisilin. Guna rangka berjalan.",
  "{n} yrs": "{n} tahun", "Call family": "Hubungi keluarga", "Call {name}": "Hubungi {name}",
  "Doctor's notes:": "Nota doktor:", "Caregiver:": "Penjaga:",
  "Schedule for {d}": "Jadual untuk {d}", "Schedule saved": "Jadual disimpan",
  "Choose which medicines are given on this day.": "Pilih ubat yang diberi pada hari ini.",
  "Monday": "Isnin", "Tuesday": "Selasa", "Wednesday": "Rabu", "Thursday": "Khamis", "Friday": "Jumaat", "Saturday": "Sabtu",
  "Afternoon": "Tengah hari", "Done": "Selesai", "Edit": "Sunting", "Remove": "Buang", "Tap again to remove": "Tekan lagi untuk buang",
  "Add medicine": "Tambah ubat", "+ Add medicine": "+ Tambah ubat", "Edit medicine": "Sunting ubat",
  "Medicine name": "Nama ubat", "Strength (optional)": "Kekuatan (pilihan)", "Days": "Hari", "Times": "Waktu",
  "Note (optional)": "Nota (pilihan)", "Save": "Simpan",
  "e.g. Paracetamol": "cth. Paracetamol", "e.g. 500 mg": "cth. 500 mg", "e.g. After food": "cth. Selepas makan",
  "Pick at least one day and one time": "Pilih sekurang-kurangnya satu hari dan satu waktu",
  "Medicine saved": "Ubat disimpan", "Medicine removed": "Ubat dibuang",
  "Clear all": "Kosongkan semua", "Timeline cleared": "Garis masa dikosongkan", "Notifications cleared": "Notifikasi dikosongkan",
  "Show cleared items": "Papar item yang dikosongkan",
  "Medicine box opened": "Kotak ubat dibuka", "Box opened": "Kotak dibuka", "Box not opened": "Kotak belum dibuka",
  "No medicine scheduled for this day.": "Tiada ubat dijadualkan untuk hari ini.",
  "{n} dose time": "{n} waktu dos", "{n} dose times": "{n} waktu dos", "{n} medicine": "{n} ubat", "{n} medicines": "{n} ubat",
  "No medicines yet. Tap Edit list to add one.": "Belum ada ubat. Tekan Sunting senarai untuk menambah.",
  "Sample medicines for the demo. Always follow the doctor's instructions.": "Contoh ubat untuk demo. Sentiasa ikut arahan doktor.",

  /* messages */
  "New alert: {title}": "Amaran baru: {title}",
  "Could not save": "Tidak dapat disimpan", "Marked as handled": "Ditandakan sudah diuruskan",
  "Summary copied": "Ringkasan disalin", "Could not copy. Try again.": "Tidak dapat menyalin. Cuba lagi.",
  "Changes saved": "Perubahan disimpan", "Editing is coming soon": "Penyuntingan akan datang",
  "Add the doctor's number in Settings first": "Tambah nombor doktor di Tetapan dahulu",
  "Connection problem": "Masalah sambungan", "Could not connect to Firebase": "Tidak dapat bersambung ke Firebase",
  "AI function not connected yet": "Fungsi AI belum disambungkan",
  "Asking the AI...": "Meminta AI...", "Summary updated": "Ringkasan dikemas kini",
  "Could not reach the AI": "Tidak dapat menghubungi AI",
};

let LANG = "en";
try { if (localStorage.getItem("jaga-lang") === "ms") LANG = "ms"; } catch (e) {}

/* tr("Up from {b} yesterday", {b: 3}) */
function tr(key, vars) {
  let s = LANG === "ms" && MS[key] !== undefined ? MS[key] : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, n) => (n in vars ? vars[n] : m));
  return s;
}

/* Translate the fixed text already written in index.html (and any leftover text that matches a key) */
function translateStatic() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    if (n._en === undefined) {
      const k = n.nodeValue.trim();
      if (!k || MS[k] === undefined) return;
      n._en = n.nodeValue;
    }
    const k = n._en.trim();
    n.nodeValue = LANG === "ms" ? n._en.replace(k, MS[k]) : n._en;
  });
  document.querySelectorAll("[placeholder],[aria-label]").forEach((el) => {
    ["placeholder", "aria-label"].forEach((a) => {
      if (!el.hasAttribute(a)) return;
      const key = "_en_" + a;
      if (el[key] === undefined) {
        const v = el.getAttribute(a);
        if (MS[v] === undefined) return;
        el[key] = v;
      }
      el.setAttribute(a, LANG === "ms" ? MS[el[key]] : el[key]);
    });
  });
  document.documentElement.lang = LANG;
  const b = document.getElementById("langBtn");
  if (b) b.textContent = LANG === "ms" ? "EN" : "BM";
}

function setLang(l) {
  LANG = l;
  try { localStorage.setItem("jaga-lang", l); } catch (e) {}
  if (window.onLang) window.onLang();   // app.js re-draws the screens
  translateStatic();
}
