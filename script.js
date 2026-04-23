"use strict";

/* ═══════════════════════════════════════════════════════════════
   TSS – The Safety Store  |  script.js  (Optimised & Structured)
   ═══════════════════════════════════════════════════════════════

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
   8. ADVANCED ANIMATIONS  (merged from initAdvancedAnimations)
   9. MAGNETIC BUTTONS
  10. CARD TILT
  11. INDUSTRY HOVER
  12. PILLAR HOVER
  13. SMOOTH SCROLL
  14. ACTIVE NAV
  15. COUNTERS
  16. CONTACT CARDS
  17. SCROLL PROGRESS
  18. FOOTER LINKS
  19. BOOT
   ═══════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────
   0. UTILITIES
   ───────────────────────────────────────────────────────────── */

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const isMobile = () => window.innerWidth < 768;
const isFinePointer = () => window.matchMedia("(hover:hover) and (pointer:fine)").matches;

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
   1. LOADER — curtain wipe out
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
   ───────────────────────────────────────────────────────────── */

function initCursor() {
  const ring = $("#cCursor"), dot = $("#cDot");
  if (!ring || !dot) return;

  let mx = -400, my = -400, rx = -400, ry = -400, rafId = null;

  function show(v) {
    ring.style.opacity = v ? "1" : "0";
    dot.style.opacity = v ? "1" : "0";
  }

  function start() {
    if (!isFinePointer()) { show(false); return; }
    show(true);

    document.onmousemove = e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    };

    if (rafId) cancelAnimationFrame(rafId);
    (function loop() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      rafId = requestAnimationFrame(loop);
    })();
  }

  // Re-init when devtools switches pointer type
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

  const ctaSection = $(".cta-section");
  if (ctaSection) {
    ctaSection.addEventListener("mouseenter", () => document.body.classList.add("badge-hover"));
    ctaSection.addEventListener("mouseleave", () => document.body.classList.remove("badge-hover"));
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
    // Belt-and-suspenders: clear any GSAP transform on navbar
    if (navbar.style.transform && navbar.style.transform !== "none") {
      navbar.style.transform = "none";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load

  onGsapReady(() => {
    if (!isMobile()) {
      gsap.from(".nav-logo", { opacity: 0, duration: 0.9, ease: "expo.out", delay: 1.6 });
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
  const hb = document.getElementById("hamburger");
  const menu = document.getElementById("mobileMenu");
  const backdrop = document.getElementById("mobileBackdrop");
  const closeBtn = document.getElementById("mobileCloseBtn");

  function openMenu() {
    hb.classList.add("open");
    menu.classList.add("open");
    backdrop.classList.add("open");
    document.body.classList.add("menu-open");
    menu.setAttribute("aria-hidden", "false");
    hb.setAttribute("aria-expanded", "true");

    // GSAP animation
    if (typeof gsap !== "undefined") {
      gsap.set(".mobile-link", { opacity: 0, x: 80 });

      gsap.to(".mobile-link", {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "expo.out",
        delay: 0.15
      });
    }

    // Footer animation
    gsap.to(".mobile-menu-footer", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: 0.3,
      ease: "expo.out"
    });
  }

  function closeMenu() {
    hb.classList.remove("open");
    menu.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden", "true");
    hb.setAttribute("aria-expanded", "false");
  }

  hb.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  backdrop.addEventListener("click", closeMenu);

  // Close menu when any mobile nav link is tapped
  document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}


/* ─────────────────────────────────────────────────────────────
   5. HERO PARTICLES
   ───────────────────────────────────────────────────────────── */

function initHeroParticles() {
  const c = $("#heroParticles");
  if (!c) return;

  // Inject keyframe once
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
   6. HERO ANIMATIONS — cinematic entry
   ───────────────────────────────────────────────────────────── */

function animateHero() {
  if (typeof gsap === "undefined") return;
  const mob = isMobile();

  // Set initial states to prevent flash
  gsap.set(".hero-badge", { opacity: 0, y: 24, scale: 0.9 });
  gsap.set(".hero-line .hero-word", { opacity: 0, y: mob ? 60 : 90, skewX: mob ? 0 : -4 });
  gsap.set(".hero-sub", { opacity: 0, y: 22 });
  gsap.set(".hero-actions .btn", { opacity: 0, y: 18, scale: 0.95 });
  gsap.set(".hero-stats", { opacity: 0, y: 22 });
  gsap.set(".hero-stat", { opacity: 0, y: 14 });

  // Animate PPE category items (desktop only — they're hidden on mobile)
  if (!mob) {
    gsap.set(".hero-ppe-item", { opacity: 0, y: 30, scale: 0.88 });
    gsap.to(".hero-ppe-item", {
      opacity: 1, y: 0, scale: 1,
      duration: 0.6,
      stagger: 0.07,
      ease: "back.out(1.4)",
      delay: 0.9
    });
  }

  // Text timeline
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.fromTo(".hero-badge",      { opacity: 0, y: 24, scale: 0.9 },       { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0)
    .fromTo(".hero-line .hero-word", { opacity: 0, y: mob ? 60 : 90, skewX: mob ? 0 : -4 }, { opacity: 1, y: 0, skewX: 0, duration: mob ? 0.85 : 1.15, stagger: 0.1 }, 0.15)
    .fromTo(".hero-sub",        { opacity: 0, y: 22 },                    { opacity: 1, y: 0, duration: 0.85 }, mob ? 0.5 : 0.65)
    .fromTo(".hero-actions .btn", { opacity: 0, y: 18, scale: 0.95 },     { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1 }, mob ? 0.65 : 0.8)
    .fromTo(".hero-stats",      { opacity: 0, y: 22 },                    { opacity: 1, y: 0, duration: 0.7 }, mob ? 0.8 : 1.0)
    .fromTo(".hero-stat",       { opacity: 0, y: 14 },                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, mob ? 0.85 : 1.05);
}


/* ─────────────────────────────────────────────────────────────
   7. SCROLL ANIMATIONS
   ───────────────────────────────────────────────────────────── */

function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const mob = isMobile();
  const once = { toggleActions: "play none none none", once: true };

  // ── Pre-hide scroll-animated elements to prevent flicker ──
  gsap.set(".marquee-section", { opacity: 0, y: 10 });
  gsap.set(".about-card-main", { opacity: 0 });
  gsap.set(".about-floating-badge", { opacity: 0 });
  gsap.set([".about .section-label", ".about .section-title", ".about-desc", ".pillar", ".about-cta"], { opacity: 0 });
  gsap.set([".products .section-label", ".products .section-title", ".products .section-sub"], { opacity: 0 });
  gsap.set(".product-card", { opacity: 0 });
  gsap.set([".industries .section-label", ".industries .section-title"], { opacity: 0 });
  gsap.set(".industry-card", { opacity: 0 });
  gsap.set([".cta-badge", ".cta-title", ".cta-sub"], { opacity: 0 });
  gsap.set(".cta-actions .btn", { opacity: 0 });
  gsap.set([".contact .section-label", ".contact .section-title", ".contact .section-sub"], { opacity: 0 });
  gsap.set(".contact-info-item", { opacity: 0 });
  gsap.set(".contact-cta-card", { opacity: 0 });
  gsap.set([".footer-brand", ".footer-links-col", ".footer-bottom"], { opacity: 0 });

  // ── Marquee ──
  ScrollTrigger.create({
    trigger: ".marquee-section", start: "top 95%", once: true,
    onEnter: () => gsap.to(".marquee-section", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
  });

  const mq = $(".marquee-content");
  if (mq) {
    mq.addEventListener("mouseenter", () => mq.style.animationPlayState = "paused");
    mq.addEventListener("mouseleave", () => mq.style.animationPlayState = "running");
  }

  // ── About ──
  gsap.fromTo(".about-card-main",
    { opacity: 0, x: mob ? 0 : -60, y: mob ? 40 : 0, rotateY: mob ? 0 : -8 },
    {
      opacity: 1, x: 0, y: 0, rotateY: 0, duration: mob ? 0.8 : 1.1, ease: "expo.out",
      scrollTrigger: { trigger: ".about-visual", start: "top 82%", ...once }
    }
  );
  gsap.fromTo(".about-floating-badge",
    { opacity: 0, scale: 0.6, rotate: -20 },
    {
      opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(2)",
      scrollTrigger: { trigger: ".about-visual", start: "top 75%", ...once }
    }
  );

  if (!mob && isFinePointer()) {
    const aboutCard = $(".about-card-main");
    if (aboutCard) {
      aboutCard.addEventListener("mousemove", e => {
        const r = aboutCard.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -5;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 5;
        gsap.to(aboutCard, { rotateX: rx, rotateY: ry, duration: 0.4, ease: "power2.out", transformPerspective: 600 });
      });
      aboutCard.addEventListener("mouseleave", () => {
        gsap.to(aboutCard, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
      });
    }
  }

  [".about .section-label", ".about .section-title", ".about-desc", ".pillar", ".about-cta"].forEach((sel, i) => {
    gsap.utils.toArray(sel).forEach((el, j) => {
      gsap.fromTo(el,
        { opacity: 0, y: 32, x: mob ? 0 : 14 },
        {
          opacity: 1, y: 0, x: 0, duration: 0.75, ease: "power3.out",
          delay: i * 0.07 + j * 0.05,
          scrollTrigger: { trigger: ".about-content", start: "top 82%", ...once }
        }
      );
    });
  });

  // ── Products header ──
  gsap.fromTo(".products .section-label",
    { opacity: 0, y: 20, letterSpacing: "8px" },
    {
      opacity: 1, y: 0, letterSpacing: "4px", duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: ".products .section-header", start: "top 88%", ...once }
    }
  );
  gsap.fromTo(".products .section-title",
    { opacity: 0, y: 36, skewX: mob ? 0 : -3 },
    {
      opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: "expo.out",
      scrollTrigger: { trigger: ".products .section-header", start: "top 85%", ...once }
    }
  );
  gsap.fromTo(".products .section-sub",
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: ".products .section-header", start: "top 82%", ...once }
    }
  );

  // ── Product cards — wave stagger ──
  const cards = $$(".product-card"), cols = mob ? 2 : 4;
  if (mob) {
    // Mobile: alternating side slide-in
    cards.forEach((card, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      gsap.fromTo(card,
        { opacity: 0, x: 30 * dir, y: 20 },
        {
          opacity: 1, x: 0, y: 0, duration: 0.7, ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 92%", ...once }
        }
      );
    });
  } else {
    cards.forEach((card, i) => {
      const row = Math.floor(i / cols), col = i % cols;
      gsap.fromTo(card,
        { opacity: 0, y: 56, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out",
          delay: row * 0.06 + col * 0.05,
          scrollTrigger: { trigger: ".product-grid", start: "top 82%", ...once }
        }
      );
    });
  }

  // ── Industries ──
  gsap.fromTo(".industries .section-label",
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: ".industries .section-header", start: "top 88%", ...once }
    }
  );
  gsap.fromTo(".industries .section-title",
    { opacity: 0, y: 36, skewX: mob ? 0 : -3 },
    {
      opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: "expo.out",
      scrollTrigger: { trigger: ".industries .section-header", start: "top 85%", ...once }
    }
  );
  gsap.utils.toArray(".industry-card").forEach((card, i) => {
    if (mob) {
      gsap.fromTo(card,
        { opacity: 0, scale: 0.88, y: 20 },
        {
          opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)", delay: i * 0.06,
          scrollTrigger: { trigger: ".industry-grid", start: "top 88%", ...once }
        }
      );
    } else {
      gsap.fromTo(card,
        { opacity: 0, y: 44, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.4)", delay: (i % 6) * 0.07,
          scrollTrigger: { trigger: ".industry-grid", start: "top 84%", ...once }
        }
      );
    }
  });

  // ── CTA ──
  const ctaTL = gsap.timeline({ scrollTrigger: { trigger: ".cta-section", start: "top 78%", ...once } });
  ctaTL
    .fromTo(".cta-badge", { opacity: 0, y: 24, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(2)" }, 0)
    .fromTo(".cta-title", { opacity: 0, y: 50, skewX: -4 }, { opacity: 1, y: 0, skewX: 0, duration: 1, ease: "expo.out" }, 0.1)
    .fromTo(".cta-sub", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, 0.4)
    .fromTo(".cta-actions .btn", { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.8)" }, 0.55);

  gsap.to(".cta-inner", {
    backgroundPosition: "40px 40px",
    duration: 8, repeat: -1, ease: "none",
    scrollTrigger: { trigger: ".cta-section", start: "top bottom", end: "bottom top", scrub: 2 }
  });

  // ── Contact ──
  gsap.fromTo(".contact .section-label,.contact .section-title,.contact .section-sub",
    { opacity: 0, y: 32 },
    {
      opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".contact .section-header", start: "top 85%", ...once }
    }
  );
  gsap.utils.toArray(".contact-card").forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "expo.out", delay: i * 0.1,
        scrollTrigger: { trigger: ".contact-cards", start: "top 84%", ...once }
      }
    );
  });
  gsap.utils.toArray(".contact-info-item").forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: "expo.out", delay: i * 0.1,
        scrollTrigger: { trigger: ".contact-info-stack", start: "top 85%", ...once }
      }
    );
  });
  gsap.fromTo(".contact-cta-card",
    { opacity: 0, scale: 0.92, y: 30 },
    {
      opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "expo.out",
      scrollTrigger: { trigger: ".contact-cta-card", start: "top 85%", ...once }
    }
  );

  if (mob) {
    gsap.fromTo(".contact-hero-left", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: ".contact-hero", start: "top 88%", ...once } });
    gsap.fromTo(".contact-hero-right", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", delay: 0.2, scrollTrigger: { trigger: ".contact-hero", start: "top 88%", ...once } });
  }

  // ── Section labels & titles (generic pass) ──
  gsap.utils.toArray(".section-title").forEach(title => {
    gsap.fromTo(title,
      { opacity: 0, y: 36, skewX: mob ? 0 : -3 },
      {
        opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: title, start: "top 88%", ...once }
      }
    );
  });
  gsap.utils.toArray(".section-label").forEach(label => {
    gsap.fromTo(label,
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: label, start: "top 90%", ...once }
      }
    );
  });

  // ── Pillar items ──
  gsap.utils.toArray(".pillar").forEach((p, i) => {
    gsap.fromTo(p,
      { opacity: 0, x: -32 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: "expo.out", delay: i * 0.1,
        scrollTrigger: { trigger: ".about-pillars", start: "top 85%", ...once }
      }
    );
  });

  // ── Footer ──
  gsap.fromTo(".footer-brand,.footer-links-col",
    { opacity: 0, y: 28 },
    {
      opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: "power3.out",
      scrollTrigger: { trigger: ".footer-top", start: "top 90%", ...once }
    }
  );
  gsap.fromTo(".footer-bottom",
    { opacity: 0 },
    {
      opacity: 1, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: ".footer-bottom", start: "top 98%", ...once }
    }
  );

  // ── Parallax — desktop only ──
  // CRITICAL: Never apply scrub/transform to .hero or any section element.
  // Only animate inner bg layers (.hero-grid, .hero-orb) which are absolutely
  // positioned children — safe to transform.
  if (!mob) {
    gsap.to(".hero-grid", { yPercent: -15, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    gsap.to(".hero-orb--1", { yPercent: -22, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.5 } });
    gsap.to(".hero-orb--2", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 2 } });
  }
}


