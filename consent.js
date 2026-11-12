/* Decent Image Media: cookie consent, analytics and ad tracking
   ------------------------------------------------------------------
   Nothing here tracks anyone until a visitor taps "Accept".
   TO SWITCH ON: paste your IDs below once you have the accounts.
     ga4Id        Google Analytics 4, looks like  G-XXXXXXXXXX
     googleAdsId  Google Ads,          looks like  AW-XXXXXXXXXX
     metaPixelId  Meta (Facebook/Instagram) Pixel, a long number
   Leave an ID empty and that service never loads. */
(function () {
  const TRACKING = {
    ga4Id: "",
    googleAdsId: "",
    metaPixelId: "",
  };
  const KEY = "dim-consent"; // "all" or "essential"
  const anyTracking = TRACKING.ga4Id || TRACKING.googleAdsId || TRACKING.metaPixelId;

  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  // ---------- loaders (run only after consent) ----------
  let loaded = false;
  function loadTracking() {
    if (loaded || !anyTracking) return;
    loaded = true;
    const gId = TRACKING.ga4Id || TRACKING.googleAdsId;
    if (gId) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + gId;
      document.head.append(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      if (TRACKING.ga4Id) window.gtag("config", TRACKING.ga4Id);
      if (TRACKING.googleAdsId) window.gtag("config", TRACKING.googleAdsId);
    }
    if (TRACKING.metaPixelId) {
      /* Meta Pixel base code */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      window.fbq("init", TRACKING.metaPixelId);
      window.fbq("track", "PageView");
    }
  }

  // ---------- conversion events (only sent if tracking is on) ----------
  // "lead"    = the audit/enquiry form was sent
  // "contact" = someone tapped a WhatsApp button
  window.dimTrack = function (type, detail) {
    if (!loaded) return;
    if (window.gtag) {
      window.gtag("event", type === "lead" ? "generate_lead" : "contact", { method: "whatsapp", ...(detail || {}) });
    }
    if (window.fbq) window.fbq("track", type === "lead" ? "Lead" : "Contact");
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="https://wa.me"]');
    if (a) window.dimTrack("contact", { link_location: a.className || "link" });
  }, true);
  const form = document.getElementById("audit-form");
  if (form) form.addEventListener("submit", () => {
    if (form.name.value.trim() && form.business.value.trim() && form.industry.value) {
      window.dimTrack("lead", { service: form.package.value || "not sure" });
    }
  });

  // ---------- banner ----------
  const banner = document.createElement("section");
  banner.className = "consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie choices");
  banner.hidden = true;
  banner.innerHTML =
    '<p><b>Cookies on this site.</b> With your permission we use cookies to count visits and to show our ads to people who have visited before. ' +
    'We never use them to identify you by name. <a href="privacy.html#cookies">Read more</a></p>' +
    '<div class="consent-btns"><button type="button" class="consent-no">Essential only</button>' +
    '<button type="button" class="consent-yes">Accept all</button></div>';
  document.body.append(banner);

  function choose(v) {
    save(v);
    banner.hidden = true;
    if (v === "all") loadTracking();
  }
  banner.querySelector(".consent-yes").addEventListener("click", () => choose("all"));
  banner.querySelector(".consent-no").addEventListener("click", () => choose("essential"));

  // "Cookie settings" links reopen the banner
  document.querySelectorAll("[data-cookie-settings]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); banner.hidden = false; })
  );

  // Ask only when there is something to ask about
  const choice = read();
  if (choice === "all") loadTracking();
  else if (!choice && anyTracking) banner.hidden = false;
})();
