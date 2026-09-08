/* =========================================================
   VEDHARA AYURVEDA — hero-enquiry.js
   Ancient Thalapathra booking scroll on the homepage hero.
   Sends submissions by email via FormSubmit (no backend
   required). Update DESTINATION_EMAIL below if it ever changes.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#hero-enquiry-form');
  if (!form) return;

  const DESTINATION_EMAIL = 'vedharabeachhome@gmail.com';
  const wrap = document.querySelector('#vedharaScrollForm');
  const successPanel = document.querySelector('#hero-enquiry-success');
  const resetBtn = document.querySelector('#hero-enquiry-reset');
  const submitBtn = document.querySelector('#hero-enquiry-submit');
  const submitLabel = submitBtn.querySelector('span');

  function showError(field, message) {
    const field_wrap = field.closest('.vfield');
    field_wrap.classList.add('invalid');
    if (message) {
      const msg = field_wrap.querySelector('.vfield-error');
      if (msg) msg.textContent = message;
    }
  }
  function clearError(field) {
    const field_wrap = field.closest('.vfield');
    if (field_wrap) field_wrap.classList.remove('invalid');
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
    field.addEventListener('change', () => clearError(field));
  });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  function isValidPhone(value) {
    return /^[\d+\s()-]{7,}$/.test(value.trim());
  }
  function isValidFutureDate(value) {
    if (!value) return true; // preferred date is optional
    const chosen = new Date(value + 'T00:00:00');
    if (Number.isNaN(chosen.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return chosen >= today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = form.querySelector('#hf-name');
    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'Please enter your full name.');
      valid = false;
    }

    const email = form.querySelector('#hf-email');
    if (!isValidEmail(email.value)) {
      showError(email, 'Please enter a valid email.');
      valid = false;
    }

    const phone = form.querySelector('#hf-phone');
    if (!isValidPhone(phone.value)) {
      showError(phone, 'Please enter a valid phone number.');
      valid = false;
    }

    const date = form.querySelector('#hf-date');
    if (!isValidFutureDate(date.value)) {
      showError(date, 'Please choose a valid, upcoming date.');
      valid = false;
    }

    const treatment = form.querySelector('#hf-treatment');
    if (!treatment.value) {
      showError(treatment, 'Please select a treatment.');
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('.vfield.invalid');
      firstInvalid && firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const message = form.querySelector('#hf-message');
    const originalLabel = submitLabel.textContent;
    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';

    const payload = new FormData();
    payload.append('Name', name.value.trim());
    payload.append('Email', email.value.trim());
    payload.append('Phone', phone.value.trim());
    payload.append('Preferred Date', date.value || 'Not specified');
    payload.append('Preferred Treatment', treatment.value);
    payload.append('Message', message.value.trim() || '—');
    payload.append('_subject', 'New Enquiry — Vedhara Ayurveda Website');
    payload.append('_captcha', 'false');
    payload.append('_template', 'table');

    fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: payload
    })
      .then(res => res.json())
      .then(() => {
        form.style.display = 'none';
        successPanel && successPanel.classList.add('active');
      })
      .catch(() => {
        alert('Sorry, something went wrong sending your enquiry. Please try again or call us directly.');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitLabel.textContent = originalLabel;
      });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.vfield.invalid').forEach(f => f.classList.remove('invalid'));
      successPanel.classList.remove('active');
      form.style.display = '';
      form.querySelector('#hf-name').focus();
    });
  }

  /* subtle parallax: the scroll drifts a touch slower than the
     hero background as the page scrolls, kept understated */
  if (wrap && window.matchMedia('(min-width: 1025px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, 600) * 0.06;
        wrap.style.transform = `translateY(${offset}px)`;
        ticking = false;
      });
    }, { passive: true });
  }
});
