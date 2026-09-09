(function () {
  var overlay = document.getElementById('consultModalOverlay');
  var closeBtn = document.getElementById('consultModalClose');
  if (!overlay || !closeBtn) return;

  var MOBILE_BREAKPOINT = 1023;
  var SCROLL_THRESHOLD = 24;   // ignore tiny finger jitters
  var TOP_GUARD = 80;          // don't trigger right at the very top of the page

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  var isOpen = false;
  var submitted = false;
  var triggeredOnce = false;   // once shown (or closed), never auto-open again this visit
  var directionAnchor = window.scrollY || window.pageYOffset || 0;
  var ticking = false;

  function openModal() {
    if (isOpen) return;
    isOpen = true;
    triggeredOnce = true;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeModal();
  });

  // Close permanently for this visit once the visitor submits the form
  var form = overlay.querySelector('.vh-consult-form');
  if (form) {
    form.addEventListener('submit', function () {
      submitted = true;
      closeModal();
    });
  }

  function handleScroll() {
    var y = window.scrollY || window.pageYOffset || 0;

    if (!isMobile() || submitted || isOpen || triggeredOnce) {
      directionAnchor = y;
      ticking = false;
      return;
    }

    var delta = y - directionAnchor;

    if (delta > SCROLL_THRESHOLD) {
      // deliberate scroll down — fire once past the top guard
      if (y > TOP_GUARD) {
        openModal();
      }
      directionAnchor = y;
    } else if (delta < -SCROLL_THRESHOLD) {
      // deliberate scroll up — just update the anchor, no trigger
      directionAnchor = y;
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(handleScroll);
    }
  }, { passive: true });
})();