/* ─────────────────────────────────────────────────────────────
   9. MAGNETIC BUTTONS
   ───────────────────────────────────────────────────────────── */

function initMagneticButtons() {
  if (!isFinePointer()) return;
  $$(".btn-primary,.btn-white-solid,.nav-cta").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.2,
        y: (e.clientY - r.top - r.height / 2) * 0.2,
        duration: 0.35, ease: "power2.out"
      });
    });
    btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.5)" }));
  });
}


/* ─────────────────────────────────────────────────────────────
   10. CARD TILT
   ───────────────────────────────────────────────────────────── */

function initCardTilt() {
  if (!isFinePointer()) return;
  $$(".product-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -6;
      const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 6;
      card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}


/* ─────────────────────────────────────────────────────────────
   11. INDUSTRY HOVER — bounce + elastic restore
   ───────────────────────────────────────────────────────────── */

function initIndustryHover() {
  $$(".industry-card").forEach(card => {
    const icon = card.querySelector(".industry-icon");
    card.addEventListener("mouseenter", () => { if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1.12, rotate: -6, duration: 0.35, ease: "back.out(3)" }); });
    card.addEventListener("mouseleave", () => { if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1, rotate: 0, duration: 0.4, ease: "elastic.out(1,0.5)" }); });
  });
}


