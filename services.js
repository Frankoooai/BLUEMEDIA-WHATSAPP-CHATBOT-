/* Service popups: tapping a service tag opens a short description with quick ways to ask for it.
   To edit the wording, change the text below. "img" is optional (a photo from the work/ folder). */
(function () {
  const INFO = {
    // First Impressions
    "Business cards": { d: "Cards that feel as good as they look. Choose the stock, finish and special touches such as matt lamination, spot UV or rounded corners." },
    "Letterheads & slips": { d: "Letterheads, compliment slips and delivery notes designed to match your brand, so every document you send looks consistent." },
    "Brochures & flyers": { d: "Folded brochures and flyers for launches, promotions and exhibitions, from layout and copy through to print." },
    "Company profiles": { d: "A company profile that tells your story clearly: who you are, what you do and the work that proves it. Printed, digital or both." },
    "Menus": { d: "Menus for restaurants, hotels and events, designed for easy reading and printed on durable, wipeable stock where needed." },
    "Annual reports": { d: "Annual and corporate reports laid out so the numbers and story are easy to follow, ready for print and PDF." },
    "Corporate gifting": { d: "Branded gifts for clients, staff and partners, curated and packaged to suit your budget and the occasion." },
    // Built to Be Seen
    "Billboards": { d: "Large-format billboard artwork designed to be read at a glance, printed and prepared for installation.", img: "work/sagco-pylon.webp" },
    "2D flat-cut signage": { d: "Flat-cut letters and logos in acrylic, aluminium or PVC for receptions, offices and feature walls." },
    "3D built-up letters": { d: "Raised, dimensional lettering with optional lighting, made to give your building or reception real presence.", img: "work/costa-lightbox.webp" },
    "Shopfront branding": { d: "Fascia signs, projecting lightboxes and window graphics that make your shop easy to find and hard to ignore.", img: "work/costa-lightbox.webp" },
    "Wall & floor graphics": { d: "Printed wall murals and floor graphics that turn plain spaces into branded environments and guide people where to go." },
    "Supermarket in-store": { d: "In-store branding that catches shoppers at the shelf: displays, aisle signage and point-of-sale material." },
    "Gondolas & wobblers": { d: "Gondola ends and shelf wobblers that draw attention to your product right where buying decisions happen." },
    "Shelf strips": { d: "Printed shelf strips that mark out your products and keep your brand visible along the aisle." },
    "Category branding": { d: "Branding for a whole product category or bay, so your range stands out as one block in store." },
    // Brands in Motion
    "Full & partial wraps": { d: "Vehicle wraps designed around your vehicle's shape. We show you a mockup first, then print and fit the wrap.", img: "work/weetabix-van.webp" },
    "Fleet livery": { d: "One consistent look across every vehicle in your fleet, so each one advertises your brand wherever it goes." },
    "T-shirts": { d: "Branded T-shirts for teams, events and promotions, printed or embroidered to suit the job." },
    "Corporate uniforms": { d: "Uniforms that make your team look the part, with your branding applied neatly and consistently." },
    "Caps": { d: "Branded caps for staff, events and giveaways, embroidered or printed." },
    "Mugs": { d: "Printed mugs for offices, gifts and promotions." },
    "Umbrellas": { d: "Branded umbrellas that keep your logo visible come rain or shine." },
    "Bags": { d: "Tote bags, backpacks and conference bags with your branding, ideal for events and gifts." },
    "Diaries & pens": { d: "Branded diaries, notebooks and pens for staff, clients and year-end gifting." },
    // Creative & Digital
    "Creative & graphic design": { d: "Design for anything you need to print, post or present, all in a consistent style that fits your brand." },
    "Brand identity": { d: "Logo, colours, typography and guidelines that give your business a clear, recognisable identity." },
    "Interior design": { d: "Branded interiors for offices, receptions and retail spaces, so your space reflects your brand." },
  };
  const WA = "254182832454";

  // Build the popup once
  const wrap = document.createElement("div");
  wrap.className = "svc-pop";
  wrap.hidden = true;
  wrap.innerHTML =
    '<div class="svc-backdrop" data-close></div>' +
    '<section class="svc-card" role="dialog" aria-modal="true" aria-labelledby="svc-title">' +
    '<button type="button" class="svc-x" aria-label="Close" data-close>×</button>' +
    '<img class="svc-img" alt="">' +
    '<div class="svc-body"><p class="svc-group"></p><h3 id="svc-title"></h3><p class="svc-desc"></p>' +
    '<div class="svc-actions">' +
    '<a class="btn svc-wa" target="_blank" rel="noopener">Ask on WhatsApp</a>' +
    '<a class="btn-ghost svc-quote" href="#book">Request a quote</a>' +
    "</div></div></section>";
  document.body.append(wrap);
  const $ = (s) => wrap.querySelector(s);
  let lastFocus = null;

  function open(name, group) {
    const info = INFO[name] || { d: "Ask us about " + name.toLowerCase() + " and we'll put together a quote for your brand." };
    $(".svc-group").textContent = group;
    $("#svc-title").textContent = name;
    $(".svc-desc").textContent = info.d;
    const img = $(".svc-img");
    if (info.img) { img.src = info.img; img.alt = name; img.hidden = false; } else { img.hidden = true; img.removeAttribute("src"); }
    $(".svc-wa").href = "https://wa.me/" + WA + "?text=" +
      encodeURIComponent("Hello Decent Image Media, I'd like a quote for " + name.toLowerCase() + ".");
    $(".svc-quote").dataset.service = name;
    lastFocus = document.activeElement;
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add("open"));
    document.documentElement.classList.add("svc-lock");
    $(".svc-x").focus();
  }
  function close() {
    wrap.classList.remove("open");
    document.documentElement.classList.remove("svc-lock");
    setTimeout(() => { wrap.hidden = true; }, 200);
    if (lastFocus) lastFocus.focus();
  }

  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
  document.addEventListener("keydown", (e) => {
    if (wrap.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // keep focus inside the popup
      const f = [...wrap.querySelectorAll("button, a[href]")].filter((el) => el.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // "Request a quote": close and note the service on the enquiry form
  $(".svc-quote").addEventListener("click", (e) => {
    const svc = e.currentTarget.dataset.service;
    const field = document.querySelector('#audit-form [name="service"]');
    if (field) field.value = svc;
    const note = document.getElementById("form-note");
    if (note) { note.classList.remove("err"); note.textContent = "You're asking about: " + svc + "."; }
    close();
  });

  // Turn every tag into a button
  document.querySelectorAll("#services .line").forEach((line) => {
    const group = (line.querySelector("h3") || {}).textContent || "";
    line.querySelectorAll(".tags li").forEach((li) => {
      const name = li.textContent.trim();
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tag-btn";
      b.textContent = name;
      b.setAttribute("aria-haspopup", "dialog");
      b.addEventListener("click", () => open(name, group));
      li.textContent = "";
      li.append(b);
    });
  });
})();
