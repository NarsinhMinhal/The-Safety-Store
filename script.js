"use strict";

/* ═══════════════════════════════════════════════════════════════
   TSS – The Safety Store  |  script.js  (Optimised & Fixed)

   SECTIONS
   ─────────
    0. UTILITIES
    1. LOADER
    2. CUSTOM CURSOR
    3. NAVBAR
    4. MOBILE MENU
    5. HERO PARTICLES
    6. HERO ANIMATIONS
    7. SCROLL ANIMATIONS
    8. MAGNETIC BUTTONS
    9. CARD TILT
   10. INDUSTRY HOVER
   11. PILLAR HOVER
   12. SMOOTH SCROLL
   13. ACTIVE NAV
   14. COUNTERS
   15. CONTACT CARDS & WHATSAPP
   16. SCROLL PROGRESS
   17. FOOTER LINKS
   18. I18N (Static translation)
   19. BOOT
   ═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   0. UTILITIES
   ───────────────────────────────────────────────────────────── */

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const isMobile = () => window.innerWidth < 768;
const isFinePointer = () => window.matchMedia("(hover:hover) and (pointer:fine)").matches;

/* Scroll restore — always open at top on refresh */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
/** Calls cb() once GSAP + ScrollTrigger are both available. */
function onGsapReady(cb) {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    cb();
  } else {
    setTimeout(() => onGsapReady(cb), 40);
  }
}


/* ─────────────────────────────────────────────────────────────
   1. LOADER
   ───────────────────────────────────────────────────────────── */

function initLoader() {
  const loader = $("#loader"), bar = $("#loaderBar");
  if (!loader || !bar) return;

  document.body.classList.add("loading");

  let prog = 0;
  const iv = setInterval(() => {
    prog = Math.min(prog + Math.random() * 14 + 4, 92);
    bar.style.width = prog + "%";
  }, 80);

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    clearInterval(iv);
    bar.style.width = "100%";
    setTimeout(() => {
      if (typeof gsap !== "undefined") {
        gsap.to(loader, {
          yPercent: -100, duration: 0.9, ease: "expo.inOut",
          onComplete: () => {
            loader.classList.add("hidden");
            document.body.classList.remove("loading");
            onGsapReady(animateHero);
          }
        });
      } else {
        loader.classList.add("hidden");
        document.body.classList.remove("loading");
        onGsapReady(animateHero);
      }
    }, 400);
  }

  window.addEventListener("load", finish, { once: true });
  setTimeout(finish, 3500);
}


/* ─────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
   Fix: use pointer-events:none on cta-inner children so mouseleave
   fires correctly on the section boundary, not on child elements.
   ───────────────────────────────────────────────────────────── */

function initCursor() {
  const ring = $("#cCursor"), dot = $("#cDot");
  if (!ring || !dot) return;

  let mx = -400, my = -400, rx = -400, ry = -400, rafId = null;

  function show(v) {
    ring.style.opacity = v ? "1" : "0";
    dot.style.opacity  = v ? "1" : "0";
  }

  function start() {
    if (!isFinePointer()) { show(false); return; }
    show(true);
    document.onmousemove = e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top  = my + "px";
    };
    if (rafId) cancelAnimationFrame(rafId);
    (function loop() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + "px";
      ring.style.top  = ry + "px";
      rafId = requestAnimationFrame(loop);
    })();
  }

  window.matchMedia("(hover:hover) and (pointer:fine)").addEventListener("change", e => {
    if (e.matches) { mx = -400; my = -400; rx = -400; ry = -400; start(); }
    else { show(false); document.onmousemove = null; if (rafId) cancelAnimationFrame(rafId); }
  });

  start();
  document.addEventListener("mouseleave", () => show(false));
  document.addEventListener("mouseenter", () => { if (isFinePointer()) show(true); });

  $$("a,button,.product-card,.industry-card,.contact-location,.pillar,.mobile-link,.btn,.contact-cta-btn").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("expanded"));
    el.addEventListener("mouseleave", () => ring.classList.remove("expanded"));
  });

  /* CTA cursor colour fix:
     Use mousemove on document to check if pointer is inside .cta-inner
     This avoids the child-element mouseleave firing issue entirely. */
  const ctaInner = $(".cta-inner");
  if (ctaInner) {
    document.addEventListener("mousemove", e => {
      const r = ctaInner.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right &&
                     e.clientY >= r.top  && e.clientY <= r.bottom;
      document.body.classList.toggle("badge-hover", inside);
    });
  }
}


/* ─────────────────────────────────────────────────────────────
   3. NAVBAR
   ───────────────────────────────────────────────────────────── */

function initNavbar() {
  const navbar = $("#navbar");
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
    if (navbar.style.transform && navbar.style.transform !== "none") {
      navbar.style.transform = "none";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  onGsapReady(() => {
    if (!isMobile()) {
      gsap.from(".nav-logo",  { opacity: 0, duration: 0.9, ease: "expo.out", delay: 1.6 });
      gsap.fromTo(".nav-link",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "expo.out", delay: 1.7 }
      );
      gsap.from(".nav-cta", { opacity: 0, scale: 0.85, duration: 0.6, ease: "back.out(2)", delay: 2.1 });
    } else {
      gsap.from(".nav-logo,.hamburger", { opacity: 0, duration: 0.7, ease: "expo.out", delay: 1.0 });
    }
  });
}


/* ─────────────────────────────────────────────────────────────
   4. MOBILE MENU
   ───────────────────────────────────────────────────────────── */

