/* =========================================================
   VEDHARA AYURVEDA — booking.js
   Booking page form validation + email delivery via FormSubmit
   (no backend required). Update DESTINATION_EMAIL below if it
   ever changes.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#booking-form');
  if (!form) return;

  const DESTINATION_EMAIL = 'vedhabeachhome@gmail.com';
  const successPanel = document.querySelector('#booking-success');
  const submitBtn = form.querySelector('button[type="submit"]');

  /* ---- International phone field (works for every country's dial
     code + number-length rules via intl-tel-input / libphonenumber) ---- */
  const phoneInput = form.querySelector('#phone');
  const countryField = form.querySelector('#country');
  let iti = null;
  let itiReady = Promise.resolve();

  if (phoneInput && window.intlTelInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: 'in',                 // default guess; user can change/search any country
      separateDialCode: true,
      nationalMode: false,
      autoPlaceholder: 'aggressive',
      loadUtils: () => import('https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js')
    });
    itiReady = iti.promise || Promise.resolve(); // resolves once validation utils are loaded

    const syncCountryField = () => {
      if (!countryField) return;
      const data = iti.getSelectedCountryData();
      countryField.value = data && data.name ? data.name : '';
    };
    syncCountryField();
    phoneInput.addEventListener('countrychange', syncCountryField);
  }

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await itiReady; // make sure the validation utils have finished loading
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
    if (iti) {
      // Validates against the selected country's real numbering-plan rules
      // (correct length, valid prefixes, etc.) for every country, not just one.
      if (!phone.value.trim() || !iti.isValidNumber()) {
        const err = iti.getValidationError && iti.getValidationError();
        // error codes: 0 invalid, 1 invalid country code, 2 too short, 3 too long, 4 invalid
        const msg = err === 2
          ? 'This number is too short for the selected country.'
          : err === 3
          ? 'This number is too long for the selected country.'
          : `Please enter a valid phone number for ${(iti.getSelectedCountryData().name) || 'the selected country'}.`;
        showError(phone, msg);
        valid = false;
      }
    } else if (!/^[\d+\s()-]{7,}$/.test(phone.value.trim())) {
      // Fallback if the phone-validation library failed to load
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
    const fullPhone = iti ? iti.getNumber() : phone.value.trim(); // e.g. +91XXXXXXXXXX
    payload.append('Full Name', name.value.trim());
    payload.append('Email', email.value.trim());
    payload.append('Phone', fullPhone);
    payload.append('Country', (country && country.value.trim()) || (iti && iti.getSelectedCountryData().name) || 'Not specified');
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
