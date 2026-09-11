/* =========================================================
   VEDHARA AYURVEDA — booking.js
   Booking page form validation + email delivery via FormSubmit
   (no backend required). Update DESTINATION_EMAIL below if it
   ever changes.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#booking-form');
  if (!form) return;

  const DESTINATION_EMAIL = 'vedharabeachhome@gmail.com';
  const successPanel = document.querySelector('#booking-success');
  const submitBtn = form.querySelector('button[type="submit"]');

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

    const country = form.querySelector('#country');
    const message = form.querySelector('#b-message');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const payload = new FormData();
    payload.append('Full Name', name.value.trim());
    payload.append('Email', email.value.trim());
    payload.append('Phone', phone.value.trim());
    payload.append('Country', (country && country.value.trim()) || 'Not specified');
    payload.append('Preferred Date', date.value);
    payload.append('Preferred Treatment', treatment.value);
    payload.append('Number of Guests', guests.value);
    payload.append('Message', (message && message.value.trim()) || '—');
    payload.append('_subject', 'New Booking Enquiry — Vedhara Ayurveda Website');
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
        submitBtn.textContent = originalLabel;
      });
  });
});
