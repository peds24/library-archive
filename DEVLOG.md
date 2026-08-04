# Development Log

A running record of every session, design decision, and architectural choice made while building this app. The goal is to explain *why* things were built the way they were, not just what was built.

---

## How to Read This

- **Sessions** are dated entries — what changed, what was decided, and what problems came up.
- **Design Decisions** within each session capture trade-offs: what alternatives were considered and why one was picked.
- **Architecture Notes** track how the overall structure evolves over time.

---

## Sessions

### 2026-08-04 — Project Initialization

**What happened:**
- Created the repository.
- Wrote planning documents: `brainstorm.md`, `PROJECT_PLAN.md`, `TECH_STACK.md`, `README.md`.
- Created `mock-books.json` with 5 sample books covering all four status values (`shelved`, `reading`, `tbr`, `read`).
- Initialized `CLAUDE.md` for AI-assisted development context.
- Initialized this `DEVLOG.md`.

**Design Decisions:**

*Why Expo (managed workflow) over bare React Native?*
The app targets a single device (Google Pixel). Expo managed workflow removes native build complexity and gives access to `expo-camera` and `expo-sqlite` without ejecting. If native modules outside Expo's ecosystem are needed later, we can eject — but that's a bridge to cross only if necessary.

*Why no user accounts?*
This is a personal tool. Adding auth would introduce backend infrastructure, sync complexity, and a login screen that gets in the way every time you open the app. Device-local storage via SQLite is enough and keeps the app instant and private.

*Why SQLite over AsyncStorage or MMKV?*
The library will grow. SQLite lets us filter and sort at the query level rather than loading the entire dataset into memory and filtering in JavaScript. This matters as the collection scales to hundreds of books.

*Why Zustand over Redux or React Context?*
Redux is overkill for a single-user local app with one primary data type. React Context re-renders too broadly. Zustand gives a minimal store with direct getters/setters and no boilerplate — ideal for a small state surface like this.

*Why NativeWind (Tailwind) over StyleSheet?*
Utility-first styling keeps component files short and avoids naming stylesheet objects. The visual language of the app is intentionally minimal, so Tailwind's constraint-based scale (spacing, font sizes, colors) keeps the UI consistent without a custom design system.

*Why Google Books API over Open Library or manual entry?*
Google Books has the most complete and reliable cover image coverage. The API requires no auth key for basic ISBN lookups (read-only, low volume). Open Library is a fallback if a title isn't found.

*Why ISBN as the primary key (`id`)?*
Every physical book has one. It's the natural barcode target, it's globally unique, and it's the query parameter for the Google Books API — so it doubles as the lookup key and the database key without any extra ID generation.

**Architecture state after this session:**
```
No code yet. Planning phase complete.
Stack decided: Expo + TypeScript + Expo Router + NativeWind + Zustand + expo-sqlite + expo-camera
Next: Phase 1 — scaffold Expo project and build static UI from mock-books.json
```

---

### 2026-08-04 — Phase 1: Project Scaffold & Static UI

**What happened:**
- Initialized Expo SDK 57 project using the `tabs` template (React Native 0.86, React 19).
- Set up NativeWind v4 — added `babel.config.js`, `metro.config.js`, `global.css`, `tailwind.config.js`.
- Reorganized folder structure: planning docs moved to `docs/`, mock data moved to `src/data/`, source code lives in `src/`.
- Added `.gitignore` from Expo template.
- Built `src/types/book.ts` — canonical `Book` interface and `BookStatus` union type.
- Built `src/components/BookCard.tsx` — two variants: `large` (Currently Reading) and `compact` (Library list).
- Built `src/components/FilterBar.tsx` — horizontally scrollable pill filters, reused for both status filters and sort options.
- Built `app/(tabs)/index.tsx` — Currently Reading screen, shows books with `status === 'reading'`.
- Built `app/(tabs)/library.tsx` — Library screen with two stacked filter bars (status filter + sort), renders compact book list.
- Updated `CLAUDE.md` to reflect the real folder structure.
- TypeScript: zero errors (`npx tsc --noEmit` passes clean).

