/* =========================================================
   VEDHARA AYURVEDA — consult-form-mail.js
   Sends the homepage "Book a Consultation" forms (desktop card
   + mobile popup) by email via FormSubmit, then continues on
   to booking.html as before. No backend required.
   Update DESTINATION_EMAIL below if it ever changes.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const DESTINATION_EMAIL = 'vedharabeachhome@gmail.com';
  const forms = document.querySelectorAll('.vh-consult-form');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.vh-consult-submit');
      const nameField = form.querySelector('input[name="name"]');
      const emailField = form.querySelector('input[name="email"]');
      const phoneField = form.querySelector('input[name="phone"]');
      const interestField = form.querySelector('select[name="interest"]');

      const name = nameField ? nameField.value.trim() : '';
      const email = emailField ? emailField.value.trim() : '';
      const phone = phoneField ? phoneField.value.trim() : '';
      const interest = interestField ? interestField.value : '';

      const redirectParams = new URLSearchParams({ name, email, phone, interest });
      const redirectUrl = `booking.html?${redirectParams.toString()}`;

      if (submitBtn) submitBtn.disabled = true;

      const payload = new FormData();
      payload.append('Name', name || 'Not provided');
      payload.append('Email', email || 'Not provided');
      payload.append('Phone', phone || 'Not provided');
      payload.append('Area of Interest', interest || 'Not specified');
      payload.append('_subject', 'New Consultation Enquiry — Vedhara Ayurveda Website');
      payload.append('_captcha', 'false');
      payload.append('_template', 'table');

      fetch(`https://formsubmit.co/ajax/${DESTINATION_EMAIL}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: payload
      })
        .catch(() => {
          /* Even if the email fails to send, don't block the visitor —
             they still land on the full booking form. */
        })
        .finally(() => {
          window.location.href = redirectUrl;
        });
    });
  });
});
