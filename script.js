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
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");
  // Fallback if the browser blocks the new tab
  note.textContent = "If WhatsApp didn't open, ";
  const link = document.createElement("a");
  link.href = url; link.target = "_blank"; link.rel = "noopener";
  link.textContent = "tap here to open it"; link.style.textDecoration = "underline";
  note.append(link, ".");
});

// Package buttons preselect the form option
document.querySelectorAll("[data-package]").forEach((a) =>
  a.addEventListener("click", () => {
    document.querySelector('#audit-form [name="package"]').value = a.dataset.package;
  })
);

document.getElementById("yr").textContent = new Date().getFullYear();

// Mobile menu
(function () {
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  const close = () => { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

// Header shadow once the page scrolls
(function () {
  const header = document.querySelector(".nav");
  const on = () => header.classList.toggle("scrolled", window.scrollY > 8);
  on();
  window.addEventListener("scroll", on, { passive: true });
})();

// Scroll reveal: short, ease-out, once. Skipped for reduced motion.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const groups = ".hero > *, .sec-head, .section > h2, .section > .lead, .section > .eyebrow, .tile, .line, .pack, .stand, .record-card, .chips, .how-photo, .steps li, .grid3 > *, .offer, .faq details, .form";
  const els = [...document.querySelectorAll(groups)];
  els.forEach((el) => {
    el.classList.add("reveal");
    const i = [...el.parentElement.children].filter((c) => c.classList.contains("reveal") || els.includes(c)).indexOf(el);
    el.style.transitionDelay = Math.min(i, 5) * 60 + "ms";
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
      en.target.addEventListener("transitionend", () => { en.target.style.transitionDelay = ""; }, { once: true });
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach((el) => io.observe(el));
})();