**Design Decisions:**

*Why Expo SDK 57 (React Native 0.86, React 19)?*
This is the version `create-expo-app` installs by default as of now. Staying on the latest SDK avoids having to upgrade immediately after setup and gets the newest React 19 features. The tradeoff is less community Q&A for edge cases, but for a personal app on a single device that's acceptable.

*Why `src/` for source code alongside `app/`?*
Expo Router requires the `app/` directory at the project root — it can't be nested inside `src/`. But putting everything else (types, components, data) inside `src/` keeps the root clean and makes the separation between routing logic and reusable code obvious.

*Why two separate `FilterBar` instances for status and sort in the Library screen?*
A single combined bar would need to mix two different behaviors (filter by status vs. sort order) in one UI element, which gets confusing. Two separate rows are visually heavier but conceptually clear — the user can see both their active filter and their active sort at a glance.

*Why separate `STATUS_BG` and `STATUS_TEXT` lookup objects in `BookCard` instead of a combined string?*
NativeWind scans source files for complete Tailwind class strings at build time. If you construct a class like `'bg-' + color`, the scanner misses it and the style won't be included in the output. Keeping full strings like `'bg-blue-100'` and `'text-blue-700'` in separate lookup tables is the standard pattern for dynamic Tailwind classes in NativeWind.

*Why stone + amber as the color palette?*
Stone (warm neutral gray) gives a clean off-white feel without being stark white — it feels more like paper, which is appropriate for a reading app. Amber-700 as the accent color is warm and bookish without being garish. Status badge colors (blue/amber/green/stone) give quick visual scanning without being distracting.

*Why no navigation to a Book Detail screen in Phase 1?*
Phase 1 is explicitly about proving the data model and UI layout work. Adding a detail screen now means also wiring up navigation state before the state management layer (Zustand, Phase 2) exists — that would require local component state that immediately gets thrown away. Better to build it once, correctly, in Phase 2.

**Architecture state after this session:**
```
Phase 1 COMPLETE.

app/
  _layout.tsx         — root stack, imports global.css
  (tabs)/
    _layout.tsx       — tab bar (Reading + Library), amber accent, stone theme
    index.tsx         — Currently Reading: filters books by status='reading', large cards
    library.tsx       — Library: status filter + sort, compact cards with status badges
  +not-found.tsx

src/
  types/book.ts       — Book interface, BookStatus type
  data/mock-books.json — 5 seed books (all statuses represented)
  components/
    BookCard.tsx      — large + compact variants, status badge
    FilterBar.tsx     — horizontal pill filter row

State: NO state management yet. Data loaded directly from JSON import.
Storage: NONE yet.
Navigation: Two tabs only. No detail view yet.

Next: Phase 2 — Book detail view + Zustand store
```

---

### 2026-08-04 — Rename `default` status to `shelved` (branch: phase-1)

**What happened:**
- Created git branch `phase-1` for all Phase 1 work going forward.
- Changed `"status": "default"` → `"status": "shelved"` in `src/data/mock-books.json` (The Shadow of the Wind entry).
- Updated two stale references in `docs/brainstorm.md` that still called the status "default (in shelf)".

**Design Decisions:**

*Why was this a change at all — wasn't it already "shelved" in the type?*
Yes. The `BookStatus` type (`src/types/book.ts`) already used `'shelved'` from the start, and all the UI labels and filter buttons said "Shelved". The mock data was the one place that slipped through using `"default"` — a leftover from the original brainstorm before the name was finalized. TypeScript didn't catch it because the JSON import isn't strictly typed against `BookStatus` at the point of import; a `Book[]` cast was done at the screen level.

