const $ = (selector, root = document) => root.querySelector(selector);

export function initTheme() {
  const root = document.documentElement;
  const toggle = $(".theme-toggle");
  if (!toggle) return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const apply = theme => {
    const dark = theme === "dark";
    root.dataset.theme = dark ? "dark" : "light";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    const icon = $(".theme-icon", toggle);
    const label = $(".theme-label", toggle);
    if (icon) icon.textContent = dark ? "☾" : "☼";
    if (label) label.textContent = dark ? "Dark" : "Light";
  };

  const saved = (() => {
    try { return localStorage.getItem("aurevio-theme"); } catch { return null; }
  })();

  apply(saved === "dark" || saved === "light" ? saved : (media.matches ? "dark" : "light"));

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("aurevio-theme", next); } catch {}
  });
}