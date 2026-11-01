# Aurevio UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the approved UI review while retaining Aurevio's visual identity.
**Architecture:** Edit existing HTML partials and CSS in place; add a small package-selection initializer and refine navigation behavior. Keep static hosting and existing project images.
**Tech Stack:** HTML, CSS, JavaScript modules, Vite.
**Spec:** docs/superpowers/specs/2026-10-31-ui-refinement-design.md

## Global Constraints
- Preserve both existing theme palettes and project destinations.
- No new runtime dependencies, fabricated claims, or contact account changes.
- All content remains visible with reduced motion and without JavaScript.

## Review Focus
- Navigation fits intermediate widths and the closed mobile menu cannot receive keyboard focus.
- Package selections match actual form options without erasing typed user data.
- Contact labels, select options, focus states and muted text remain readable in both themes.
- Hero/project images retain their proportions without clipped headings or horizontal overflow at 320px.
- Anchor targets clear the fixed header and active navigation follows document order.

### Task 1: Interaction and navigation
**Files:** index.html, sections/packages.html, sections/contact.html, src/navigation.js, src/main.js, src/packages.js, tests/ui-smoke.mjs, package.json.
- [x] Add behavior checks for package-to-inquiry selection, menu dismissal, anchor offset and active state; run against baseline to verify missing behavior.
- [x] Add package links with data-service matching existing select options and initialize selection without resetting form data.
- [x] Align navigation order/numbers; update menu breakpoint, Escape/outside dismissal and hidden-menu behavior.
- [x] Verify the behavior checks pass after the styling task supplies responsive layout and offsets.

### Task 2: Visual refinement
**Files:** css/base.css, css/header.css, css/sections.css, css/responsive.css, css/theme.css, sections/*.html, index.html, src/animations.js, src/main.js.
- [x] Replace unused hero artwork with the existing linked NOIRÉ screenshot.
- [x] Increase controls/body labels, introduce solid primary buttons, and reduce secondary heading scale.
- [x] Vary statement, benefits, FAQ and contact layouts, simplify repeated copy and remove false action affordances.
- [x] Apply responsive layouts, readable dark/light colors, visible focus, and sequential section numbers.
- [x] Build and inspect desktop/mobile screenshots in both themes; verify overflow and image loading.

### Task 3: Review and publish
- [x] Run the production build and complete interaction/layout checks.
- [x] Get one independent whole-change review; resolve material findings and rerun affected checks.
- [ ] Publish an atomic commit through GitHub using a current-head lease; verify Pages deployment.