*Why "shelved" and not keep "default"?*
"Default" is a programming concept, not a library concept. "Shelved" describes what the book actually is — on the shelf, owned, not actively being read and not queued up. It's the most honest label and maps directly to how a physical library works.

**Architecture state after this session:**
```
No structural change. Data model is now fully consistent:
BookStatus = 'shelved' | 'reading' | 'tbr' | 'read'  (no "default" anywhere)
Branch: phase-1
```

---

### 2026-08-04 — Phase 2: Zustand Store, Book Detail, Editable Status (branch: phase-2)

**What happened:**
- Merged `phase-1` into `main`, created `phase-2` branch.
- Installed Zustand v5.
- Created `src/store/bookStore.ts` — single store seeded from `mock-books.json`, exposes `books` array and `updateStatus(id, status)` action.
- Created `app/book/[id].tsx` — book detail screen: large cover image, metadata rows (genre, pages, published year, date added), and a status picker with four colored pills.
- Updated `app/(tabs)/index.tsx` and `library.tsx` to read from the store instead of importing JSON directly.
- Made `BookCard` tappable via an `onPress` prop — both tab screens navigate to `/book/[id]` on tap.
- Styled the stack header for the detail screen (amber back button, stone background) in `app/_layout.tsx`.

**Design Decisions:**

*Why seed Zustand from JSON rather than initializing an empty store?*
For Phases 1–4, there's no persistence layer (SQLite comes in Phase 5). If the store started empty, the app would show nothing. Seeding from the mock JSON file means the UI is always populated during development and the Phase 5 migration is a drop-in: swap the JSON seed for a SQLite read in the store initializer.

*Why put `updateStatus` directly on the store rather than a separate action file?*
There's currently one action and one data type. Extracting actions to separate files at this scale would be premature — it adds indirection without benefit. If the store grows beyond 3–4 actions, splitting it out is the right call.

*Why use colored status pills instead of a dropdown or modal picker?*
There are exactly four statuses, all of which are meaningful to the user at a glance. Pills let you see all options simultaneously and tap in one gesture — no extra overlay to dismiss. A picker or modal would take more taps for no added clarity.

*Why do status changes reflect immediately in the list screens?*
Zustand's store is shared across the entire component tree. The tab screens subscribe to `state.books`, so any `updateStatus` call re-renders them automatically — no manual sync needed. This is the primary reason for introducing Zustand in Phase 2 rather than keeping local component state.

**Architecture state after this session:**
```
Phase 2 COMPLETE.

app/
  _layout.tsx         — stack header styled; book/[id] screen registered
  (tabs)/
    index.tsx         — reads from store; BookCard navigates to detail
    library.tsx       — reads from store; BookCard navigates to detail
  book/
    [id].tsx          — detail view: cover + metadata + status picker

src/
  store/
    bookStore.ts      — Zustand store: books[], updateStatus()
  components/
    BookCard.tsx      — now accepts onPress prop, wrapped in Pressable

State: IN-MEMORY via Zustand. Changes survive navigation within a session
       but are lost on app restart (SQLite persistence = Phase 5).
Storage: NONE yet.

Next: Phase 3 — Google Books API integration + Add Book screen
```

---

### 2026-08-04 — Phase 3: Google Books API & Add Book Flow (branch: phase-3)

**What happened:**
- Merged `phase-2` into `main`, created `phase-3` branch.
- Created `src/services/googleBooks.ts` — fetches `https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}`, maps the `volumeInfo` response shape to the local `Book` type, upgrades the thumbnail URL from `http://` to `https://` and bumps `zoom=1` to `zoom=3` for better cover resolution.
- Added `addBook` action to `src/store/bookStore.ts` — prepends the new book to the front of the array (most recently added appears first).
- Created `app/add.tsx` — multi-state screen: ISBN text input → loading spinner → preview card (cover, title, author, genre/pages/year) → "Add to Library" / "Search another ISBN". Handles not-found, network error, and duplicate book cases.
- Added a "+" button to the Library tab header that opens the add screen as a modal.
- Registered `add` screen in `app/_layout.tsx` with `presentation: 'modal'`.

