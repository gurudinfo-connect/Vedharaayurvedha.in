/* =========================================================
   VEDHARA AYURVEDA — main.js
   Core site behaviour: navbar, mobile menu, page loader,
   FAQ accordion, back-to-top, active nav state.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ---------- */
  const loader = document.querySelector('.page-loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader && loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 250);
  });
  // fallback in case load already fired
  setTimeout(() => {
    loader && loader.classList.add('hidden');
    document.body.classList.add('loaded');
  }, 1200);

  /* ---------- Navbar shrink on scroll ---------- */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // back to top visibility
    if (backTop) {
      if (window.scrollY > 600) backTop.classList.add('show');
      else backTop.classList.remove('show');
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  function closeMenu() {
    hamburger && hamburger.classList.remove('active');
    navLinks && navLinks.classList.remove('mobile-open');
    overlay && overlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
  }
  function openMenu() {
    hamburger && hamburger.classList.add('active');
    navLinks && navLinks.classList.add('mobile-open');
    overlay && overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
  }
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('mobile-open');
      isOpen ? closeMenu() : openMenu();
    });
  }
  overlay && overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Active nav link ---------- */
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
      const dropdownParent = a.closest('.nav-dropdown');
      if (dropdownParent) dropdownParent.classList.add('active');
    }
  });

  /* ---------- Nav dropdowns (Vedhara / Treatment) ---------- */
  document.querySelectorAll('.nav-drop-toggle').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.nav-dropdown');
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== parent) {
          d.classList.remove('open');
          d.querySelector('.nav-drop-toggle').setAttribute('aria-expanded', 'false');
        }
      });
      parent.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-drop-toggle').setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-drop-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger, .tl-step, .ap-step');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  if (counters.length && 'IntersectionObserver' in window) {
    const cIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cIo.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q && q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
        q.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Back to top ---------- */
  var backTop = document.querySelector('.back-top');
  backTop && backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Testimonial carousel ---------- */
  const slides = document.querySelectorAll('.testi-slide');
  const dotsWrap = document.querySelector('.testi-dots');
  let testiIndex = 0, testiTimer;

  function showSlide(i) {
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    const dots = dotsWrap ? dotsWrap.querySelectorAll('span') : [];
    dots.forEach(d => d.classList.remove('active'));
    testiIndex = (i + slides.length) % slides.length;
    slides[testiIndex].classList.add('active');
    if (dots[testiIndex]) dots[testiIndex].classList.add('active');
  }

  if (slides.length) {
    slides.forEach((_, i) => {
      if (dotsWrap) {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => { showSlide(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      }
    });
    document.querySelector('.testi-prev') && document.querySelector('.testi-prev').addEventListener('click', () => { showSlide(testiIndex - 1); resetTimer(); });
    document.querySelector('.testi-next') && document.querySelector('.testi-next').addEventListener('click', () => { showSlide(testiIndex + 1); resetTimer(); });

    function resetTimer() {
      clearInterval(testiTimer);
      testiTimer = setInterval(() => showSlide(testiIndex + 1), 6000);
    }
    resetTimer();

    // swipe support
    let startX = 0;
    const wrap = document.querySelector('.testi-wrap');
    wrap && wrap.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    wrap && wrap.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) { showSlide(testiIndex - 1); resetTimer(); }
      else if (diff < -50) { showSlide(testiIndex + 1); resetTimer(); }
    }, { passive: true });
  }

  /* ---------- Gallery lightbox ---------- */
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  let galleryIndex = 0;

  function openLightbox(i) {
    galleryIndex = i;
    lightboxImg.src = galleryItems[i].src;
    lightboxImg.alt = galleryItems[i].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  galleryItems.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => openLightbox(i));
  });
  if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => openLightbox((galleryIndex - 1 + galleryItems.length) % galleryItems.length));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => openLightbox((galleryIndex + 1) % galleryItems.length));
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox((galleryIndex - 1 + galleryItems.length) % galleryItems.length);
      if (e.key === 'ArrowRight') openLightbox((galleryIndex + 1) % galleryItems.length);
    });
  }

  /* ---------- Contact form (front-end only) ---------- */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      contactForm.querySelectorAll('[required]').forEach(field => {
        const wrap = field.closest('.field');
        if (!field.value.trim()) {
          wrap.classList.add('invalid');
          valid = false;
        } else {
          wrap.classList.remove('invalid');
        }
      });
      const emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.closest('.field').classList.add('invalid');
        valid = false;
      }
      if (!valid) return;

      contactForm.style.display = 'none';
      const success = document.querySelector('#contact-success');
      success && success.classList.add('active');
    });
  }

});
