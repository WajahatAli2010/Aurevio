# Aurevio

Aurevio is an independent frontend portfolio built with semantic HTML, CSS and vanilla JavaScript. The site uses a pre-rendered page structure so the core content is available immediately without waiting for JavaScript to fetch sections.

## Stack

- Vite for development and production builds
- HTML for page structure and content
- CSS for layout, typography, responsive behavior and motion styling
- Vanilla JavaScript for navigation, reveals, scroll progress and lightweight pointer/scroll interactions

## Development

Requires Node.js 20+.

\`\`\`bash
npm install
npm run dev
\`\`\`

For a production build:

\`\`\`bash
npm run build
npm run preview
\`\`\`

The production output is generated in \`dist/\`.

## Content

The live page is intentionally pre-rendered in \`index.html\`. The \`sections/\` directory remains as a legacy content reference from the earlier structure; the live page should be edited in \`index.html\`.

## Deployment

GitHub Actions builds the Vite project and deploys \`dist/\` to GitHub Pages whenever \`main\` changes.

## Accessibility

The site includes a skip link, semantic headings and sections, labelled navigation, keyboard-friendly controls, descriptive project image alt text, touch-safe mobile navigation, and reduced-motion handling.