function initMobileMenu() {
  const hb       = $("#hamburger");
  const menu     = $("#mobileMenu");
  const backdrop = $("#mobileBackdrop");
  const closeBtn = $("#mobileCloseBtn");
  const navbar   = $("#navbar");
  if (!hb || !menu) return;

  function openMenu() {
    hb.classList.add("open");
    menu.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    if (navbar)   navbar.classList.add("menu-open");
    document.body.classList.add("menu-open");
    menu.setAttribute("aria-hidden", "false");
    hb.setAttribute("aria-expanded", "true");

    if (typeof gsap !== "undefined") {
      gsap.fromTo(".mobile-link",
        { x: 28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "expo.out", delay: 0.15 }
      );
      gsap.to(".mobile-menu-footer",
        { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", delay: 0.3 }
      );
    }
  }

  function closeMenu() {
    hb.classList.remove("open");
    menu.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    if (navbar)   navbar.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden", "true");
    hb.setAttribute("aria-expanded", "false");
  }

  hb.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  $$(".mobile-link").forEach(l => l.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
}


/* ─────────────────────────────────────────────────────────────
   5. HERO PARTICLES
   ───────────────────────────────────────────────────────────── */

function initHeroParticles() {
  const c = $("#heroParticles");
  if (!c) return;

  if (!document.getElementById("particleStyle")) {
    const s = document.createElement("style");
    s.id = "particleStyle";
    s.textContent = `@keyframes floatP{0%,100%{opacity:0;transform:translateY(0)}20%{opacity:.7}80%{opacity:.7}50%{transform:translateY(-30px)}}`;
    document.head.appendChild(s);
  }

  const n = isMobile() ? 10 : 24;
  for (let i = 0; i < n; i++) {
    const d = document.createElement("div");
    const sz = Math.random() * 3.5 + 1.5;
    const red = Math.random() > 0.55;
    Object.assign(d.style, {
      position: "absolute",
      width: sz + "px", height: sz + "px",
      borderRadius: "50%",
      background: red ? "rgba(227,6,19,0.35)" : "rgba(13,12,14,0.08)",
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      opacity: "0",
      animation: `floatP ${5 + Math.random() * 7}s ease-in-out ${Math.random() * 5}s infinite`
    });
    c.appendChild(d);
  }
}


/* ─────────────────────────────────────────────────────────────
   6. HERO ANIMATIONS
   Fix: set all elements to opacity:0 via JS BEFORE loader exits,
   so there's zero visible flash. We also ensure hero-stat and
   hero-stats animate on mobile.
   ───────────────────────────────────────────────────────────── */

function primeHeroElements() {
  if (typeof gsap === "undefined") return;
  gsap.set(".hero-badge",           { opacity: 0, y: 24, scale: 0.9 });
  gsap.set(".hero-line .hero-word", { opacity: 0, y: 80 });
  gsap.set(".hero-sub",             { opacity: 0, y: 22 });
  gsap.set(".hero-actions .btn",    { opacity: 0, y: 18, scale: 0.95 });
  gsap.set(".hero-stats",           { opacity: 0, y: 22 });
  gsap.set(".hero-stat",            { opacity: 0, y: 14 });
  if (!isMobile()) {
    gsap.set(".hero-ppe-item",      { opacity: 0, y: 30, scale: 0.88 });
  }
  /* Zero out counters while hidden so user never sees the final value before animation */
  $$(".stat-num").forEach(el => {
    const match = el.textContent.match(/(\d+)/);
    if (match) {
      el.dataset.counterTarget = el.textContent.trim();
      el.textContent = "0";
    }
  });
}

function animateHero() {
  if (typeof gsap === "undefined") return;
  const mob = isMobile();

  // PPE grid — desktop only
  if (!mob) {
    gsap.to(".hero-ppe-item", {
      opacity: 1, y: 0, scale: 1,
      duration: 0.6, stagger: 0.07, ease: "back.out(1.4)", delay: 0.9
    });
  }

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(".hero-badge",            { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0)
    .to(".hero-line .hero-word",  { opacity: 1, y: 0, skewX: 0, duration: mob ? 0.85 : 1.15, stagger: 0.1 }, 0.15)
    .to(".hero-sub",              { opacity: 1, y: 0, duration: 0.85 }, mob ? 0.5 : 0.65)
    .to(".hero-actions .btn",     { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1 }, mob ? 0.65 : 0.8)
    .to(".hero-stats",            { opacity: 1, y: 0, duration: 0.7 }, mob ? 0.8 : 1.0)
    .to(".hero-stat",             { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, mob ? 0.85 : 1.05)
    .call(() => {
      $$(".stat-num[data-counter-target]").forEach(el => {
        const full   = el.dataset.counterTarget;
        const match  = full.match(/(\d+)/);
        if (!match) { el.textContent = full; return; }
        const target = parseInt(match[1]);
        const suffix = full.replace(/\d+/, "");
        let start = 0;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1800, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.removeAttribute("data-counter-target");
        };
        requestAnimationFrame(step);
      });
    });
}

/* ─────────────────────────────────────────────────────────────
   7. SCROLL ANIMATIONS
   Fixes:
   – Elements are pre-hidden via CSS class .will-animate (opacity:0)
     applied in HTML, removed by GSAP — no JS set() race condition.
   – Generic section-title/section-label pass removed (was doubling
     animations on already-animated elements → flicker).
   – Mobile start values pushed further down viewport (92%–95%)
     so triggers fire before element is fully off-screen.
   – Each section's elements are only animated once, in one place.
   ───────────────────────────────────────────────────────────── */

function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const mob  = isMobile();
  const once = { toggleActions: "play none none none", once: true };

  /* Helper — creates a ScrollTrigger fromTo with sensible defaults */
  function reveal(targets, from, to, triggerEl, startPct = mob ? 92 : 85, delayOverride = 0) {
    const els = typeof targets === "string" ? $$(targets) : (Array.isArray(targets) ? targets : [targets]);
    if (!els.length) return;
    const trigger = typeof triggerEl === "string" ? $(triggerEl) : triggerEl;
    if (!trigger) return;
    gsap.fromTo(els, from,
      { ...to, delay: delayOverride,
        scrollTrigger: { trigger, start: `top ${startPct}%`, ...once }
      }
    );
  }

  /* ── Marquee ── */
  ScrollTrigger.create({
    trigger: ".marquee-section", start: "top 95%", once: true,
    onEnter: () => gsap.fromTo(".marquee-section",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
  });
  const mq = $(".marquee-content");
  if (mq) {
    mq.addEventListener("mouseenter", () => mq.style.animationPlayState = "paused");
    mq.addEventListener("mouseleave", () => mq.style.animationPlayState = "running");
  }

  /* ── About visual ── */
  gsap.fromTo(".about-card-main",
    { opacity: 0, x: mob ? 0 : -60, y: mob ? 40 : 0, rotateY: mob ? 0 : -8 },
    { opacity: 1, x: 0, y: 0, rotateY: 0, duration: mob ? 0.8 : 1.1, ease: "expo.out",
      scrollTrigger: { trigger: ".about-visual", start: `top ${mob ? 92 : 82}%`, ...once }
    }
  );
  gsap.fromTo(".about-floating-badge",
    { opacity: 0, scale: 0.6, rotate: -20 },
    { opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(2)",
      scrollTrigger: { trigger: ".about-visual", start: `top ${mob ? 90 : 75}%`, ...once }
    }
  );

  /* About card tilt — desktop fine-pointer only */
  if (!mob && isFinePointer()) {
    const aboutCard = $(".about-card-main");
    if (aboutCard) {
      aboutCard.addEventListener("mousemove", e => {
        const r = aboutCard.getBoundingClientRect();
        gsap.to(aboutCard, {
          rotateX: ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -5,
          rotateY: ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 5,
          duration: 0.4, ease: "power2.out", transformPerspective: 600
        });
      });
      aboutCard.addEventListener("mouseleave", () =>
        gsap.to(aboutCard, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1,0.5)" })
      );
    }
  }

  /* ── About content — ONE pass, staggered, single trigger ── */
  const aboutEls = $$(
    ".about .section-label, .about .section-title, .about-desc, .pillar, .about-cta"
  );
  if (aboutEls.length) {
    gsap.fromTo(aboutEls,
      { opacity: 0, y: 32, x: mob ? 0 : 14 },
      { opacity: 1, y: 0, x: 0, duration: 0.7, ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ".about-content", start: `top ${mob ? 92 : 82}%`, ...once }
      }
    );
  }

  /* ── Products header — ONE pass ── */
  const prodHeaderEls = $$(
    ".products .section-label, .products .section-title, .products .section-sub"
  );
  if (prodHeaderEls.length) {
    gsap.fromTo(prodHeaderEls,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.75, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: ".products .section-header", start: `top ${mob ? 93 : 86}%`, ...once }
      }
    );
  }

  /* ── Product cards ── */
const cards = $$(".product-card"), cols = mob ? 2 : 4;
  if (mob) {
    cards.forEach((card, i) => {
      const fromLeft = (i % 2 === 0);
      gsap.fromTo(card,
        { opacity: 0, x: fromLeft ? -70 : 70, scale: 0.88 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out",
          delay: Math.floor(i / 2) * 0.12 + (i % 2) * 0.08,
          scrollTrigger: { trigger: card, start: "top 94%", ...once }
        }
      );
    });
  } else {
    /* Set all invisible first so the whole batch triggers at once */
    gsap.set(cards, { opacity: 0, y: 60, scale: 0.88, rotateX: 8 });
    ScrollTrigger.create({
      trigger: ".product-grid", start: "top 80%", once: true,
      onEnter: () => {
        cards.forEach((card, i) => {
          gsap.to(card, {
            opacity: 1, y: 0, scale: 1, rotateX: 0,
            duration: 0.75, ease: "expo.out",
            transformPerspective: 800,
            delay: Math.floor(i / cols) * 0.08 + (i % cols) * 0.07
          });
        });
      }
    });
  }

  /* ── Industries header — ONE pass ── */
  const indHeaderEls = $$(
    ".industries .section-label, .industries .section-title, .industries .section-sub"
  );
  if (indHeaderEls.length) {
    gsap.fromTo(indHeaderEls,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.75, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: ".industries .section-header", start: `top ${mob ? 93 : 86}%`, ...once }
      }
    );
  }

  /* ── Industry cards ── */
  $$(".industry-card").forEach((card, i) => {
    if (mob) {
      const fromLeft = (i % 2 === 0);
      gsap.fromTo(card,
        { opacity: 0, x: fromLeft ? -70 : 70, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out",
          delay: Math.floor(i / 2) * 0.12 + (i % 2) * 0.08,
          scrollTrigger: { trigger: card, start: "top 94%", ...once }
        }
      );
    } else {
      gsap.fromTo(card,
        { opacity: 0, y: 44, scale: 0.92 },
        { opacity: 1, scale: 1, y: 0, duration: 0.75,
          ease: "back.out(1.4)",
          delay: (i % 6) * 0.09,
          scrollTrigger: { trigger: ".industry-grid", start: "top 84%", ...once }
        }
      );
    }
  });

  /* ── CTA ── */
  const ctaTL = gsap.timeline({
    scrollTrigger: { trigger: ".cta-section", start: `top ${mob ? 90 : 78}%`, ...once }
  });
  ctaTL
    .fromTo(".cta-badge",       { opacity: 0, y: 24, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(2)" }, 0)
    .fromTo(".cta-title",       { opacity: 0, y: 50, skewX: mob ? 0 : -4 }, { opacity: 1, y: 0, skewX: 0, duration: 1, ease: "expo.out" }, 0.1)
    .fromTo(".cta-sub",         { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, 0.4)
    .fromTo(".cta-actions .btn",{ opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.8)" }, 0.55);

  gsap.to(".cta-inner", {
    backgroundPosition: "40px 40px", duration: 8, repeat: -1, ease: "none",
    scrollTrigger: { trigger: ".cta-section", start: "top bottom", end: "bottom top", scrub: 2 }
  });

  /* ── Contact header ── */
  const contactHeaderEls = $$(
    ".contact .section-label, .contact .section-title, .contact .section-sub"
  );
  if (contactHeaderEls.length) {
    gsap.fromTo(contactHeaderEls,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".contact .section-header", start: `top ${mob ? 92 : 85}%`, ...once }
      }
    );
  }

  $$(".contact-info-item").forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, ease: "expo.out", delay: i * 0.1,
        scrollTrigger: { trigger: ".contact-info-stack", start: `top ${mob ? 93 : 85}%`, ...once }
      }
    );
  });

  gsap.fromTo(".contact-cta-card",
    { opacity: 0, scale: 0.92, y: 30 },
    { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "expo.out",
      scrollTrigger: { trigger: ".contact-cta-card", start: `top ${mob ? 93 : 85}%`, ...once }
    }
  );

  /* ── Footer ── */
  gsap.fromTo(".footer-brand, .footer-links-col",
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: "power3.out",
      scrollTrigger: { trigger: ".footer-top", start: "top 90%", ...once }
    }
  );
  gsap.fromTo(".footer-bottom",
    { opacity: 0 },
    { opacity: 1, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: ".footer-bottom", start: "top 98%", ...once }
    }
  );

  /* ── Parallax — desktop only, only on safe inner bg elements ── */
  if (!mob) {
    gsap.to(".hero-orb--1", { yPercent: -22, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.5 } });
    gsap.to(".hero-orb--2", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 2 } });
  }
}


