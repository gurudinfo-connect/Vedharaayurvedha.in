(function () {
  var overlay = document.getElementById('consultModalOverlay');
  var closeBtn = document.getElementById('consultModalClose');
  if (!overlay || !closeBtn) return;

  var MOBILE_BREAKPOINT = 1023;
  var SCROLL_THRESHOLD = 24;   // ignore tiny finger jitters
  var TOP_GUARD = 80;          // don't trigger right at the very top of the page
  var REARM_COOLDOWN = 600;    // ms after closing before it can become eligible again

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  var isOpen = false;
  var submitted = false;
  var scrolledDown = false;    // user has made a deliberate downward scroll since last shown/closed
  var directionAnchor = window.scrollY || window.pageYOffset || 0;
  var cooldownUntil = 0;
  var ticking = false;

  function openModal() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    scrolledDown = false;
    cooldownUntil = Date.now() + REARM_COOLDOWN;
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

    if (!isMobile() || submitted || isOpen || Date.now() < cooldownUntil) {
      directionAnchor = y;
      ticking = false;
      return;
    }

    var delta = y - directionAnchor;

    if (delta > SCROLL_THRESHOLD) {
      // deliberate scroll down — arm the trigger
      scrolledDown = true;
      directionAnchor = y;
    } else if (delta < -SCROLL_THRESHOLD) {
      // deliberate scroll up — fire only if they'd scrolled down first
      if (scrolledDown && y > TOP_GUARD) {
        openModal();
      }
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
