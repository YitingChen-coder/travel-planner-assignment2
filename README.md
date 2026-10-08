# Travel Planner — UI/UX & Visual Design

A University of Chicago MPCS 51238 Assignment 2 project exploring three visual directions for a travel-planning experience. The homepage is a project hub for the planned mood boards, design systems, and final website.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- React

The project intentionally has no database, authentication, backend, external APIs, or additional UI packages.

## Planned routes

The homepage (`/`), all three mood boards, and all three design systems are implemented. All six deliverable cards link to their pages; the final website remains a non-clickable placeholder.

| Section | Route | Status |
| --- | --- | --- |
| Mood Board — Calm | `/mood-boards/calm` | Implemented |
| Mood Board — Arcade | `/mood-boards/arcade` | Implemented |
| Mood Board — Editorial | `/mood-boards/editorial` | Implemented |
| Design System — Calm | `/design-systems/calm` | Implemented |
| Design System — Arcade | `/design-systems/arcade` | Implemented |
| Design System — Editorial | `/design-systems/editorial` | Implemented |
| Final Website — Travel Planner | `/travel-planner` | Planned |

## Run locally

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To check the project, run `npm run lint` and `npm run build`.

## Iteration log

- **Iteration 1 — Project setup and homepage hub:** Set up Next.js with App Router, TypeScript, Tailwind CSS, and ESLint; created the responsive homepage and project README. Initial milestone was committed and pushed to `main`.
- **Iteration 2A — Calm mood board:** Added a responsive collage with 28 distinct artifacts: 6 landscape photographs, 5 typography specimens, 5 color swatches, 5 material/pattern studies, and 7 interface fragments. Linked Calm from the homepage; other mood-board directions remain placeholders. Photographs are local copies sourced from Unsplash.
- **Iteration 2B — Arcade mood board:** Added “Play the World,” a game-map/HUD composition with 28 distinct artifacts: 6 travel scenes, 5 typography experiments, 5 color studies, 5 pixel patterns/textures, and 7 game-interface fragments. Added local Unsplash city/travel photographs and linked Arcade from the homepage. Editorial remains a non-clickable placeholder.
- **Iteration 2C — Editorial mood board:** Added “Elsewhere — A Travel Journal,” a disciplined magazine-style page with 28 artifacts: 6 travel photographs, 5 typography specimens, 5 restrained color studies, 5 print textures/patterns, and 7 editorial interface fragments. Added local travel photographs and linked Editorial from the homepage. Design systems and the final site remain pending review.
- **Iteration 2D — Editorial visual revision:** Revised Editorial into a bold contemporary travel magazine with Swiss graphic design: full-bleed cover photography, oversized sans-serif headlines, an asymmetric photo essay, a black typography spread, and graphic print/interface studies. Preserved all 28 artifacts and reused the six local photographs. All three mood boards have been visually reviewed and approved.
- **Iteration 3 — Design systems:** Added three independently styled libraries: Calm’s spacious field guide, Arcade’s framed player manual, and Editorial’s sharp magazine grid. Each documents nine semantic colors, four typography roles, spacing/shape/grid guidance, a complete component library, six control-state specimens, and empty/loading/error/success states. Working examples include form validation, checkboxes, radios, a switch, keyboard-operable tabs, interest filters, trip removal/restoration, and a native modal. All three design systems passed comprehensive QA and have been approved for Milestone 3.
- **Iteration 4 — Final Travel Planner website:** Pending review and approval.

## Design-system examples

The three libraries share accessible interaction behavior, while each has a distinct hero, foundation order, component grid, typography, shape, border, and elevation treatment. Color samples document foreground pairs and computed WCAG contrast ratios. Calm favors serif headings and soft panels; Arcade uses offset shadows, strong frames, cyan focus rings and an XP meter; Editorial uses black/white surfaces, oversized index numbers, sharp rules, and article layouts.

- Form: enter a destination, choose a season and pace, and save to see a local confirmation. No data persists after a reload.
- Tabs: use the arrow keys, Home and End; only the selected tab is in the Tab sequence.
- Filter chips: select interests to update the visible example suggestions.
- Modal: open trip details; native dialog behavior contains focus, supports Escape and returns focus to the trigger.
- Static specimens are explicitly labeled. Loading is a static demonstration; reminders update a preference only.

Run `npm test` for interaction-helper and semantic contrast checks, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Tests use the installed TypeScript compiler and Node’s built-in test runner; no extra test dependency is required. The optional browser regression suite covers 1440×900, 768×1024, 390×844, and 320×700: forms, choices, keyboard tabs, filters, trip removal/restoration, native modal dismissal and focus restoration, long-content overflow, reduced motion, and all seven implemented routes. It requires a local server and separately installed Playwright Core plus Chrome; no browser dependency is added to this project.

```bash
npm install --prefix /tmp/travel-m3-qa --no-save playwright-core
npm run start -- --port 3100
# In another terminal (macOS Chrome is the default executable):
PLAYWRIGHT_MODULE=/tmp/travel-m3-qa/node_modules/playwright-core/index.mjs node tests/design-systems.browser.mjs
```

Override `QA_BASE_URL` or `CHROME_EXECUTABLE` when needed. Automated checks supplement visual inspection and do not replace assistive-technology testing.