/* ─────────────────────────────────────────────────────────────
   12. PILLAR HOVER
   ───────────────────────────────────────────────────────────── */

function initPillarHover() {
  if (!isFinePointer()) return;
  $$(".pillar").forEach(p => {
    const icon = p.querySelector(".pillar-icon");
    p.addEventListener("mouseenter", () => { if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1.1, rotate: 5, duration: 0.3, ease: "back.out(2)" }); });
    p.addEventListener("mouseleave", () => { if (typeof gsap !== "undefined") gsap.to(icon, { scale: 1, rotate: 0, duration: 0.35, ease: "elastic.out(1,0.5)" }); });
  });
}


/* ─────────────────────────────────────────────────────────────
   13. SMOOTH SCROLL
   ───────────────────────────────────────────────────────────── */

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", function (e) {
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
   14. ACTIVE NAV
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
   15. COUNTERS
   ───────────────────────────────────────────────────────────── */

function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el = entry.target;
      const text = el.textContent;
      const match = text.match(/(\d+)/);
      if (!match) return;
      const target = parseInt(match[1]);
      const suffix = text.replace(/\d/g, "");
      let start = 0;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1400, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$(".stat-num").forEach(el => obs.observe(el));
}


/* ─────────────────────────────────────────────────────────────
   16. CONTACT CARDS
   ───────────────────────────────────────────────────────────── */

