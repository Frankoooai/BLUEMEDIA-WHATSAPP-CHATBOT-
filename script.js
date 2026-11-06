// ---- CONFIG: set these to real values before launch ----
const CONFIG = {
  // Must be a REAL deadline you will honour. Don't use a fake rolling timer.
  deadline: "2026-11-20T23:59:59+03:00",
  whatsappNumber: "254700000000", // international format, no "+"
  whatsappMessage: "Hello Decent Image Media, I'd like a private consultation about a WhatsApp concierge system.",
};

// Countdown
(function () {
  const el = document.getElementById("countdown");
  const end = new Date(CONFIG.deadline).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { el.textContent = "Intake closed"; return; }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    el.textContent = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  }
  tick();
  setInterval(tick, 1000);
})();

// WhatsApp link
document.getElementById("wa-link").href =
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;

document.getElementById("yr").textContent = new Date().getFullYear();
