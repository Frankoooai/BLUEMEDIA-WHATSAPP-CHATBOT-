// ---- CONFIG: set these to real values before launch ----
const CONFIG = {
  // Must be a REAL deadline you will honour. Don't use a fake rolling timer.
  deadline: "2026-11-30T23:59:59+03:00",
  whatsappNumber: "254182832454", // international format, no "+"
  // Enquiry form goes to this inbox (via FormSubmit.co, no server needed)
  formEmail: "consultancy@decentimagemedia.com",
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

// Audit form -> consultancy inbox (email)
(function () {
  const form = document.getElementById("audit-form");
  const note = document.getElementById("form-note");
  const btn = form.querySelector('button[type="submit"]');
  const btnText = btn.textContent;
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    note.classList.remove("ok", "err");
    if (!f.name.value.trim() || !f.business.value.trim() || !f.industry.value) {
      note.textContent = "Please add your name, business and industry.";
      note.classList.add("err");
      return;
    }
    if (!validEmail(f.email.value.trim())) {
      note.textContent = "Please add a valid email address so we can reply.";
      note.classList.add("err");
      f.email.focus();
      return;
    }
    if (f._honey.value) return; // bot

    const data = {
      Name: f.name.value.trim(),
      Email: f.email.value.trim(),
      Phone: f.phone.value.trim() || "Not given",
      Business: f.business.value.trim(),
      Industry: f.industry.value,
      "Interested in": f.package.value || "Free brand audit / not sure yet",
      "Website or Instagram": f.link.value.trim() || "Not given",
      _subject: "New enquiry from the website: " + f.business.value.trim(),
      _replyto: f.email.value.trim(),
      _template: "table",
      _captcha: "false",
    };

    btn.disabled = true;
    btn.textContent = "Sending…";
    note.textContent = "";
    try {
      const res = await fetch("https://formsubmit.co/ajax/" + CONFIG.formEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) === "false") throw new Error(out.message || res.status);
      form.reset();
      note.textContent = "Thank you. Your request is with our consultancy team, and we'll reply by email.";
      note.classList.add("ok");
    } catch (err) {
      const wa = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" +
        encodeURIComponent("Hello Decent Image Media, I tried to send a request on your website. My business is " + data.Business + ".");
      note.innerHTML = 'Sorry, that didn\'t send. Please try again in a moment, or <a href="' + wa +
        '" target="_blank" rel="noopener" style="text-decoration:underline">message us on WhatsApp</a>.';
      note.classList.add("err");
    } finally {
      btn.disabled = false;
      btn.textContent = btnText;
    }
  });
})();

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

// Contacts dropdown in the header
(function () {
  const btn = document.querySelector(".nav-drop-btn");
  const panel = document.getElementById("contacts-menu");
  if (!btn || !panel) return;
  const set = (open) => { panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); set(panel.hidden); });
  document.addEventListener("click", (e) => { if (!panel.hidden && !e.target.closest(".nav-drop")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { set(false); btn.focus(); } });
})();

// Address bar follows the section being read (#work, #services ...).
// At the top of the page it shows the plain address with no #.
(function () {
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll('#site-nav a[href^="#"]')];
  if (!sections.length || !history.replaceState) return;
  let current = location.hash.slice(1) || "";
  let ticking = false;

  function update() {
    ticking = false;
    const line = window.innerHeight * 0.35;
    let id = "";
    for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.id;
    if (window.scrollY < 40) id = "";
    if (id === current) return;
    current = id;
    history.replaceState(null, "", id ? "#" + id : location.pathname + location.search);
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  // When opened from a link like /#faq, leave the address alone until the visitor scrolls.
  if (!location.hash) update();
  else links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === location.hash));

  // Logo: smooth scroll to the top and clear the # from the address
  const logo = document.querySelector(".nav .logo");
  if (logo) logo.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
    current = "";
  });
})();