function initContactCards() {
  const p = $("#contactPhone"); if (p) p.addEventListener("click", () => { window.location.href = "tel:+910000000000"; });
  const e = $("#contactEmail"); if (e) e.addEventListener("click", () => { window.location.href = "mailto:info@thesafetystore.com"; });
  const w = $("#contactWhatsapp"); if (w) w.addEventListener("click", () => { window.open("https://wa.me/910000000000", "_blank"); });

  // WhatsApp float — pure CSS fade-in.
  // CRITICAL: GSAP must NEVER touch fixed elements (breaks position:fixed on iOS Safari).
  const waf = $("#whatsappFloat");
  if (waf) {
    waf.style.opacity = "0";
    setTimeout(() => {
      waf.style.transition = "opacity 0.7s ease";
      waf.style.opacity = "1";
      setTimeout(() => { waf.style.transition = ""; }, 800);
    }, 2600);
  }
}


/* ─────────────────────────────────────────────────────────────
   17. SCROLL PROGRESS
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
   18. FOOTER LINKS — indent on hover
   ───────────────────────────────────────────────────────────── */

function initFooterLinks() {
  if (!isFinePointer()) return;
  $$(".footer-links-col li a").forEach(a => {
    a.addEventListener("mouseenter", () => { if (typeof gsap !== "undefined") gsap.to(a, { paddingLeft: "8px", duration: 0.25, ease: "power2.out" }); });
    a.addEventListener("mouseleave", () => { if (typeof gsap !== "undefined") gsap.to(a, { paddingLeft: "0px", duration: 0.3, ease: "power2.out" }); });
  });
}