/* ─────────────────────────────────────────────────────────────
   8. MAGNETIC BUTTONS
   ───────────────────────────────────────────────────────────── */

function initMagneticButtons() {
  if (!isFinePointer()) return;
  $$(".btn-primary,.btn-white-solid,.nav-cta").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width  / 2) * 0.2,
        y: (e.clientY - r.top  - r.height / 2) * 0.2,
        duration: 0.35, ease: "power2.out"
      });
    });
    btn.addEventListener("mouseleave", () =>
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.5)" })
    );
  });
}


/* ─────────────────────────────────────────────────────────────
   9. CARD TILT
   ───────────────────────────────────────────────────────────── */

function initCardTilt() {
  if (!isFinePointer()) return;
  $$(".product-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.transform = `translateY(-6px) rotateX(${((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -6}deg) rotateY(${((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 6}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}


/* ─────────────────────────────────────────────────────────────
   10. INDUSTRY HOVER
   ───────────────────────────────────────────────────────────── */

function initIndustryHover() {
  $$(".industry-card").forEach(card => {
    const icon = card.querySelector(".industry-icon");
    if (!icon) return;
    card.addEventListener("mouseenter", () => {
      if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1.12, rotate: -6, duration: 0.35, ease: "back.out(3)" });
    });
    card.addEventListener("mouseleave", () => {
      if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1, rotate: 0, duration: 0.4, ease: "elastic.out(1,0.5)" });
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   11. PILLAR HOVER
   ───────────────────────────────────────────────────────────── */

function initPillarHover() {
  if (!isFinePointer()) return;
  $$(".pillar").forEach(p => {
    const icon = p.querySelector(".pillar-icon");
    if (!icon) return;
    p.addEventListener("mouseenter", () => {
      if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1.1, rotate: 5, duration: 0.3, ease: "back.out(2)" });
    });
    p.addEventListener("mouseleave", () => {
      if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1, rotate: 0, duration: 0.35, ease: "elastic.out(1,0.5)" });
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   12. SMOOTH SCROLL
   ───────────────────────────────────────────────────────────── */

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", function(e) {
      const id = this.getAttribute("href");
      if (id === "#") return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   13. ACTIVE NAV
   ───────────────────────────────────────────────────────────── */

function initActiveNav() {
  const sections = $$("section[id]"), links = $$(".nav-link");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
      }
    });
  }, { rootMargin: "-35% 0px -35% 0px" });
  sections.forEach(s => obs.observe(s));
}


