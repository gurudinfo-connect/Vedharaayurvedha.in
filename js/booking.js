/* =========================================================
   VEDHARA AYURVEDA — booking.js
   Booking page form validation (front-end only).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#booking-form');
  if (!form) return;

  const successPanel = document.querySelector('#booking-success');

  function showError(field, message) {
    const wrap = field.closest('.field');
    wrap.classList.add('invalid');
    const msg = wrap.querySelector('.error-msg');
    if (msg) msg.textContent = message;
  }
  function clearError(field) {
    field.closest('.field').classList.remove('invalid');
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
    field.addEventListener('change', () => clearError(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = form.querySelector('#full-name');
    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'Please enter your full name.');
      valid = false;
    }

    const email = form.querySelector('#email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    }

    const phone = form.querySelector('#phone');
    if (!/^[\d+\s()-]{7,}$/.test(phone.value.trim())) {
      showError(phone, 'Please enter a valid phone number.');
      valid = false;
    }

    const date = form.querySelector('#preferred-date');
    if (!date.value) {
      showError(date, 'Please choose a preferred date.');
      valid = false;
    } else {
      const chosen = new Date(date.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        showError(date, 'Please choose a future date.');
        valid = false;
      }
    }

    const treatment = form.querySelector('#treatment');
    if (!treatment.value) {
      showError(treatment, 'Please select a treatment.');
      valid = false;
    }

    const guests = form.querySelector('#guests');
    if (!guests.value || guests.value < 1) {
      showError(guests, 'Please enter number of guests.');
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('.field.invalid');
      firstInvalid && firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    form.style.display = 'none';
    successPanel && successPanel.classList.add('active');
  });
});
