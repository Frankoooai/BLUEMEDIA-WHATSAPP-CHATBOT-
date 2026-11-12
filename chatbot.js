/* Decent Image Media: site assistant
   Answers basic questions from the list below. No server, no AI service.
   ------------------------------------------------------------------
   TO UPDATE AN ANSWER: edit the `a:` text. Keep it short and true.
   `chip` is the button label; `k` are the words that trigger the answer. */
(function () {
  const WHATSAPP = (typeof CONFIG !== "undefined" && CONFIG.whatsappNumber) || "254182832454";

  const ANSWERS = [
    {
      id: "pricing", chip: "Pricing",
      k: ["price", "pricing", "cost", "how much", "quote", "budget", "charge", "rates", "fee", "bei", "pesa"],
      // TODO(owner): add starting prices here once confirmed.
      a: "We quote every project to an agreed scope, so you only pay for what you need. Your quote lists the items, quantities, sizes, materials and installation. Tell us what you have in mind and we'll send a clear quote.",
    },
    {
      id: "timelines", chip: "Timelines",
      k: ["time", "timeline", "how long", "when", "deadline", "delivery", "turnaround", "urgent", "fast", "days", "weeks", "lead time"],
      // TODO(owner): add typical turnaround per service (print, signage, stands).
      a: "Timing depends on the scope. Print is quickest, while signage, fleet branding and exhibition stands need design, production and installation time. We confirm your delivery date in the proposal before any work starts. If you have an event date, tell us and we'll plan back from it.",
    },
    {
      id: "refunds", chip: "Refunds",
      k: ["refund", "money back", "cancel", "cancellation", "return", "deposit", "guarantee", "not happy", "reprint"],
      // TODO(owner): replace with your written refund and cancellation policy.
      a: "We're not finished until you're happy with what you've received. Refund and cancellation terms are set out in your proposal before you pay anything, and our team can walk you through them on WhatsApp.",
    },
    {
      id: "services", chip: "Services",
      k: ["service", "offer", "what do you do", "print", "signage", "sign", "banner", "merch", "uniform", "t-shirt", "card", "brochure", "billboard", "design", "website", "logo", "sticker", "mug", "cap", "gift", "3d", "shop"],
      a: "We handle branding end to end: office print and collateral, signage and large format, fleet branding and merchandise, creative design, and event branding with exhibition stands. One team designs, produces and installs.",
    },
    {
      id: "vehicles", chip: "Vehicle branding",
      k: ["van", "car", "truck", "lorry", "bus", "matatu", "pickup", "motorbike", "bike", "tuk", "vehicle", "fleet", "wrap", "livery", "gari"],
      a: "Yes, we brand vans, cars, trucks and whole fleets. Choose a full wrap, a partial wrap or consistent fleet livery. We design it, show you a mockup on your vehicle, then print and fit it. Tell us the vehicle type and how many, and we'll quote.",
    },
    {
      id: "stands", chip: "Exhibition stands",
      k: ["stand", "exhibition", "expo", "booth", "event", "backdrop", "tent", "gazebo", "stage", "trade show", "banner", "roll-up", "rollup", "pull-up", "roll", "teardrop", "flag", "feather", "telescopic", "pole"],
      a: "We build system stands (modular and reusable) and custom stands designed around your brand, plus roll-up banners, teardrop and telescopic flags, street pole banners, backdrops, tents and stage branding. We deliver, install and dismantle. Share your event and floor size for a quote.",
    },
    {
      id: "audit", chip: "Free audit",
      k: ["audit", "free", "review", "consult"],
      a: "The brand audit is free with no obligation. We review your print, signage, vehicles and online presence, then send your top five quick wins and a recommendation. Use the form at the bottom of this page to request one.",
    },
    {
      id: "contact", chip: "Talk to a person",
      k: ["human", "person", "call", "phone", "contact", "whatsapp", "talk", "speak", "agent", "email", "location", "where", "office", "hours", "open"],
      a: "Happy to connect you. Our team replies personally on WhatsApp.",
      handoff: true,
    },
  ];

  // The small greeting that pops up beside the buttons shortly after the page loads.
  const TEASER = "Hello, welcome to Decent Image Media. Looking for a quote or have a question? I can help.";
  const TEASER_DELAY_MS = 2500;

  const GREETING = "Hello, welcome to Decent Image Media. Ask me about pricing, timelines or refunds, or pick a topic below.";
  const FALLBACK = "I don't have a clear answer for that one. Our team can help you directly on WhatsApp.";

  // Whole-word match. Short words must match exactly (so "cap" doesn't hit "capital");
  // longer words also match their endings ("print" matches "printing").
  function matches(q, word) {
    const w = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tail = word.length >= 5 ? "\\w*" : "(s|es)?";
    return new RegExp("(^|\\s)" + w + tail + "(?=\\s|$)").test(q);
  }

  function findAnswer(text) {
    const q = " " + text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ") + " ";
    let best = null, score = 0;
    for (const item of ANSWERS) {
      const s = item.k.reduce((n, word) => n + (matches(q, word) ? word.length : 0), 0);
      if (s > score) { best = item; score = s; }
    }
    return best;
  }

  // ---------- UI ----------
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  const launcher = el("button", "chat-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "chat-panel");
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9.5L5 21v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg><span>Ask us</span>';

  const panel = el("section", "chat-panel");
  panel.id = "chat-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Decent Image Media assistant");

  const head = el("header", "chat-head");
  const title = el("div", "chat-title");
  title.append(el("b", null, "Decent Image Media"), el("span", null, "Quick answers · team on WhatsApp"));
  const closeBtn = el("button", "chat-close", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  head.append(title, closeBtn);

  const log = el("div", "chat-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");

  const chips = el("div", "chat-chips");
  ANSWERS.forEach((item) => {
    const c = el("button", "chat-chip", item.chip);
    c.type = "button";
    c.addEventListener("click", () => { say(item.chip, "me"); reply(item); });
    chips.append(c);
  });

  const form = el("form", "chat-form");
  const input = el("input");
  input.id = "chat-input";
  input.type = "text";
  input.placeholder = "Type your question";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Your question");
  input.maxLength = 300;
  const send = el("button", "chat-send", "Send");
  send.type = "submit";
  form.append(input, send);

  // Direct WhatsApp button, sits just above the "Ask us" launcher
  const waFloat = el("a", "wa-float");
  waFloat.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent("Hello Decent Image Media, I'd like to ask about a project.");
  waFloat.target = "_blank";
  waFloat.rel = "noopener";
  waFloat.setAttribute("aria-label", "Chat with us on WhatsApp");
  waFloat.innerHTML =
    '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.800 2 6.800L3 29l6.700-1.900c1.900 1 4 1.600 6.300 1.600 7.200 0 13-5.700 13-12.800S23.200 3 16 3zm0 23.300c-2 0-3.900-.6-5.500-1.600l-.4-.2-4 1.100 1.100-3.800-.3-.400a10.300 10.300 0 0 1-1.700-5.600C5.200 10 10 5.300 16 5.300S26.800 10 26.800 15.800 22 26.300 16 26.300zm5.900-7.800c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.2-.2.300-.800 1-1 1.200-.2.2-.4.2-.7.1-.3-.2-1.400-.5-2.600-1.600-1-.9-1.600-1.900-1.800-2.200-.2-.3 0-.5.100-.7l.5-.6c.2-.2.2-.3.300-.5.1-.2.1-.4 0-.6l-1-2.300c-.2-.6-.5-.5-.700-.5h-.6c-.2 0-.6.1-.8.4-.3.300-1.100 1.100-1.100 2.600s1.100 3 1.300 3.200c.2.2 2.200 3.300 5.300 4.600.7.3 1.300.5 1.800.6.7.2 1.400.2 1.900.1.6-.1 1.900-.8 2.100-1.500.3-.7.3-1.400.2-1.500-.1-.2-.3-.2-.6-.4z"/></svg>';

  panel.append(head, log, chips, form);
  // Greeting prompt: appears once per visit, opens the chat when tapped
  const teaser = el("div", "chat-teaser");
  teaser.hidden = true;
  teaser.setAttribute("role", "status");
  const teaserOpen = el("button", "chat-teaser-text", TEASER);
  teaserOpen.type = "button";
  const teaserClose = el("button", "chat-teaser-close", "×");
  teaserClose.type = "button";
  teaserClose.setAttribute("aria-label", "Dismiss greeting");
  teaser.append(teaserOpen, teaserClose);

  function seenTeaser() { try { return sessionStorage.getItem("dim-greeted") === "1"; } catch (e) { return false; } }
  function hideTeaser() {
    teaser.hidden = true;
    try { sessionStorage.setItem("dim-greeted", "1"); } catch (e) {}
  }
  teaserOpen.addEventListener("click", () => { hideTeaser(); open(); });
  teaserClose.addEventListener("click", hideTeaser);
  if (!seenTeaser()) setTimeout(() => { if (panel.hidden) teaser.hidden = false; }, TEASER_DELAY_MS);

  document.body.append(teaser, waFloat, launcher, panel);

  function say(text, who) {
    const row = el("div", "chat-msg " + (who === "me" ? "me" : "bot"));
    row.append(el("p", null, text));
    log.append(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function reply(item, question) {
    if (!item) {
      const row = say(FALLBACK, "bot");
      row.append(waLink(question));
    } else {
      const row = say(item.a, "bot");
      if (item.handoff) row.append(waLink(question));
    }
    log.scrollTop = log.scrollHeight;
  }

  function waLink(question) {
    const msg = question
      ? "Hello Decent Image Media, I have a question: " + question
      : "Hello Decent Image Media, I'd like to speak to someone about a project.";
    const a = el("a", "chat-wa", "Continue on WhatsApp");
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  let greeted = false;
  function open() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    waFloat.hidden = true;
    hideTeaser();
    if (!greeted) { say(GREETING, "bot"); greeted = true; }
    input.focus({ preventScroll: true });
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    waFloat.hidden = false;
    launcher.focus({ preventScroll: true });
  }

  launcher.addEventListener("click", () => (panel.hidden ? open() : close()));
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    say(text, "me");
    reply(findAnswer(text), text);
  });
})();
