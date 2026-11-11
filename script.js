// ---- CONFIG: set these to real values before launch ----
const CONFIG = {
  // Must be a REAL deadline you will honour. Don't use a fake rolling timer.
  deadline: "2026-11-30T23:59:59+03:00",
  whatsappNumber: "254181138760", // international format, no "+"
};

// Countdown
(function () {
  const el = document.getElementById("countdown");
  const end = new Date(CONFIG.deadline).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { el.textContent = "Closed"; return; }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    el.textContent = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  }
  tick();
  setInterval(tick, 1000);
})();

// Audit form -> WhatsApp (swap for a real form backend / CRM later)
document.getElementById("audit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const note = document.getElementById("form-note");
  if (!f.name.value.trim() || !f.business.value.trim() || !f.industry.value) {
    note.textContent = "Please add your name, business and industry.";
    return;
  }
  const msg =
    `Hello Decent Image Media, I'd like my free brand & marketing audit.\n` +
    `Name: ${f.name.value.trim()}\n` +
    `Business: ${f.business.value.trim()}\n` +
    `Industry: ${f.industry.value}\n` +
    `Interested in: ${f.package.value || "Not sure yet"}\n` +
    `Link: ${f.link.value.trim() || "n/a"}`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

// Package buttons preselect the form option
document.querySelectorAll("[data-package]").forEach((a) =>
  a.addEventListener("click", () => {
    document.querySelector('#audit-form [name="package"]').value = a.dataset.package;
  })
);

document.getElementById("yr").textContent = new Date().getFullYear();
