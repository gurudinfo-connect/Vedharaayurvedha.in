/* ============================================================
   VEDHARA — NAVIGATION BEHAVIOR
   Plain JS, no dependencies. Handles:
   - header transparent-over-hero -> solid-on-scroll transition
   - desktop dropdown menus (hover + keyboard)
   - mobile full-screen menu (scroll lock, Escape, focus)
   - active-page indicator
   ============================================================ */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const legacyNavbar = document.querySelector(".navbar");
  if (legacyNavbar) legacyNavbar.classList.remove("scrolled");
  const isHome = document.body.dataset.page === "home";

  /* ---------- Scroll transition (home page only has a hero to sit over) ---------- */
  function updateScrollState() {
    if (legacyNavbar) legacyNavbar.classList.remove("scrolled");
    if (!header) return;
    if (!isHome) {
      header.classList.add("solid");
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  /* ---------- Desktop dropdown (click to open — Treatment only) ---------- */
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    const link = item.querySelector(".nav-link");
    const dropdown = item.querySelector(".dropdown");
    if (!dropdown) return;

    function open() {
      navItems.forEach((other) => other !== item && other.classList.remove("open"));
      item.classList.add("open");
      link.setAttribute("aria-expanded", "true");
    }

    function close() {
      item.classList.remove("open");
      link.setAttribute("aria-expanded", "false");
    }

    link.addEventListener("click", (e) => {
      const isOpen = item.classList.contains("open");
      if (!isOpen) {
        // First click opens the dropdown instead of navigating away.
        e.preventDefault();
        open();
      }
      // Second click while already open navigates normally (link still works).
    });

    link.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        link.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        open();
        const firstItem = dropdown.querySelector("a");
        if (firstItem) firstItem.focus();
      }
    });

    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) close();
    });
  });

  document.addEventListener("click", (e) => {
    navItems.forEach((item) => {
      if (!item.contains(e.target)) {
        item.classList.remove("open");
        const link = item.querySelector(".nav-link");
        if (link) link.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Mobile menu ---------- */
  const mobileNav = document.querySelector(".mobile-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileClose = document.querySelector(".mobile-nav-close");
  let lastFocused = null;

  function openMobileNav() {
    if (!mobileNav) return;
    lastFocused = document.activeElement;
    mobileNav.classList.add("open");
    mobileNav.removeAttribute("aria-hidden");
    document.body.classList.add("nav-locked");
    navToggle.setAttribute("aria-expanded", "true");
    if (mobileClose) mobileClose.focus();
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.classList.remove("nav-locked");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    } else if (lastFocused) {
      lastFocused.focus();
    }
  }

  if (navToggle) navToggle.addEventListener("click", openMobileNav);
  if (mobileClose) mobileClose.addEventListener("click", closeMobileNav);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("open")) {
      closeMobileNav();
    }
  });

  // Close mobile nav when a real navigation link inside it is clicked
  if (mobileNav) {
    mobileNav.querySelectorAll("a[href]").forEach((a) => {
      a.addEventListener("click", () => closeMobileNav());
    });
  }

  // Simple focus trap while mobile nav is open
  if (mobileNav) {
    mobileNav.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !mobileNav.classList.contains("open")) return;
      const focusable = mobileNav.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Mobile accordion sections ---------- */
  document.querySelectorAll(".mobile-nav-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      const submenu = document.getElementById(trigger.getAttribute("aria-controls"));

      // Close other open sections (accordion behavior)
      document.querySelectorAll(".mobile-nav-trigger").forEach((other) => {
        if (other !== trigger) {
          other.setAttribute("aria-expanded", "false");
          const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.classList.remove("expanded");
        }
      });

      trigger.setAttribute("aria-expanded", String(!expanded));
      if (submenu) submenu.classList.toggle("expanded", !expanded);
    });
  });

  /* ---------- Scroll-reveal for editorial sections ---------- */
  const animatedEls = document.querySelectorAll("[data-animate]");
  if (animatedEls.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      animatedEls.forEach((el) => io.observe(el));
    } else {
      animatedEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* ---------- Active nav link (aria-current) ---------- */
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link, .footer-nav-list a").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    const hrefPath = href.split("#")[0] || "index.html";
    if (hrefPath === currentPath) {
      a.setAttribute("aria-current", "page");
    }
  });
})();
