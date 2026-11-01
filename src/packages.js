// Keep the selected package attached to the inquiry without clearing the visitor's draft.
export function initPackageSelection() {
  const select = document.querySelector('#inquiry-form select[name="service"]');
  if (!select) return;
  document.querySelectorAll('a[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      const service = link.dataset.service;
      if ([...select.options].some(option => option.value === service)) {
        select.value = service;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
}