/* ─────────────────────────────────────────────────────────────
   14. COUNTERS
   ───────────────────────────────────────────────────────────── */

function initCounters() {
  /* Hero counters are handled by animateHero() after GSAP fade-in.
     This observer is a safety net for any .stat-num outside the hero
     (e.g. added later) — skips ones already processed by animateHero. */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el = entry.target;
      if (el.dataset.counterTarget) return; /* animateHero will handle it */
      const text = el.textContent;
      const match = text.match(/(\d+)/);
      if (!match) return;
      const target = parseInt(match[1]);
      const suffix = full.replace(/\d+/, "");
      let start = 0;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.2 });
  $$(".stat-num:not([data-counter-target])").forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   15. CONTACT CARDS & WHATSAPP
   WhatsApp: uses IntersectionObserver on footer-bottom with
   threshold:0 (fires on first pixel). CSS handles the actual
   movement via .above-footer class.
   ───────────────────────────────────────────────────────────── */

function initContactCards() {
  /* Phone — use a hidden <a> click so the browser handles tel: natively
     without triggering beforeunload / page scroll restore */
  const p = $("#contactPhone");
  if (p) {
    p.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const a = document.createElement("a");
      a.href = "tel:+243903317891";
      a.click();
    });
  }

  /* Email — same hidden anchor trick */
  const em = $("#contactEmail");
  if (em) {
    em.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const a = document.createElement("a");
      a.href = "mailto:info@thesafetystore.com";
      a.click();
    });
  }

  /* Location — Google Maps directions from current position */
  const loc = $("#contactLocation");
  if (loc) {
    loc.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const dest = "Lubumbashi,Democratic+Republic+of+the+Congo";
      const open = url => window.open(url, "_blank", "noopener");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${dest}`),
          ()  => open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`)
        );
      } else {
        open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
      }
    });
  }

  /* WhatsApp CTA card */
  const w = $("#contactWhatsapp");
  if (w) w.addEventListener("click", e => { e.stopPropagation(); });



  /* WhatsApp float fade-in */
  const waf = $("#whatsappFloat");
  if (waf) {
    waf.style.opacity = "0";
    setTimeout(() => {
      waf.style.transition = "opacity 0.7s ease, bottom 0.35s ease, box-shadow 0.3s";
      waf.style.opacity = "1";
    }, 2600);
  }

  /* Push WA button above footer-bottom the moment it enters viewport */
  const footerBottom = $(".footer-bottom");
  if (waf && footerBottom) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        waf.classList.toggle("above-footer", entry.isIntersecting);
      });
    }, { threshold: 0 });
    obs.observe(footerBottom);
  }
}


