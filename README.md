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

The homepage (`/`) and all three mood boards are implemented. Each mood-board card links to its page; the unfinished design-system and final-site routes remain non-clickable placeholders.

| Section | Route | Status |
| --- | --- | --- |
| Mood Board — Calm | `/mood-boards/calm` | Implemented |
| Mood Board — Arcade | `/mood-boards/arcade` | Implemented |
| Mood Board — Editorial | `/mood-boards/editorial` | Implemented |
| Design System — Calm | `/design-systems/calm` | Planned |
| Design System — Arcade | `/design-systems/arcade` | Planned |
| Design System — Editorial | `/design-systems/editorial` | Planned |
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
- **Iteration 3 — Design systems:** Pending review and approval.
- **Iteration 4 — Final Travel Planner website:** Pending review and approval.
