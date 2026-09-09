/* ==========================================================================
   Vedhara Ayurveda — AI Chat Assistant Widget
   Self-contained: injects its own styles + markup, sits above the
   WhatsApp button (bottom-left) and answers common questions about
   treatments / yoga / panchakarma etc, redirecting to the right page.
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP_URL = "https://wa.me/919746797786?text=Hi%20Vedhara%20Ayurveda%2C%20I%27d%20like%20to%20know%20more%20about%20your%20treatments.";

  /* ---------- knowledge base: keyword -> page ---------- */
  var RULES = [
    {
      keys: ["yoga", "asana", "pranayama", "meditat", "breathing"],
      page: "yoga.html",
      label: "Explore Yoga Programs",
      reply: "We offer daily Yoga &amp; meditation sessions guided by expert teachers \u2014 Hatha yoga, pranayama and therapeutic sessions tailored to your body type. \uD83E\uDDD8"
    },
    {
      keys: ["panchakarma", "detox", "cleanse"],
      page: "panchakarma.html",
      label: "View Panchakarma",
      reply: "Panchakarma is our signature deep-detox program \u2014 a traditional 5-step Ayurvedic cleanse that resets the body and calms the mind. \uD83C\uDF3F"
    },
    {
      keys: ["ayurved", "dosha", "herbal medicine", "consult"],
      page: "ayurveda.html",
      label: "Discover Ayurveda",
      reply: "Our Ayurveda care is rooted in classical Kerala tradition \u2014 herbal therapies, oil massages and dosha-balancing treatments guided by our physicians. \uD83C\uDF43"
    },
    {
      keys: ["rejuven", "anti-aging", "antiaging", "glow", "skin"],
      page: "rejuvenation.html",
      label: "See Rejuvenation Therapies",
      reply: "Our Rejuvenation therapies use herbal massages and holistic rituals to restore vitality and a natural glow. \u2728"
    },
    {
      keys: ["destress", "de-stress", "stress", "relax", "sleep", "anxiety", "burnout"],
      page: "destress.html",
      label: "See De-Stress Therapies",
      reply: "Our De-Stress programs blend calming massages, herbal therapies and gentle yoga to help you unwind completely. \uD83C\uDF19"
    },
    {
      keys: ["treatment", "massage", "therapy", "therapies", "weight", "diet"],
      page: "treatments.html",
      label: "Browse All Treatments",
      reply: "We offer a range of therapeutic treatments \u2014 from Ayurvedic massages to Panchakarma, rejuvenation and de-stress therapies. Here\u2019s our full list:"
    },
    {
      keys: ["book", "booking", "reserve", "reservation", "package", "price", "cost", "rate", "stay"],
      page: "booking.html",
      label: "Book Your Stay",
      reply: "I can help with that \u2014 here\u2019s our booking page where you can reserve your retreat stay. \uD83D\uDCC5"
    },
    {
      keys: ["contact", "phone", "call", "address", "location", "email", "where are you", "reach"],
      page: "contact.html",
      label: "Contact Details",
      reply: "Here\u2019s how you can reach us \u2014 phone, email and our location in Alappuzha, Kerala."
    },
    {
      keys: ["about", "who are you", "history", "story", "founder"],
      page: "about.html",
      label: "About Vedhara",
      reply: "Vedhara Ayurveda is a wellness retreat in Alappuzha, Kerala, dedicated to authentic Ayurvedic healing. Learn more about us here:"
    }
  ];

  var GREETING_KEYS = ["hi", "hello", "hey", "namaste"];
  var THANKS_KEYS = ["thank", "thanks", "thank you"];
  var BYE_KEYS = ["bye", "goodbye", "see you"];

  var QUICK_CHIPS = [
    { text: "Treatments", page: "treatments.html" },
    { text: "Yoga", page: "yoga.html" },
    { text: "Panchakarma", page: "panchakarma.html" },
    { text: "Book a Stay", page: "booking.html" },
    { text: "Contact Us", page: "contact.html" }
  ];

  var GREETING_TEXT = "Hi, Vedhara Assist here! \uD83D\uDC4B How can I help you today? You can ask me about our treatments, yoga, panchakarma \u2014 or tap an option below.";

  /* ---------- styles ---------- */
  var CSS = "" +
    ".vh-ai-launcher{position:fixed;left:24px;bottom:94px;z-index:901;width:56px;height:56px;border-radius:50%;background:var(--primary-green,#30271F);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 34px -12px rgba(48,39,31,.28);cursor:pointer;border:none;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s cubic-bezier(.22,1,.36,1);padding:0}" +
    ".vh-ai-launcher:hover{transform:translateY(-4px) scale(1.05);box-shadow:0 20px 40px -14px rgba(48,39,31,.34)}" +
    ".vh-ai-launcher svg{width:26px;height:26px;display:block;transition:opacity .2s ease,transform .2s ease}" +
    ".vh-ai-launcher .vh-ai-close-ic{position:absolute;opacity:0;transform:scale(.6)}" +
    ".vh-ai-launcher.open .vh-ai-chat-ic{opacity:0;transform:scale(.6)}" +
    ".vh-ai-launcher.open .vh-ai-close-ic{opacity:1;transform:scale(1)}" +
    ".vh-ai-badge{position:absolute;top:-6px;right:-6px;background:var(--gold,#B58A42);color:#fff;font-family:var(--font-body,'Poppins',sans-serif);font-size:.58rem;font-weight:700;letter-spacing:.4px;padding:3px 6px;border-radius:20px;box-shadow:0 4px 10px rgba(0,0,0,.25);pointer-events:none}" +
    ".vh-ai-launcher.open .vh-ai-badge{display:none}" +
    ".vh-ai-panel{position:fixed;left:24px;bottom:164px;z-index:902;width:350px;max-width:calc(100vw - 32px);max-height:min(560px,72vh);display:flex;flex-direction:column;background:var(--cream,#FBF8F1);border-radius:20px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(24,18,12,.45);border:1px solid rgba(48,39,31,.08);opacity:0;visibility:hidden;transform:translateY(16px) scale(.97);transform-origin:bottom left;transition:opacity .3s cubic-bezier(.22,1,.36,1),transform .3s cubic-bezier(.22,1,.36,1),visibility .3s}" +
    ".vh-ai-panel.open{opacity:1;visibility:visible;transform:translateY(0) scale(1)}" +
    ".vh-ai-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;background:var(--primary-green,#30271F);color:#fff;flex:none}" +
    ".vh-ai-head-info{display:flex;align-items:center;gap:12px;min-width:0}" +
    ".vh-ai-avatar{width:36px;height:36px;border-radius:50%;background:var(--gold,#B58A42);display:flex;align-items:center;justify-content:center;font-size:1.05rem;flex:none}" +
    ".vh-ai-head-text{min-width:0}" +
    ".vh-ai-head-text strong{display:block;font-family:var(--font-head,'Cormorant Garamond',serif);font-size:1.08rem;font-weight:600;line-height:1.2;color:#fff}" +
    ".vh-ai-head-text small{display:flex;align-items:center;gap:5px;font-size:.72rem;color:#E6D7C3;letter-spacing:.2px}" +
    ".vh-ai-head-text small::before{content:'';width:7px;height:7px;border-radius:50%;background:#7ED8A0;display:inline-block}" +
    ".vh-ai-close{background:rgba(255,255,255,.12);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:1.15rem;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:background .25s ease}" +
    ".vh-ai-close:hover{background:rgba(255,255,255,.25)}" +
    ".vh-ai-body{flex:1 1 auto;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;background:var(--cream,#FBF8F1)}" +
    ".vh-ai-body::-webkit-scrollbar{width:6px}" +
    ".vh-ai-body::-webkit-scrollbar-thumb{background:rgba(48,39,31,.2);border-radius:10px}" +
    ".vh-ai-row{display:flex;gap:8px;max-width:88%}" +
    ".vh-ai-row.user{align-self:flex-end;flex-direction:row-reverse;max-width:92%}" +
    ".vh-ai-row .vh-ai-mini-avatar{width:26px;height:26px;border-radius:50%;background:var(--gold,#B58A42);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.78rem;flex:none;margin-top:2px}" +
    ".vh-ai-bubble{background:#fff;color:var(--dark-text,#30271F);padding:11px 14px;border-radius:14px 14px 14px 4px;font-size:.86rem;line-height:1.5;box-shadow:0 8px 20px -14px rgba(48,39,31,.4)}" +
    ".vh-ai-row.user .vh-ai-bubble{background:var(--primary-green,#30271F);color:#fff;border-radius:14px 14px 4px 14px}" +
    ".vh-ai-cta{margin-top:9px;display:inline-flex;align-items:center;gap:6px;background:var(--gold,#B58A42);color:#fff!important;font-size:.78rem;font-weight:600;letter-spacing:.2px;padding:9px 14px;border-radius:100px;text-decoration:none;transition:transform .25s ease,background .25s ease}" +
    ".vh-ai-cta:hover{background:var(--gold-dark,#60452D);transform:translateY(-2px)}" +
    ".vh-ai-typing{display:flex;gap:4px;padding:13px 15px;background:#fff;border-radius:14px 14px 14px 4px;width:fit-content;box-shadow:0 8px 20px -14px rgba(48,39,31,.4)}" +
    ".vh-ai-typing span{width:6px;height:6px;border-radius:50%;background:var(--sage,#75685B);opacity:.5;animation:vhAiBlink 1.2s ease-in-out infinite}" +
    ".vh-ai-typing span:nth-child(2){animation-delay:.15s}.vh-ai-typing span:nth-child(3){animation-delay:.3s}" +
    "@keyframes vhAiBlink{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}" +
    ".vh-ai-quick{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 14px;flex:none}" +
    ".vh-ai-chip{background:#fff;border:1px solid rgba(48,39,31,.16);color:var(--dark-text,#30271F);font-size:.78rem;font-weight:500;padding:8px 13px;border-radius:100px;cursor:pointer;transition:.25s ease;white-space:nowrap}" +
    ".vh-ai-chip:hover{background:var(--primary-green,#30271F);color:#fff;border-color:var(--primary-green,#30271F)}" +
    ".vh-ai-inputrow{display:flex;align-items:center;gap:8px;padding:12px 14px;border-top:1px solid rgba(48,39,31,.1);background:#fff;flex:none}" +
    ".vh-ai-inputrow input{flex:1 1 auto;border:1px solid rgba(48,39,31,.16);background:var(--cream,#FBF8F1);border-radius:100px;padding:10px 16px;font-size:.86rem;font-family:inherit;color:var(--dark-text,#30271F);outline:none;min-width:0;transition:border-color .25s ease}" +
    ".vh-ai-inputrow input:focus{border-color:var(--gold,#B58A42)}" +
    ".vh-ai-inputrow button{flex:none;width:38px;height:38px;border-radius:50%;background:var(--primary-green,#30271F);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1rem;border:none;cursor:pointer;transition:background .25s ease,transform .25s ease}" +
    ".vh-ai-inputrow button:hover{background:var(--gold-dark,#60452D);transform:translateY(-1px)}" +
    "@media (max-width:768px){.vh-ai-launcher{left:16px;bottom:78px;width:50px;height:50px}.vh-ai-launcher svg{width:22px;height:22px}.vh-ai-panel{left:16px;bottom:140px;width:calc(100vw - 32px)}}" +
    "@media (max-width:420px){.vh-ai-panel{max-height:66vh}}";

  function injectStyles() {
    if (document.getElementById("vh-ai-chat-styles")) return;
    var style = document.createElement("style");
    style.id = "vh-ai-chat-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ---------- markup ---------- */
  var CHAT_ICON =
    '<svg class="vh-ai-chat-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.35 0-2.62-.32-3.73-.9L3 21l1.9-5.7A8.46 8.46 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/><circle cx="8.5" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="15.5" cy="12" r=".9" fill="currentColor" stroke="none"/></svg>' +
    '<svg class="vh-ai-close-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="position:absolute"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function buildDOM() {
    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "vh-ai-launcher";
    launcher.id = "vhAiLauncher";
    launcher.setAttribute("aria-label", "Chat with Vedhara AI Assistant");
    launcher.innerHTML = CHAT_ICON + '<span class="vh-ai-badge">AI</span>';

    var panel = document.createElement("div");
    panel.className = "vh-ai-panel";
    panel.id = "vhAiPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Vedhara AI Assistant chat");
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML =
      '<div class="vh-ai-head">' +
        '<div class="vh-ai-head-info">' +
          '<span class="vh-ai-avatar">\uD83C\uDF3F</span>' +
          '<div class="vh-ai-head-text"><strong>Vedhara Assist</strong><small>Online \u2014 Ayurveda Guide</small></div>' +
        "</div>" +
        '<button type="button" class="vh-ai-close" id="vhAiCloseBtn" aria-label="Close chat">\u00D7</button>' +
      "</div>" +
      '<div class="vh-ai-body" id="vhAiBody"></div>' +
      '<div class="vh-ai-quick" id="vhAiQuick"></div>' +
      '<form class="vh-ai-inputrow" id="vhAiForm">' +
        '<input type="text" id="vhAiInput" placeholder="Ask about treatments, yoga\u2026" autocomplete="off" />' +
        '<button type="submit" aria-label="Send">\u27A4</button>' +
      "</form>";

    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    return { launcher: launcher, panel: panel };
  }

  /* ---------- chat logic ---------- */
  function init() {
    injectStyles();
    var dom = buildDOM();
    var launcher = dom.launcher;
    var panel = dom.panel;
    var body = panel.querySelector("#vhAiBody");
    var quick = panel.querySelector("#vhAiQuick");
    var form = panel.querySelector("#vhAiForm");
    var input = panel.querySelector("#vhAiInput");
    var closeBtn = panel.querySelector("#vhAiCloseBtn");
    var started = false;

    function scrollDown() {
      body.scrollTop = body.scrollHeight;
    }

    function addBotBubble(html) {
      var row = document.createElement("div");
      row.className = "vh-ai-row bot";
      row.innerHTML =
        '<span class="vh-ai-mini-avatar">\uD83C\uDF3F</span>' +
        '<div class="vh-ai-bubble">' + html + "</div>";
      body.appendChild(row);
      scrollDown();
    }

    function addUserBubble(text) {
      var row = document.createElement("div");
      row.className = "vh-ai-row user";
      var bubble = document.createElement("div");
      bubble.className = "vh-ai-bubble";
      bubble.textContent = text;
      row.appendChild(bubble);
      body.appendChild(row);
      scrollDown();
    }

    function showTyping(cb) {
      var row = document.createElement("div");
      row.className = "vh-ai-row bot";
      row.innerHTML =
        '<span class="vh-ai-mini-avatar">\uD83C\uDF3F</span>' +
        '<div class="vh-ai-typing"><span></span><span></span><span></span></div>';
      body.appendChild(row);
      scrollDown();
      setTimeout(function () {
        row.remove();
        cb();
      }, 550 + Math.random() * 350);
    }

    function renderChips(list) {
      quick.innerHTML = "";
      list.forEach(function (chip) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vh-ai-chip";
        btn.textContent = chip.text;
        btn.addEventListener("click", function () {
          handleUserText(chip.text);
        });
        quick.appendChild(btn);
      });
    }

    function findRule(text) {
      var lower = text.toLowerCase();
      for (var i = 0; i < RULES.length; i++) {
        var rule = RULES[i];
        for (var j = 0; j < rule.keys.length; j++) {
          if (lower.indexOf(rule.keys[j]) !== -1) return rule;
        }
      }
      return null;
    }

    function containsAny(text, arr) {
      var lower = text.toLowerCase();
      return arr.some(function (k) { return lower.indexOf(k) !== -1; });
    }

    function handleUserText(text) {
      text = text.trim();
      if (!text) return;
      addUserBubble(text);
      showTyping(function () {
        respond(text);
      });
    }

    function respond(text) {
      if (containsAny(text, GREETING_KEYS)) {
        addBotBubble(GREETING_TEXT);
        renderChips(QUICK_CHIPS);
        return;
      }
      if (containsAny(text, THANKS_KEYS)) {
        addBotBubble("You\u2019re most welcome! \uD83D\uDE4F Is there anything else I can help you with?");
        renderChips(QUICK_CHIPS);
        return;
      }
      if (containsAny(text, BYE_KEYS)) {
        addBotBubble("Take care, and hope to welcome you to Vedhara soon! \uD83C\uDF3F You can also reach us anytime on WhatsApp.");
        quick.innerHTML = "";
        return;
      }

      var rule = findRule(text);
      if (rule) {
        addBotBubble(
          rule.reply +
          '<br><a class="vh-ai-cta" href="' + rule.page + '">' + rule.label + " \u2192</a>"
        );
        renderChips(QUICK_CHIPS.filter(function (c) { return c.page !== rule.page; }).slice(0, 4));
      } else {
        addBotBubble(
          "I couldn\u2019t quite find that \u2014 but here are a few things I can help with. You can also chat with our team directly on " +
          '<a class="vh-ai-cta" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">WhatsApp \u2192</a>'
        );
        renderChips(QUICK_CHIPS);
      }
    }

    function openPanel() {
      panel.classList.add("open");
      launcher.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      if (!started) {
        started = true;
        showTyping(function () {
          addBotBubble(GREETING_TEXT);
          renderChips(QUICK_CHIPS);
        });
      }
      setTimeout(function () { input.focus(); }, 300);
    }

    function closePanel() {
      panel.classList.remove("open");
      launcher.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }

    function togglePanel() {
      if (panel.classList.contains("open")) closePanel();
      else openPanel();
    }

    launcher.addEventListener("click", togglePanel);
    closeBtn.addEventListener("click", closePanel);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value;
      input.value = "";
      handleUserText(val);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
    });

    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("open")) return;
      if (panel.contains(e.target) || launcher.contains(e.target)) return;
      closePanel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