/* ─────────────────────────────────────────────────────────────
   16. SCROLL PROGRESS
   ───────────────────────────────────────────────────────────── */

function initScrollProgress() {
  const line = $("#scrollProgress");
  if (!line) return;
  window.addEventListener("scroll", () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    line.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
  }, { passive: true });
}


/* ─────────────────────────────────────────────────────────────
   17. FOOTER LINKS
   ───────────────────────────────────────────────────────────── */

function initFooterLinks() {
  if (!isFinePointer()) return;
  $$(".footer-links-col li a").forEach(a => {
    a.addEventListener("mouseenter", () => { if (typeof gsap !== "undefined") gsap.to(a, { paddingLeft: "8px", duration: 0.25, ease: "power2.out" }); });
    a.addEventListener("mouseleave", () => { if (typeof gsap !== "undefined") gsap.to(a, { paddingLeft: "0px", duration: 0.3,  ease: "power2.out" }); });
  });
}


/* ─────────────────────────────────────────────────────────────
   18. I18N — STATIC TRANSLATION
   Why static? This is a brochure site with 2 languages. Static
   means: instant switch, no server, no flash, no async race.
   Dynamic (fetch JSON) only adds value when languages > 5 or
   content is updated from a CMS. For TSS, static is correct.

   French improvements:
   – "Industrie" → "Fabrication" (Manufacturing)
   – "Santé" → "Santé" (fine, kept)
   – "La Sécurité D'abord" aligned better
   – product 8 & 9 deduplicated (8 = harness vest, 9 = full-body)
   ───────────────────────────────────────────────────────────── */