/* ─────────────────────────────────────────────────────────────
   19. BOOT
   ───────────────────────────────────────────────────────────── */

function init() {
  // Mark body so CSS can safely hide pre-animation elements (prevents flicker)
  document.body.classList.add("js-ready");

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

  onGsapReady(() => {
    initScrollAnimations();  // includes advanced animations (merged)
    initMagneticButtons();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* ═══════════════════════════════════════════════════════════════
   TSS PATCH 3 — Language switcher, nav blur, scroll-to-top, menu fixes
   ═══════════════════════════════════════════════════════════════ */

/* ── SCROLL RESTORE: always open at top on refresh ── */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

/* ── MOBILE MENU: close btn + navbar blur + updated open/close ── */
(function patchMobileMenu() {
  const closeBtn = document.getElementById('mobileCloseBtn');
  const hb = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('mobileBackdrop');
  const navbar = document.getElementById('navbar');

  if (!closeBtn || !menu) return;

  function openM() {
    hb && hb.classList.add('open');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('open');
    if (navbar) navbar.classList.add('menu-open');
    document.body.classList.add('menu-open');
    if (hb) hb.setAttribute('aria-expanded', 'true');
    // Stagger links
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.mobile-link',
        { x: 28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'expo.out', delay: 0.15 }
      );
      gsap.to('.mobile-menu-footer', {
        opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', delay: 0.3
      });
    }
  }

  function closeM() {
    hb && hb.classList.remove('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('open');
    if (navbar) navbar.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    if (hb) hb.setAttribute('aria-expanded', 'false');
  }

  closeBtn.addEventListener('click', closeM);
  // Also keep hamburger click working for open (initMobileMenu handles it,
  // but we override close to use our closeM)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeM(); });
})();


/* ── I18N: translation dictionary + switcher ── */
const TRANSLATIONS = {
  en: {
    "loader.text": "Loading Safety Solutions",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.products": "Products",
    "nav.industries": "Industries",
    "nav.contact": "Contact",
    "nav.cta": "Get a Quote",
    "mobile.tagline": "WHERE SAFETY BEGINS · EST. 2019",
    "hero.badge": "Established 2019 · Global PPE Supplier",
    "hero.badge.short": "GLOBAL PPE SUPPLIER",
    "hero.title1": "The",
    "hero.title2": "Safety",
    "hero.title3": "Store",
    "hero.sub": "Premium Quality PPE & Products for Every Professional Need.<br/>Trusted by industries worldwide — Built for precision, designed for safety.",
    "hero.btn1": "Explore Products",
    "hero.btn2": "Learn More",
    "hero.stat1": "Founded",
    "hero.stat2": "Products",
    "hero.stat3": "Categories",
    "hero.stat4": "Industries",
    "marquee.1": "Head Protection",
    "marquee.2": "Hand Protection",
    "marquee.3": "Eye & Face Safety",
    "marquee.4": "Respiratory Protection",
    "marquee.5": "Fall Arrest Systems",
    "marquee.6": "Protective Clothing",
    "marquee.7": "Ear Protection",
    "marquee.8": "Safety Footwear",
    "about.label": "About Us",
    "about.title1": "Leading the",
    "about.title2": "Safety",
    "about.title3": "Industry Since 2019",
    "about.tagline": "WHERE SAFETY BEGINS",
    "about.years": "Years of Excellence",
    "about.certified": "CERTIFIED\nSUPPLIER",
    "about.desc1": "TSS – The Safety Store is one of the leading importers and exporters of Personal Protective Equipment. We are a multidimensional company supplying a wide range of PPE, work wear, and safety products to industries worldwide.",
    "about.desc2": "From oil and shipping to automobile and construction — we serve every industry with precision-grade safety solutions. Our full product range makes us a <strong>one-stop-shop</strong> for the discerning customer.",
    "about.pillar1t": "Certified Quality",
    "about.pillar1s": "Well-known global brands",
    "about.pillar2t": "Global Supply",
    "about.pillar2s": "Import & Export",
    "about.pillar3t": "Multi-Industry",
    "about.pillar3s": "Oil, Shipping, Auto, Construction",
    "about.btn": "View Our Products",
    "products.label": "What We Offer",
    "products.title1": "Complete",
    "products.title2": "PPE",
    "products.title3": "Categories",
    "products.sub": "Comprehensive protection for every professional environment and industry requirement.",
    "product.1.title": "Head Protection",
    "product.1.desc": "Safety helmets & hard hats for all hazard levels",
    "product.1.tag": "Essential PPE",
    "product.2.title": "Respiratory Protection",
    "product.2.desc": "Dust masks, respirators & air-purifying equipment",
    "product.2.tag": "Air Safety",
    "product.3.title": "Eye & Face Protection",
    "product.3.desc": "Safety goggles, face shields & visors",
    "product.3.tag": "Vision Safety",
    "product.4.title": "Protective Footwear",
    "product.4.desc": "Steel-toe boots, safety shoes & anti-slip footwear",
    "product.4.tag": "Foot Safety",
    "product.5.title": "Ear Protection",
    "product.5.desc": "Earmuffs, earplugs & hearing conservation devices",
    "product.5.tag": "Hearing Safety",
    "product.6.title": "Protective Clothing",
    "product.6.desc": "Coveralls, lab coats, rainwear & high-vis vests",
    "product.6.tag": "Body Protection",
    "product.7.title": "Hand Protection",
    "product.7.desc": "Industrial gloves, cut-resistant & chemical-proof variants",
    "product.7.tag": "Grip Safety",
    "product.8.title": "Fall Protection",
    "product.8.desc": "Harness belts, lanyards & fall arrest systems",
    "product.8.tag": "Height Safety",
    "industries.label": "Industries Served",
    "industries.title1": "Built for",
    "industries.title2": "Every",
    "industries.title3": "Industry",
    "industries.sub": "From heavy industry to healthcare — our PPE solutions cover it all.",
    "industry.1.title": "Oil & Gas",
    "industry.1.desc": "High-temperature & chemical-resistant PPE for extreme environments",
    "industry.2.title": "Shipping",
    "industry.2.desc": "Marine-grade safety equipment for ports and open sea operations",
    "industry.3.title": "Automobile",
    "industry.3.desc": "Workshop safety gear, gloves and eye protection for auto workers",
    "industry.4.title": "Construction",
    "industry.4.desc": "Full-spectrum PPE from hard hats to harness systems for site safety",
    "industry.5.title": "Manufacturing",
    "industry.5.desc": "Precision protection for factory floors and production environments",
    "industry.6.title": "Healthcare",
    "industry.6.desc": "Medical-grade PPE, lab coats and sterile protection equipment",
    "cta.badge": "Ready to Get Protected?",
    "cta.title": "Your One-Stop Destination<br/>for <em>Safety Solutions</em>",
    "cta.sub": "Connect with us for premium PPE sourced from globally recognised brands. Fast response, competitive pricing.",
    "cta.btn1": "Contact Us Today",
    "cta.btn2": "Browse Products",
    "contact.label": "Get In Touch",
    "contact.title1": "Let's Talk",
    "contact.title2": "Safety",
    "contact.sub": "Reach out via any channel — we respond promptly with the right solution for your PPE needs.",
    "contact.phone.label": "Call Us",
    "contact.phone.hint": "Mon–Sat, 9AM–6PM IST",
    "contact.email.label": "Email Us",
    "contact.email.hint": "We respond within 24 hours",
    "contact.loc.label": "Location",
    "contact.loc.val": "India",
    "contact.loc.hint": "Serving clients globally",
    "contact.card.label": "CONTACT",
    "contact.card.heading": "We're here to help!<br/>Reach out today.",
    "contact.card.btn": "GET IN TOUCH",
    "wa.tooltip": "Chat with us",
    "footer.desc": "Premium Quality PPE & Products for Every Professional Need. Leading importer and exporter since 2019.",
    "footer.nav": "Navigation",
    "footer.products": "Products",
    "footer.copy": "© 2024 TSS – The Safety Store. All rights reserved.",
    "footer.since": "Working Since 2019 · PPE Importers & Exporters",
  },
  fr: {
    "loader.text": "Chargement des Solutions de Sécurité",
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.products": "Produits",
    "nav.industries": "Industries",
    "nav.contact": "Contact",
    "nav.cta": "Obtenir un Devis",
    "mobile.tagline": "LA SÉCURITÉ AVANT TOUT · FONDÉ 2019",
    "hero.badge": "Fondé en 2019 · Fournisseur Mondial d'EPI",
    "hero.badge.short": "FOURNISSEUR MONDIAL D'EPI",
    "hero.title1": "La",
    "hero.title2": "Sécurité",
    "hero.title3": "D'abord",
    "hero.sub": "EPI de qualité premium pour chaque besoin professionnel.<br/>Reconnu mondialement — Conçu pour la précision, fait pour la sécurité.",
    "hero.btn1": "Explorer les Produits",
    "hero.btn2": "En Savoir Plus",
    "hero.stat1": "Fondé",
    "hero.stat2": "Produits",
    "hero.stat3": "Catégories",
    "hero.stat4": "Industries",
    "marquee.1": "Protection de la Tête",
    "marquee.2": "Protection des Mains",
    "marquee.3": "Protection des Yeux",
    "marquee.4": "Protection Respiratoire",
    "marquee.5": "Systèmes Anti-Chute",
    "marquee.6": "Vêtements de Protection",
    "marquee.7": "Protection Auditive",
    "marquee.8": "Chaussures de Sécurité",
    "about.label": "À Propos",
    "about.title1": "Leader dans la",
    "about.title2": "Sécurité",
    "about.title3": "depuis 2019",
    "about.tagline": "LA SÉCURITÉ AVANT TOUT",
    "about.years": "Années d'Excellence",
    "about.certified": "FOURNISSEUR\nCERTIFIÉ",
    "about.desc1": "TSS – The Safety Store est l'un des principaux importateurs et exportateurs d'équipements de protection individuelle. Nous sommes une entreprise multidimensionnelle fournissant une large gamme d'EPI, de vêtements de travail et de produits de sécurité aux industries du monde entier.",
    "about.desc2": "Du pétrole et de l'expédition à l'automobile et à la construction — nous servons chaque industrie avec des solutions de sécurité de précision. Notre gamme complète de produits fait de nous le <strong>guichet unique</strong> pour le client exigeant.",
    "about.pillar1t": "Qualité Certifiée",
    "about.pillar1s": "Marques mondiales reconnues",
    "about.pillar2t": "Approvisionnement Mondial",
    "about.pillar2s": "Import & Export",
    "about.pillar3t": "Multi-Industrie",
    "about.pillar3s": "Pétrole, Maritime, Auto, Construction",
    "about.btn": "Voir Nos Produits",
    "products.label": "Ce Que Nous Offrons",
    "products.title1": "Gamme Complète",
    "products.title2": "d'EPI",
    "products.title3": "Professionnels",
    "products.sub": "Protection complète pour chaque environnement professionnel et exigence industrielle.",
    "product.1.title": "Protection de la Tête",
    "product.1.desc": "Casques et chapeaux de protection pour tous niveaux de danger",
    "product.1.tag": "EPI Essentiel",
    "product.2.title": "Protection Respiratoire",
    "product.2.desc": "Masques anti-poussière, respirateurs et équipements de purification d'air",
    "product.2.tag": "Sécurité Respiratoire",
    "product.3.title": "Protection des Yeux",
    "product.3.desc": "Lunettes de sécurité, écrans faciaux et visières",
    "product.3.tag": "Sécurité Visuelle",
    "product.4.title": "Chaussures de Sécurité",
    "product.4.desc": "Bottes à embout acier, chaussures de sécurité et antidérapantes",
    "product.4.tag": "Sécurité des Pieds",
    "product.5.title": "Protection Auditive",
    "product.5.desc": "Protège-oreilles, bouchons d'oreilles et dispositifs de conservation auditive",
    "product.5.tag": "Sécurité Auditive",
    "product.6.title": "Vêtements de Protection",
    "product.6.desc": "Combinaisons, blouses, imperméables et vestes haute visibilité",
    "product.6.tag": "Protection Corporelle",
    "product.7.title": "Protection des Mains",
    "product.7.desc": "Gants industriels, résistants aux coupures et aux produits chimiques",
    "product.7.tag": "Sécurité des Mains",
    "product.8.title": "Protection Anti-Chute",
    "product.8.desc": "Harnais, longes et systèmes d'arrêt de chute",
    "product.8.tag": "Sécurité en Hauteur",
    "industries.label": "Industries Desservies",
    "industries.title1": "Adapté à",
    "industries.title2": "Chaque",
    "industries.title3": "Industrie",
    "industries.sub": "De l'industrie lourde aux soins de santé — nos solutions EPI couvrent tout.",
    "industry.1.title": "Pétrole & Gaz",
    "industry.1.desc": "EPI haute température et résistant aux produits chimiques pour environnements extrêmes",
    "industry.2.title": "Maritime",
    "industry.2.desc": "Équipements de sécurité de qualité marine pour ports et opérations en mer",
    "industry.3.title": "Automobile",
    "industry.3.desc": "Équipements de sécurité en atelier, gants et protection oculaire",
    "industry.4.title": "Construction",
    "industry.4.desc": "EPI complet des casques aux systèmes de harnais pour la sécurité sur chantier",
    "industry.5.title": "Industrie",
    "industry.5.desc": "Protection de précision pour les ateliers et environnements de production",
    "industry.6.title": "Santé",
    "industry.6.desc": "EPI de qualité médicale, blouses de laboratoire et équipements de protection stérile",
    "cta.badge": "Prêt à être Protégé?",
    "cta.title": "Votre Destination Unique<br/>pour les <em>Solutions de Sécurité</em>",
    "cta.sub": "Contactez-nous pour des EPI premium de marques reconnues mondialement. Réponse rapide, prix compétitifs.",
    "cta.btn1": "Nous Contacter",
    "cta.btn2": "Voir les Produits",
    "contact.label": "Contactez-Nous",
    "contact.title1": "Parlons",
    "contact.title2": "Sécurité",
    "contact.sub": "Contactez-nous par n'importe quel canal — nous répondons rapidement avec la bonne solution.",
    "contact.phone.label": "Appelez-Nous",
    "contact.phone.hint": "Lun–Sam, 9h–18h IST",
    "contact.email.label": "Écrivez-Nous",
    "contact.email.hint": "Réponse dans les 24 heures",
    "contact.loc.label": "Localisation",
    "contact.loc.val": "Inde",
    "contact.loc.hint": "Service mondial",
    "contact.card.label": "CONTACT",
    "contact.card.heading": "Nous sommes là pour vous!<br/>Contactez-nous.",
    "contact.card.btn": "PRENDRE CONTACT",
    "wa.tooltip": "Chattez avec nous",
    "footer.desc": "EPI de qualité premium pour chaque besoin professionnel. Importateur et exportateur depuis 2019.",
    "footer.nav": "Navigation",
    "footer.products": "Produits",
    "footer.copy": "© 2024 TSS – The Safety Store. Tous droits réservés.",
    "footer.since": "Depuis 2019 · Importateurs et Exportateurs d'EPI",
  }
};

let currentLang = localStorage.getItem('tss-lang') || 'en';

function applyTranslations(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;
  document.documentElement.setAttribute('lang', lang);
  document.body.classList.add('lang-switching');

  setTimeout(() => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });
    document.body.classList.remove('lang-switching');
  }, 180);
}

function initLangSwitcher() {
  const btns = document.querySelectorAll('.lang-btn');

  // Apply saved language on load
  const savedLang = localStorage.getItem('tss-lang') || 'en';
  applyTranslations(savedLang);

  // Set initial active button
  btns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === savedLang);
  });

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');

      // Do nothing if this language is already active
      if (btn.classList.contains('active')) return;

      // Update active state
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Apply translation and persist
      applyTranslations(lang);
      localStorage.setItem('tss-lang', lang);
    });
  });
}

// Boot new features
document.addEventListener('DOMContentLoaded', () => {
  initLangSwitcher();
}, { once: true });

// If DOM already loaded (script at bottom)
if (document.readyState !== 'loading') {
  initLangSwitcher();
}