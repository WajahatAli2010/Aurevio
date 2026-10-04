export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const getMotionState = () => ({
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  finePointer: window.matchMedia("(pointer: fine)").matches
});
