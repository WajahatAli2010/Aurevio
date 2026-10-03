# Aurevio

Aurevio is a small, performance-focused frontend portfolio built with semantic HTML, CSS and vanilla JavaScript.

## Stack

- Vite for development and production builds
- HTML for structure and content
- CSS split into focused section files and bundled by Vite
- Vanilla JavaScript for navigation, reveal animations, theme switching and scroll progress

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

The live page is intentionally pre-rendered in `index.html`. This avoids waiting for JavaScript to fetch every section before the page can display.

The `sections/` directory is kept as a legacy content reference while the site is being migrated to the pre-rendered structure. New content should be edited in `index.html` so the first HTML response contains the actual page content.

## Deployment

GitHub Actions builds the Vite project and deploys `dist/` to GitHub Pages whenever `main` changes.

## Accessibility

The site includes a skip link, semantic section headings, labelled navigation, keyboard-friendly controls, reduced-motion handling, descriptive project image alt text and accessible theme/mobile navigation controls.