const TRANSLATIONS = {
  en: {
    "loader.text":            "Loading Safety Solutions",
    "nav.home":               "Home",
    "nav.about":              "About",
    "nav.products":           "Products",
    "nav.industries":         "Industries",
    "nav.contact":            "Contact",
    "nav.cta":                "Get a Quote",
    "mobile.tagline":         "WHERE SAFETY BEGINS",
    "hero.badge":             "Global PPE Supplier",
    "hero.badge.short":       "GLOBAL PPE SUPPLIER",
    "hero.title1":            "The",
    "hero.title2":            "Safety",
    "hero.title3":            "Store",
    "hero.sub":               "Premium Quality PPE & Products for Every Professional Need.<br/>Trusted by industries worldwide — Built for precision, designed for safety.",
    "hero.btn1":              "Explore Products",
    "hero.btn2":              "Learn More",
    "hero.stat1":             "Products",
    "hero.stat2":             "Brands",
    "hero.stat3":             "Categories",
    "hero.stat4":             "Years of Experience",
    "marquee.1":              "Head Protection",
    "marquee.2":              "Hand Protection",
    "marquee.3":              "Eye & Face Safety",
    "marquee.4":              "Respiratory Protection",
    "marquee.5":              "Fall Arrest Systems",
    "marquee.6":              "Protective Clothing",
    "marquee.7":              "Ear Protection",
    "marquee.8":              "Safety Footwear",
    "about.label":            "About Us",
    "about.title1":           "Leading the",
    "about.title2":           "Safety",
    "about.title3":           "Industry Since 2019",
    "about.tagline":          "WHERE SAFETY BEGINS",
    "about.years":            "Years of Excellence",
    "about.certified":        "CERTIFIED\nSUPPLIER",
    "about.desc1":            "TSS – The Safety Store is one of the leading importers and exporters of Personal Protective Equipment. We are a multidimensional company supplying a wide range of PPE, work wear, and safety products to industries worldwide.",
    "about.desc2":            "From oil and shipping to automobile and construction — we serve every industry with precision-grade safety solutions. Our full product range makes us a <strong>one-stop-shop</strong> for the discerning customer.",
    "about.pillar1t":         "Certified Quality",
    "about.pillar1s":         "Well-known global brands",
    "about.pillar2t":         "Global Supply",
    "about.pillar2s":         "Import & Export",
    "about.pillar3t":         "Multi-Industry",
    "about.pillar3s":         "Oil, Shipping, Auto, Construction",
    "about.btn":              "View Our Products",
    "products.label":         "What We Offer",
    "products.title1":        "Complete",
    "products.title2":        "PPE",
    "products.title3":        "Categories",
    "products.sub":           "Comprehensive protection for every professional environment and industry requirement.",
    "product.1.title":        "Head Protection",
    "product.1.desc":         "Safety helmets & hard hats for all hazard levels",
    "product.1.tag":          "Essential PPE",
    "product.2.title":        "Respiratory Protection",
    "product.2.desc":         "Dust masks, respirators & air-purifying equipment",
    "product.2.tag":          "Air Safety",
    "product.3.title":        "Eye & Face Protection",
    "product.3.desc":         "Safety goggles, face shields & visors",
    "product.3.tag":          "Vision Safety",
    "product.4.title":        "Protective Footwear",
    "product.4.desc":         "Steel-toe boots, safety shoes & anti-slip footwear",
    "product.4.tag":          "Foot Safety",
    "product.5.title":        "Ear Protection",
    "product.5.desc":         "Earmuffs, earplugs & hearing conservation devices",
    "product.5.tag":          "Hearing Safety",
    "product.6.title":        "Protective Clothing",
    "product.6.desc":         "Coveralls, lab coats, rainwear & high-vis vests",
    "product.6.tag":          "Body Protection",
    "product.7.title":        "Hand Protection",
    "product.7.desc":         "Industrial gloves, cut-resistant & chemical-proof variants",
    "product.7.tag":          "Grip Safety",
    "product.8.title":        "Height Safety Vest",
    "product.8.desc":         "High-visibility safety vests & body harnesses for elevated work",
    "product.8.tag":          "Height Safety",
    "product.9.title":        "Fall Arrest Systems",
    "product.9.desc":         "Full-body harnesses, lanyards & self-retracting lifelines",
    "product.9.tag":          "Fall Protection",
    "product.10.title":       "Fire Safety",
    "product.10.desc":        "Fire extinguishers, suppression equipment & fire-resistant gear",
    "product.10.tag":         "Fire Protection",
    "product.11.title":       "Overhead Load Safety",
    "product.11.desc":        "Lifting slings, shackles & rigging equipment for safe load handling",
    "product.11.tag":         "Lifting Safety",
    "product.12.title":       "Traffic Safety",
    "product.12.desc":        "Cones, barriers & road safety equipment for site & traffic management",
    "product.12.tag":         "Traffic Control",
    "industries.label":       "Industries Served",
    "industries.title1":      "Built for",
    "industries.title2":      "Every",
    "industries.title3":      "Industry",
    "industries.sub":         "From heavy industry to healthcare — our PPE solutions cover it all.",
    "industry.1.title":       "Oil & Gas",
    "industry.1.desc":        "High-temperature & chemical-resistant PPE for extreme environments",
    "industry.2.title":       "Shipping",
    "industry.2.desc":        "Marine-grade safety equipment for ports and open sea operations",
    "industry.3.title":       "Automobile",
    "industry.3.desc":        "Workshop safety gear, gloves and eye protection for auto workers",
    "industry.4.title":       "Construction",
    "industry.4.desc":        "Full-spectrum PPE from hard hats to harness systems for site safety",
    "industry.5.title":       "Manufacturing",
    "industry.5.desc":        "Precision protection for factory floors and production environments",
    "industry.6.title":       "Healthcare",
    "industry.6.desc":        "Medical-grade PPE, lab coats and sterile protection equipment",
    "cta.badge":              "Ready to Get Protected?",
    "cta.title":              "Your One-Stop Destination<br/>for <em>Safety Solutions</em>",
    "cta.sub":                "Connect with us for premium PPE sourced from globally recognised brands. Fast response, competitive pricing.",
    "cta.btn1":               "Contact Us Today",
    "cta.btn2":               "Browse Products",
    "contact.label":          "Get In Touch",
    "contact.title1":         "Let's Talk",
    "contact.title2":         "Safety",
    "contact.sub":            "Reach out via any channel — we respond promptly with the right solution for your PPE needs.",
    "contact.phone.label":    "Call Us",
    "contact.phone.hint":     "Mon–Sat, 9AM–6PM IST",
    "contact.email.label":    "Email Us",
    "contact.email.hint":     "We respond within 24 hours",
    "contact.loc.label":      "Location",
    "contact.loc.val":        "LUBUMBASHI & KOLWEZI",
    "contact.loc.hint":       "Serving clients globally",
    "contact.card.label":     "CONTACT",
    "contact.card.heading":   "We're here to help!<br/>Reach out today.",
    "contact.card.btn":       "GET IN TOUCH",
    "wa.tooltip":             "Chat with us",
    "footer.desc":            "Premium Quality PPE & Products for Every Professional Need. Leading importer and exporter since 2019.",
    "footer.nav":             "Navigation",
    "footer.products":        "Products",
    "footer.copy":            "© 2024 TSS – The Safety Store. All rights reserved.",
    "footer.since":           "Working Since 2019 · PPE Importers & Exporters",
  },
  fr: {
    "loader.text":            "Chargement des Solutions de Sécurité",
    "nav.home":               "Accueil",
    "nav.about":              "À Propos",
    "nav.products":           "Produits",
    "nav.industries":         "Industries",
    "nav.contact":            "Contact",
    "nav.cta":                "Obtenir un Devis",
    "mobile.tagline":         "LA SÉCURITÉ AVANT TOUT",
    "hero.badge":             "Fournisseur Mondial d'EPI",
    "hero.badge.short":       "FOURNISSEUR MONDIAL D'EPI",
    "hero.title1":            "La",
    "hero.title2":            "Sécurité",
    "hero.title3":            "D'abord",
    "hero.sub":               "EPI de qualité premium pour chaque besoin professionnel.<br/>Reconnu mondialement — Conçu pour la précision, fait pour la sécurité.",
    "hero.btn1":              "Explorer les Produits",
    "hero.btn2":              "En Savoir Plus",
    "hero.stat1":             "Produits",
    "hero.stat2":             "Marques",
    "hero.stat3":             "Catégories",
    "hero.stat4":             "Années d'Expérience",
    "marquee.1":              "Protection de la Tête",
    "marquee.2":              "Protection des Mains",
    "marquee.3":              "Protection des Yeux",
    "marquee.4":              "Protection Respiratoire",
    "marquee.5":              "Systèmes Anti-Chute",
    "marquee.6":              "Vêtements de Protection",
    "marquee.7":              "Protection Auditive",
    "marquee.8":              "Chaussures de Sécurité",
    "about.label":            "À Propos",
    "about.title1":           "Leader de la",
    "about.title2":           "Sécurité",
    "about.title3":           "depuis 2019",
    "about.tagline":          "LA SÉCURITÉ AVANT TOUT",
    "about.years":            "Années d'Excellence",
    "about.certified":        "FOURNISSEUR\nCERTIFIÉ",
    "about.desc1":            "TSS – The Safety Store est l'un des principaux importateurs et exportateurs d'équipements de protection individuelle. Société multidimensionnelle, nous fournissons une large gamme d'EPI, de vêtements de travail et de produits de sécurité aux industries du monde entier.",
    "about.desc2":            "Du pétrole au maritime, de l'automobile à la construction — nous servons chaque industrie avec des solutions de sécurité de précision. Notre gamme complète fait de nous le <strong>guichet unique</strong> pour le client exigeant.",
    "about.pillar1t":         "Qualité Certifiée",
    "about.pillar1s":         "Marques mondiales reconnues",
    "about.pillar2t":         "Approvisionnement Mondial",
    "about.pillar2s":         "Import & Export",
    "about.pillar3t":         "Multi-Industries",
    "about.pillar3s":         "Pétrole, Maritime, Auto, Construction",
    "about.btn":              "Voir Nos Produits",
    "products.label":         "Ce Que Nous Offrons",
    "products.title1":        "Gamme Complète",
    "products.title2":        "d'EPI",
    "products.title3":        "Professionnels",
    "products.sub":           "Protection complète pour chaque environnement professionnel et exigence industrielle.",
    "product.1.title":        "Protection de la Tête",
    "product.1.desc":         "Casques et chapeaux de protection pour tous niveaux de danger",
    "product.1.tag":          "EPI Essentiel",
    "product.2.title":        "Protection Respiratoire",
    "product.2.desc":         "Masques, respirateurs et équipements de purification d'air",
    "product.2.tag":          "Sécurité Respiratoire",
    "product.3.title":        "Protection des Yeux",
    "product.3.desc":         "Lunettes de sécurité, écrans faciaux et visières",
    "product.3.tag":          "Sécurité Visuelle",
    "product.4.title":        "Chaussures de Sécurité",
    "product.4.desc":         "Bottes à embout acier, chaussures et semelles antidérapantes",
    "product.4.tag":          "Sécurité Pieds",
    "product.5.title":        "Protection Auditive",
    "product.5.desc":         "Protège-oreilles, bouchons et dispositifs de conservation auditive",
    "product.5.tag":          "Sécurité Auditive",
    "product.6.title":        "Vêtements de Protection",
    "product.6.desc":         "Combinaisons, blouses, imperméables et vestes haute visibilité",
    "product.6.tag":          "Protection Corporelle",
    "product.7.title":        "Protection des Mains",
    "product.7.desc":         "Gants industriels, résistants aux coupures et aux produits chimiques",
    "product.7.tag":          "Sécurité des Mains",
    "product.8.title":        "Gilet de Sécurité",
    "product.8.desc":         "Gilets haute visibilité et harnais corporels pour le travail en hauteur",
    "product.8.tag":          "Sécurité Hauteur",
    "product.9.title":        "Systèmes Antichute",
    "product.9.desc":         "Harnais complets, longes et lignes de vie autorétractables",
    "product.9.tag":          "Protection Chute",
    "product.10.title":       "Sécurité Incendie",
    "product.10.desc":        "Extincteurs, systèmes de suppression et équipements résistants au feu",
    "product.10.tag":         "Protection Incendie",
    "product.11.title":       "Sécurité des Charges",
    "product.11.desc":        "Élingues, manilles et équipements de gréage pour la manutention sûre",
    "product.11.tag":         "Sécurité Levage",
    "product.12.title":       "Sécurité Routière",
    "product.12.desc":        "Cônes, barrières et équipements pour la gestion du trafic sur chantier",
    "product.12.tag":         "Contrôle Trafic",
    "industries.label":       "Industries Desservies",
    "industries.title1":      "Adapté à",
    "industries.title2":      "Chaque",
    "industries.title3":      "Industrie",
    "industries.sub":         "De l'industrie lourde aux soins de santé — nos solutions EPI couvrent tout.",
    "industry.1.title":       "Pétrole & Gaz",
    "industry.1.desc":        "EPI haute température et résistant aux produits chimiques pour environnements extrêmes",
    "industry.2.title":       "Maritime",
    "industry.2.desc":        "Équipements de sécurité de qualité marine pour ports et opérations en mer",
    "industry.3.title":       "Automobile",
    "industry.3.desc":        "Équipements d'atelier, gants et protection oculaire pour techniciens auto",
    "industry.4.title":       "Construction",
    "industry.4.desc":        "EPI complet — des casques aux systèmes de harnais — pour la sécurité sur chantier",
    "industry.5.title":       "Fabrication",
    "industry.5.desc":        "Protection de précision pour ateliers et environnements de production industrielle",
    "industry.6.title":       "Santé",
    "industry.6.desc":        "EPI médical, blouses de laboratoire et équipements de protection stérile",
    "cta.badge":              "Prêt à Être Protégé ?",
    "cta.title":              "Votre Destination Unique<br/>pour les <em>Solutions de Sécurité</em>",
    "cta.sub":                "Contactez-nous pour des EPI premium issus de marques mondiales reconnues. Réponse rapide, tarifs compétitifs.",
    "cta.btn1":               "Nous Contacter",
    "cta.btn2":               "Voir les Produits",
    "contact.label":          "Contactez-Nous",
    "contact.title1":         "Parlons",
    "contact.title2":         "Sécurité",
    "contact.sub":            "Contactez-nous par n'importe quel canal — nous répondons rapidement avec la bonne solution pour vos besoins en EPI.",
    "contact.phone.label":    "Appelez-Nous",
    "contact.phone.hint":     "Lun–Sam, 9h–18h",
    "contact.email.label":    "Écrivez-Nous",
    "contact.email.hint":     "Réponse sous 24 heures",
    "contact.loc.label":      "Localisation",
    "contact.loc.val":        "LUBUMBASHI & KOLWEZI",
    "contact.loc.hint":       "Service clientèle mondial",
    "contact.card.label":     "CONTACT",
    "contact.card.heading":   "Nous sommes là pour vous !<br/>Contactez-nous dès aujourd'hui.",
    "contact.card.btn":       "PRENDRE CONTACT",
    "wa.tooltip":             "Discutez avec nous",
    "footer.desc":            "EPI de qualité premium pour chaque besoin professionnel. Importateur et exportateur leader depuis 2019.",
    "footer.nav":             "Navigation",
    "footer.products":        "Produits",
    "footer.copy":            "© 2024 TSS – The Safety Store. Tous droits réservés.",
    "footer.since":           "Depuis 2019 · Importateurs & Exportateurs d'EPI",
  }
};

