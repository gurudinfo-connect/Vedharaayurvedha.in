(function () {
  var overlay = document.getElementById('consultModalOverlay');
  var closeBtn = document.getElementById('consultModalClose');
  if (!overlay || !closeBtn) return;

  var MOBILE_BREAKPOINT = 1023;
  var SESSION_KEY = 'vh_consult_modal_shown';

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function openModal() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });

  // Close automatically if the visitor submits the form
  var form = overlay.querySelector('.vh-consult-form');
  if (form) {
    form.addEventListener('submit', function () {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
    });
  }

  // Show once per browser session, on mobile only, shortly after the page settles
  if (isMobile()) {
    var alreadyShown = false;
    try { alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) {}

    if (!alreadyShown) {
      setTimeout(function () {
        if (isMobile()) {
          openModal();
          try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
        }
      }, 1200);
    }
  }
})();