**Design Decisions:**

*Why a modal for the Add Book screen rather than a tab or a pushed screen?*
The add flow is transient — you come, you search, you add or cancel, you leave. A modal (slides up from the bottom) communicates that intent better than pushing a screen onto the stack (which implies you're going deeper into related content). Tabs are for persistent destinations you return to frequently; add is a tool you use occasionally.

*Why a "+" button in the Library header rather than adding a third tab?*
A permanent "Add" tab would feel like a destination, but adding is an action. The "+" in the header is a well-understood mobile pattern. Also, Phase 4 will change the add flow significantly (camera scanning), so keeping it out of the tab bar avoids having to redesign the navigation then.

*Why upgrade the Google Books cover URL from `zoom=1` to `zoom=3`?*
The API returns `zoom=1` thumbnails by default which are very small (roughly 128×192px). Changing to `zoom=3` gives a noticeably sharper image on modern screens without requiring a separate API call. The `http://` → `https://` upgrade is required because React Native's Image component rejects non-secure URLs in release builds.

*Why handle the duplicate case in the screen rather than in the store's `addBook` action?*
The store is intentionally dumb — it trusts its callers. Putting the duplicate check in the screen keeps the store focused on state mutations and lets the UI decide how to communicate the problem to the user (an inline message in this case). If we ever add a bulk import flow, that flow can make its own decision about duplicates.

*Why prepend new books instead of appending?*
The Library view's default sort is "Recent" (by `dateAdded`). Since the store is the source of truth and SQLite doesn't exist yet, putting the new book at the front of the array is the cheapest way to make it appear first without re-sorting the whole list on every render.

**Architecture state after this session:**
```
Phase 3 COMPLETE.

app/
  _layout.tsx         — add screen registered as modal
  (tabs)/
    _layout.tsx       — Library header has '+' → /add
  add.tsx             — ISBN input → API fetch → preview → confirm

src/
  services/
    googleBooks.ts    — fetchBookByISBN(): ISBN → Book | null
  store/
    bookStore.ts      — addBook() action added

API: Open Library (no key, no rate limits)
Data flow: ISBN → openLibrary.ts → preview state → addBook() → Zustand → UI re-renders

Next: Phase 4 — expo-camera barcode scanner replacing manual ISBN entry
```

---

### 2026-08-04 — Switch book lookup from Google Books to Open Library (branch: phase-3)

**What happened:**
- Deleted `src/services/googleBooks.ts` and all API key scaffolding (`.env.local`, `.env.example`).
- Created `src/services/openLibrary.ts` — same `fetchBookByISBN(isbn)` interface, now calling `https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&jscmd=data&format=json`.
- Cover images constructed directly from the ISBN: `https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg` — the same CDN format already used in `mock-books.json`.
- Updated `app/add.tsx` to import from the new service. Removed the `rate-limited` error phase (no longer needed).
- Updated `CLAUDE.md` to document the new API and correct the phase status.

**Why the switch was made:**
The original plan specified Google Books API. During Phase 3 implementation, Google's unauthenticated endpoint immediately returned 429 (rate limited). The fix would have required every developer to register a Google Cloud project, enable the Books API, and generate an API key — meaningful setup friction for what is a personal, single-user tool.

Open Library is the better fit because:
- No API key, no account, no setup — it works out of the box
- No rate limits for personal-scale usage
- Cover images use the same `covers.openlibrary.org` CDN already in the seed data, making the source of truth consistent across mock and live data
- The only real tradeoff is genre data: Open Library's `subjects` field is often missing or overly broad, but we already default to `"Uncategorized"` which is acceptable for Phase 3

**Architecture state after this session:**
```
Phase 3 COMPLETE (revised).

src/
  services/
    openLibrary.ts    — fetchBookByISBN(): calls Open Library, no key needed
                        cover URL: covers.openlibrary.org/b/isbn/{isbn}-L.jpg

No env files needed. No external credentials required to run the app.
```

---

### 2026-08-04 — Phase 4: Camera & Bulk Scanning (branch: phase-4)

**What happened:**
- Created `phase-4` branch from `main`.
- Installed `expo-camera`, added plugin to `app.json` (handles Android camera permission declaration automatically).
- Created `app/scan.tsx` — full-screen camera scanner with:
  - Live `CameraView` watching for EAN-13, EAN-8, UPC-A, UPC-E barcodes
  - Scan frame overlay to guide the user
  - Open Library lookup fires automatically on scan
  - Bottom-sheet preview card for each result (cover, title, author, genre/pages)
  - **Single mode** (default): confirm one book → add to library → back
  - **Bulk mode** (toggled via "Bulk" button in header): add to queue → resume scanning → "Confirm All" adds everything at once
  - Duplicate detection against both the existing library and the current bulk queue
  - not-found and network-error states with "Scan another" recovery
- Updated `app/add.tsx`: added "Scan Barcode" button below the manual ISBN input that pushes to the scan screen.
- Registered `app/scan.tsx` in `app/_layout.tsx` with a dark header (black bg, white text) to blend with the camera UI.

**Design Decisions:**

*Why a separate `app/scan.tsx` instead of embedding camera in `app/add.tsx`?*
The camera UI is fundamentally different from the manual-entry UI — full screen, dark background, no keyboard, different header. Putting them in the same file would mean one component managing two completely different visual contexts via a mode flag. A separate screen keeps each concern isolated and makes the navigation model clear: add.tsx chooses the entry method, scan.tsx owns the camera experience.

*Why a `isProcessing` ref instead of state for preventing duplicate scans?*
State updates are asynchronous in React. If a barcode fires twice before the re-render sets `phase` to `'fetching'`, both events would trigger API calls. A ref updates synchronously and is checked before any async work starts, making it a reliable guard without adding a render cycle.

*Why bulk mode as a toggle rather than a separate screen/flow?*
The physical action of bulk scanning (point → scan → queue → repeat) happens in a tight loop. Breaking it across multiple screens would add navigation overhead between each scan. Keeping it as a mode on the same screen lets you stay in the camera view the entire time, with the "Confirm All" bar appearing at the bottom as the queue grows.

*Why EAN-13, EAN-8, UPC-A, UPC-E and not all barcode types?*
`expo-camera` scans faster when you narrow the barcode type list — it only runs the decoders for specified formats. Books use EAN-13 (ISBN-13) almost universally; EAN-8 and UPC variants cover older and some US-market books. Including QR, Data Matrix, etc. would slow detection for no benefit.

*Why a dark header for the scan screen?*
The camera view is black. A light-coloured header would create a jarring contrast at the top of the screen. A dark header (`#000` bg, white text) makes the scanner feel like a single unified surface.

**Architecture state after this session:**
```
Phase 4 COMPLETE.

app/
  scan.tsx            — camera scanner: single + bulk modes, bottom-sheet previews
  add.tsx             — now has 'Scan Barcode' button → /scan

Entry flow:
  Library '+' → /add (modal) → type ISBN  OR  tap 'Scan Barcode' → /scan (full-screen)

Requires physical Android device for camera — does not work in web or emulator.

Next: Phase 5 — SQLite persistence (status changes and added books survive app restart)
```

---

<!-- TEMPLATE — copy this block to start a new session entry

### YYYY-MM-DD — Session Title

**What happened:**
-

**Design Decisions:**

*Decision title?*
Explanation of trade-offs and why this choice was made.

**Architecture state after this session:**
```
Brief plain-text snapshot of where the app stands structurally.
```

-->