let currentLang = localStorage.getItem("tss-lang") || "en";

function applyTranslations(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  /* Fade out first — do NOT set lang attr yet,
     because [lang="fr"] CSS rules change font-size
     and would cause a visible layout shift while still visible */
  document.body.classList.add("lang-switching");

  setTimeout(() => {
    /* Now invisible — safe to swap lang attr (triggers font-size change)
       and update all text content */
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    /* Force reflow so all size changes settle before fade-in */
    void document.body.offsetHeight;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.body.classList.remove("lang-switching");
    }));
  }, 200);
}

function initLangSwitcher() {
  const btns = document.querySelectorAll(".lang-btn");
  const saved = localStorage.getItem("tss-lang") || "en";
  applyTranslations(saved);
  btns.forEach(btn => btn.classList.toggle("active", btn.getAttribute("data-lang") === saved));
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (btn.classList.contains("active")) return;
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyTranslations(lang);
      localStorage.setItem("tss-lang", lang);
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   19. BOOT
   ───────────────────────────────────────────────────────────── */

function init() {
  document.body.classList.add("js-ready");

  /* Prime hero elements IMMEDIATELY so they're hidden before
     anything renders — eliminates flash-of-visible-content */
  onGsapReady(primeHeroElements);

  initLoader();
  initCursor();
  initNavbar();
  initMobileMenu();
  initHeroParticles();
  initSmoothScroll();
  initCardTilt();
  initActiveNav();
  initCounters();
  initContactCards();
  initIndustryHover();
  initPillarHover();
  initScrollProgress();
  initFooterLinks();
  initLangSwitcher();

  onGsapReady(() => {
    initScrollAnimations();
    initMagneticButtons();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}