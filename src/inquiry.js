// Keep the visitor's draft on failure; native POST remains available without JS.
export function initInquiryForm({root = document, send = fetch, createData = form => new FormData(form)} = {}) {
  const form = root.querySelector('#inquiry-form');
  const status = root.querySelector('#inquiry-status');
  if (!form || !status) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your inquiry…';
    try {
      const response = await send(form.action, {method:'POST', body:createData(form), headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      status.textContent = 'Your inquiry was sent. Thank you!';
    } catch {
      status.textContent = 'Your inquiry could not be sent. Please try again or contact me on Instagram.';
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
}
