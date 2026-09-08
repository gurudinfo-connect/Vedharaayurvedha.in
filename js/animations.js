/* =========================================================
   VEDHARA AYURVEDA — animations.js
   Subtle parallax + hero decorative motion.
   Respects prefers-reduced-motion.
   ========================================================= */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.addEventListener('DOMContentLoaded', () => {

    /* Subtle parallax on hero media */
    const heroMedia = document.querySelector('.hero-media img, .page-hero-media img');
    if (heroMedia) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const offset = window.scrollY * 0.15;
            heroMedia.style.transform = `translateY(${offset}px) scale(1.05)`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    /* Floating botanical leaf drift follows a gentle CSS animation already;
       here we just nudge on mousemove for a premium desktop touch. */
    const leaves = document.querySelectorAll('.hero-leaf');
    if (leaves.length && window.matchMedia('(pointer:fine)').matches) {
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 14;
        leaves.forEach((leaf, i) => {
          const factor = i % 2 === 0 ? 1 : -1;
          leaf.style.marginLeft = `${x * factor}px`;
          leaf.style.marginTop = `${y * factor}px`;
        });
      });
    }
  });
})();
