# Aurevio

Aurevio is an independent frontend portfolio built with semantic HTML, CSS and vanilla JavaScript. The site uses a pre-rendered page structure so the core content is available immediately without waiting for JavaScript to fetch sections.

## Stack

- Vite for development and production builds
- HTML for page structure and content
- CSS for layout, typography, responsive behavior and motion styling
- Vanilla JavaScript for navigation, reveals, scroll progress and lightweight pointer/scroll interactions

## Development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Content

Page sections live in `sections/`; Vite expands their include markers in `index.html` into one pre-rendered page.

## Deployment

GitHub Actions builds the Vite project and deploys `dist/` to GitHub Pages whenever `main` changes.

## Accessibility

The site includes a skip link, semantic headings and sections, labelled navigation, keyboard-friendly controls, descriptive project image alt text, touch-safe mobile navigation, and reduced-motion handling.

## UI checks

```bash
npx playwright install chromium
npm run build
npm test
```

The smoke checks launch a local production preview and cover package selection,
keyboard navigation, anchor alignment, both themes, seven viewport widths, image
loading and navigation without JavaScript. Set `AUREVIO_TEST_URL` to check an
already running preview, or `AUREVIO_CHROMIUM_PATH` to use an existing Chromium.

## Digital studio experiment

This branch explores Aurevio as a connected Three.js studio. The normal HTML portfolio is the fallback when WebGL is unavailable, the visitor requests reduced motion or data saving, or the device reports very few CPU threads. The scene is loaded after the main content, uses procedural geometry, and loads project textures near the gallery. It redraws on changes instead of running a continuous animation loop.

Run `npm install`, `npm run dev`, and open the local address Vite prints. `npm run build` produces the GitHub Pages build; `npm run test:studio` checks camera interpolation, scene construction, and simulated inquiry states. `npm test` runs the existing browser suite and needs a working Playwright-compatible Chromium installation. A browser check and real Formspree delivery test are still required before treating this experiment as production-ready.
