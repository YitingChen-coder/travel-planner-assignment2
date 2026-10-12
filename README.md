# Travel Planner — UI/UX & Visual Design

A University of Chicago MPCS 51238 Assignment 2 project exploring three visual directions for a travel-planning experience. The homepage is a project hub for the three mood boards, three design systems, and final website.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- React

The project intentionally has no database, authentication, backend, external APIs, or additional UI packages.

## Routes

The homepage (`/`), all three mood boards, all three design systems, and the final Calm travel planner are implemented. All seven deliverable cards link to their pages.

| Section | Route | Status |
| --- | --- | --- |
| Mood Board — Calm | `/mood-boards/calm` | Implemented |
| Mood Board — Arcade | `/mood-boards/arcade` | Implemented |
| Mood Board — Editorial | `/mood-boards/editorial` | Implemented |
| Design System — Calm | `/design-systems/calm` | Implemented |
| Design System — Arcade | `/design-systems/arcade` | Implemented |
| Design System — Editorial | `/design-systems/editorial` | Implemented |
| Final Website — The Quiet Way | `/final-website` | Approved; deployed on Vercel |

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
- **Iteration 4 — The Quiet Way:** Completed an interactive frontend planner using the approved Calm semantic palette, serif typography, soft panels, and local photography. Includes curated discovery, trip creation, day-by-day activity editing/reordering, live estimated budgets, checklists, and temporary in-memory trips. A visual-review build was deployed without a commit or push. The final compliance revision removes persistence and has been approved and deployed to the public Vercel hub.

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

## Final website — The Quiet Way

The assignment explores three distinct directions: Calm’s warm ivory and sage field guide, Arcade’s neon game interface, and Editorial’s black-and-white travel magazine. Calm was selected for the final product because its spacious typography and gentle hierarchy support thoughtful planning without urgency. `/final-website` imports the existing Calm semantic tokens directly; approved layouts and visual directions are preserved. The compliance review corrects low-contrast gallery and mood-board text and calendar selections and restores the intended hiding of a duplicate Editorial cover caption; design-system pages are unchanged. The gallery links to all eight implemented routes.

Discover four curated destinations with local photography, then create a named journey with dates (1–30 days), pace, and an estimated USD budget. A labeled three-day Dolomites demo is ready to explore. Within each trip, switch days; add, edit, remove, and reorder activities with accessible up/down buttons. Activity costs immediately update total spending, category totals, remaining allowance, and over-budget feedback. Edit the total budget, check off preparation essentials, and add or remove custom checklist items. Trips created during the current visit can be revisited through Demo trips; removal and demo reset require confirmation.

### Assignment compliance and limitations

This is a small static Next.js + Tailwind frontend prototype. All eight routes are statically prerendered at build time. The assignment requires browser-only simulated interactions with no database, accounts, external data APIs, or data storage: nothing is saved.

The planner uses React in-memory state owned by its page. Destination selection, trip creation, itinerary edits, estimated budgets, and checklist changes work during the current visit. Refreshing the page resets the original labeled three-day demo. In-app browser Back may retain React state during the same visit; it does not save trip data. Demo trips is a temporary view, not a saved-trip library. Each browser tab is independent. There are no application persistence APIs, storage keys, serialized libraries, storage recovery, cookies for trip data, or cross-tab synchronization. The former persistent implementation is no longer read or used; any historical data left by that older deployed version is ignored.

The three approved mood boards each contain 28 distinct artifacts. Their design systems document semantic colors, type roles, geometry, component controls and states, and empty/loading/error/success specimens. The final site follows Calm and exceeds the required two meaningful interactions through trip creation, activity editing/reordering, budget updates, and checklist changes. Gallery navigation makes all deliverables accessible. Existing Git history is preserved.

Costs are illustrative USD estimates, not live prices or availability. Only activities count toward spending; include stays and transport as activities if you want to count them. There is no booking, authentication, backend, map API, export, or route optimization. The approved non-persistent prototype is live at [travel-planner-assignment2.vercel.app](https://travel-planner-assignment2.vercel.app), with all eight routes publicly accessible.

Images reuse the approved local Unsplash collection; no image request to an external service is needed at runtime. No product dependencies were added.

### Final-planner testing

`npm test` includes trip validation, day-scoped activity changes/reordering, budget math, checklist state, and a source check prohibiting persistence APIs or external data requests alongside existing design-system tests. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` as well.

For optional real-browser tests, use the separate Playwright Core install described above and local Chrome:

```bash
npm run start -- --port 3200
# In another terminal:
PLAYWRIGHT_MODULE=/tmp/travel-m3-qa/node_modules/playwright-core/index.mjs node tests/planner.browser.mjs
PLAYWRIGHT_MODULE=/tmp/travel-m3-qa/node_modules/playwright-core/index.mjs node tests/planner-edges.browser.mjs
```

The suite exercises discovery, destination selection, trip validation/creation, itinerary edits/reordering and day switching, dynamic budgets, checklist changes, refresh reset, temporary trips, confirmations, blocked persistence APIs, reduced motion, and all eight routes at 1440×900, 768×1024, 390×844, and 320×700. The edge suite adds all destination actions, native dialog keyboard/backdrop behavior, 30-day and cross-year dates, long content, independent tabs, empty trip views, and demo restoration. The main suite also runs axe-core if available locally. Screenshots and accessibility output go to `/tmp/travel-m4-qa`, outside Git. Override `QA_BASE_URL`, `CHROME_EXECUTABLE`, or `QA_ARTIFACT_DIR` as needed. Automated Chrome testing supplements visual review; other browsers, physical devices, and assistive technologies need separate verification.

For the complete eight-route rubric/browser audit, run:

```bash
PLAYWRIGHT_MODULE=/tmp/travel-m3-qa/node_modules/playwright-core/index.mjs node tests/assignment.browser.mjs
```

This audit checks the requirements quoted for Assignment 2: three directions; 28 artifacts per board; design tokens, components and states; keyboard access; responsive layouts; images and links; console/network health; and axe-core. It captures screenshots outside the repository. The original assignment PDF is not present in the repository; the review uses the explicit requirements supplied by the user and the existing handover notes, without adding rubric criteria.

### Editing an existing trip

Open a trip and choose **Edit trip details** to update its name, destination,
start/end dates, and travel pace. Activities keep their relative day number and
order when dates shift; extending adds empty days. Shortening requires confirmation
when removed days contain activities, showing the number of days and activities
removed. **Keep all days** returns to the draft; Cancel, Escape, or closing the
dialog leaves the trip and selected day unchanged. After saving, the selected day
is kept within the new range. Changing destination keeps activities and displays
a reminder to review them. Trip identity, budget, checklist, and demo status remain
unchanged. All edits still exist only in memory.

The focused browser regression uses the same isolated tooling and server setup:

```bash
PLAYWRIGHT_MODULE=/tmp/travel-m3-qa/node_modules/playwright-core/index.mjs node tests/trip-details.browser.mjs
```

It covers prefilled details, validation, cancellation, date shifts and extensions,
destination changes, shortening confirmation, selected-day handling, and refresh
reset at 1440, 768, 390, and 320 pixels. Run persistence-blocking browser suites
against `npm run start` (a production build), as Next.js development tooling can
read cookies independently of the application's trip state.
