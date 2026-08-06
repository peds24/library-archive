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

### 2026-08-04 — Delete book + inline genre/pages editing (branch: phase-4)

**What happened:**
- Added `deleteBook(id)` and `updateBook(id, updates)` actions to `src/store/bookStore.ts`.
- Updated `app/book/[id].tsx`:
  - Trash icon in the header triggers an `Alert.alert` confirmation, then calls `deleteBook` and navigates back.
  - Genre and Pages metadata rows now show a small pencil icon and are tappable — tapping switches the row to an inline `TextInput` with an amber underline. Saves on keyboard return or blur. Empty genre or zero pages reverts to the previous value.
  - Published and Added rows remain read-only (those values don't change after the book is added).

**Design Decisions:**

*Why inline editing rather than an edit mode for the whole screen?*
Only two fields need to be editable (genre and pages). Putting the whole screen into an "edit mode" would add a toggle button and require the user to explicitly enter/exit editing for two fields. Tapping directly on the field is fewer taps and makes it obvious which fields are editable (the pencil icon signals it) vs. read-only.

*Why save on blur rather than requiring an explicit save button?*
An explicit "Save" button next to each field clutters the layout. Saving on blur (when the user taps away or presses Done on the keyboard) is standard mobile behaviour for inline text fields. If the user types nothing or clears the field, the value reverts — so there's no risk of accidentally blanking a field.

*Why a red trash icon in the header rather than a "Remove" button at the bottom?*
The header is always visible while scrolling, so the action is always reachable. Placing it in the header also follows the established mobile pattern (iOS Mail, iOS Contacts, etc.) that makes destructive actions available via a header icon behind a confirmation. A bottom button would require scrolling to reach and could be accidentally tapped.

*Why Alert.alert for the delete confirmation rather than a custom modal?*
`Alert.alert` uses the native OS dialog, which is instantly recognisable to the user as a destructive confirmation and requires no custom UI work. A custom modal would be more visually consistent but adds complexity for no functional gain.

**Architecture state after this session:**
```
Store now has 4 actions:
  addBook()       — Phase 3
  deleteBook()    — NEW: removes by id
  updateStatus()  — Phase 2
  updateBook()    — NEW: updates genre and/or pages by id

Book detail screen has 3 interactive zones:
  Header trash icon  → delete with confirmation
  Genre / Pages rows → inline edit (tap to edit, blur to save)
  Status pills       → tap to change status
```

---

### 2026-08-04 — Google Books fallback + manual book entry (branch: phase-4)

**What happened:**
- Identified that new-release ISBNs (e.g. 9781534332560) sometimes aren't in Open Library — the print run is too recent for Open Library's metadata to have caught up. The same title may exist in Google Books under a different edition ISBN.
- Implemented a three-tier lookup: Open Library first → Google Books silent fallback → manual entry form.
- Created `src/services/googleBooks.ts` — fetches `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`, returns `null` silently if no API key is configured (no crash, no error shown to user), throws on network failure.
- Created `src/services/bookLookup.ts` — orchestration layer: calls Open Library, catches network errors, falls back to Google Books, returns `null` only if both miss.
- Created `.env.example` (committed to repo) and `.env.local` (gitignored) for the `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` variable. The app works without a key — Google Books simply isn't queried.
- Created `app/manual-entry.tsx` — a modal form with ISBN (pre-filled from route param), Title (required), Author (required), Genre, Pages, and Published Year fields. ISBN falls back to a `manual-{timestamp}` ID if left blank (for books without barcodes). Duplicate check prevents adding the same ISBN twice.
- Updated `app/add.tsx` and `app/scan.tsx` to use `lookupByISBN` from `bookLookup.ts` instead of calling `openLibrary.ts` directly.
- Added "Add Manually" CTA in the `not-found` state of both screens — passes the scanned/typed ISBN as a route param so the form is pre-filled.
- Registered `manual-entry` screen in `app/_layout.tsx` as a modal.

**Design Decisions:**

*Why a separate `bookLookup.ts` orchestration module rather than putting the fallback logic inside each screen?*
`add.tsx` and `scan.tsx` both need the same fallback behaviour. Centralizing it in `bookLookup.ts` means the lookup chain is defined once and both callers stay simple. If we add a third data source later (e.g. ISBNdb), there's one file to update.

*Why does Google Books return `null` silently when no API key is configured rather than showing an error?*
For users who haven't set up a key, the Google Books step should be invisible — it's a best-effort enhancement, not a required feature. Showing an error or a "configure API key" message would confuse users who just want to add books. The fallback chain is: Open Library → (GB if key exists) → manual entry. Manual entry is always available as a last resort.

*Why use `EXPO_PUBLIC_` prefix for the API key?*
Expo's build system only bundles environment variables with this prefix into the client-side JavaScript bundle. Without it, `process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` would be `undefined` at runtime in the app — the prefix is required, not optional, for Expo managed workflow.

*Why is manual entry a modal rather than a pushed screen?*
It sits at the end of the Add flow (which is already a modal) or the Scan flow. Using `router.dismissAll()` after a successful add closes the entire modal stack cleanly, taking the user back to the Library without needing to pop multiple screens. A pushed screen would require navigating back through the add/scan screen before returning to the tab.

*Why require only Title and Author for manual entry, not ISBN?*
ISBN is optional in manual entry because the user is specifically in this flow because the ISBN lookup failed — forcing them to enter it again adds friction. For books without a barcode at all (hand-written journals, uncatalogued items), there's no ISBN to enter. Genre, Pages, and Year are optional because Open Library often leaves them blank anyway and the user can always fill them in later via the inline edit on the detail screen.

**Architecture state after this session:**
```
src/
  services/
    openLibrary.ts    — primary lookup (unchanged)
    googleBooks.ts    — NEW: secondary fallback, requires EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY
    bookLookup.ts     — NEW: orchestration: OL → GB → null

app/
  _layout.tsx         — manual-entry registered as modal
  add.tsx             — uses lookupByISBN; not-found state has 'Add Manually' button
  scan.tsx            — uses lookupByISBN; not-found state has 'Add Manually' button
  manual-entry.tsx    — NEW: manual form, ISBN pre-filled from route param

.env.example          — committed template (empty key)
.env.local            — gitignored (user fills in API key)

Lookup chain: Open Library → Google Books (if key set) → manual entry form
```

---

### 2026-08-04 — Phase 5: SQLite Persistence (branch: phase-5)

**What happened:**
- Merged `phase-4` into `main`, created `phase-5` branch.
- Installed `expo-sqlite` (SDK 57 compatible).
- Created `src/services/database.ts` — all SQLite logic isolated here:
  - `initDatabase()`: creates the `books` table if it doesn't exist, seeds from `mock-books.json` only on first launch (when table is empty), returns the full books array.
  - `dbAddBook()`, `dbDeleteBook()`, `dbUpdateStatus()`, `dbUpdateBook()` — one function per store action, each writes through to SQLite synchronously.
- Updated `src/store/bookStore.ts`:
  - Replaced JSON seed (`books: mockBooks as Book[]`) with an empty initial state (`books: []`).
  - Added `hydrate(books)` action — called once at startup with the result of `initDatabase()`.
  - Every mutation action now calls its corresponding `db*` function before updating in-memory state.
- Updated `app/_layout.tsx`:
  - Calls `initDatabase()` synchronously in the startup `useEffect`, hydrates the store, then hides the splash screen.
  - Splash screen stays visible until the DB is ready — no flash of empty state.

**Design Decisions:**

*Why synchronous SQLite (`openDatabaseSync`, `execSync`, `runSync`) instead of the async API?*
The entire DB init happens once, before the splash screen hides. Using the sync API keeps the startup sequence simple: init → hydrate → hide splash. An async approach would require managing loading state across the app (a boolean in the store, a guard in every tab screen) to prevent rendering before data is ready. The sync cost on a small table (≤ a few hundred books) is imperceptible.

*Why call `initDatabase()` in `_layout.tsx` rather than inside the store initializer?*
`expo-sqlite` requires a React Native runtime environment — it can't be imported at module evaluation time in the store file because the module is parsed before the native runtime is fully initialized. Calling it inside a `useEffect` in the root layout component ensures the native bridge is ready.

*Why keep DB logic in `database.ts` separate from the store?*
The store owns in-memory state and React reactivity; `database.ts` owns persistence. Mixing them would make the store harder to test and the DB logic harder to replace (e.g. if we ever switch to a different storage backend). Each layer has one job.

*Why seed on first launch only (when table is empty) rather than always from JSON?*
Seeding every launch would overwrite any user changes on restart. The empty-table check is the simplest migration path: the seed only runs once, and every subsequent launch reads what the user has actually built.

**Architecture state after this session:**
```
Phase 5 COMPLETE. App is now fully persistent.

src/
  services/
    database.ts     — NEW: SQLite init, seed, and per-action write-through functions

src/store/
  bookStore.ts      — starts empty, hydrated from DB on launch; all mutations write to DB

app/
  _layout.tsx       — initDatabase() → hydrate() → hideAsync() on startup

Data flow:
  Launch → initDatabase() (create table, seed if empty, return rows)
         → hydrate(books) → Zustand in-memory state
  Mutation → db*() write-through → Zustand state update → UI re-render
  Next launch → reads persisted rows, not mock JSON

No migration system yet — schema changes require clearing app data.
```

---

### 2026-08-05 — Full-field editing on the book detail screen (branch: main)

**What happened:**
- Extended inline editing on `app/book/[id].tsx` to cover every editable field, not just genre and pages: Title and Author are now tap-to-edit (styled to match their original large/muted text treatment), Published now edits the full `publishedDate` string instead of just a read-only truncated year, and a new Cover URL row was added.
- Widened `updateBook`'s type in `src/store/bookStore.ts` from `Partial<Pick<Book, 'genre' | 'pages'>>` to also include `title`, `author`, `coverImage`, `publishedDate`.
- Widened `dbUpdateBook()` in `src/services/database.ts` to match, with one conditional `UPDATE` statement per new field.
- Left `id` and `dateAdded` read-only: `id` is the SQLite primary key (the ISBN) and changing it would mean deleting and re-inserting the row rather than updating it; `dateAdded` is an audit timestamp set once when the book enters the library, not a book attribute the user would want to hand-edit.

**Design Decisions:**

*Why editable Title/Author as their own components instead of reusing the label+value `EditableRow`?*
`EditableRow` renders a small label next to a value, which fits the metadata block's row layout. Title and author sit above that block as large, unlabeled display text (2xl bold title, muted subtitle). Reusing `EditableRow` would have forced a label onto text that currently has none, changing the visual hierarchy. Instead, `EditableTitleRow` and `EditableAuthorRow` mirror the same tap-to-edit/save-on-blur mechanics but preserve the original font size, weight, and color of each element.

*Why switch Published from a truncated year display to editing the full date string?*
The prior `Row` showed `book.publishedDate.slice(0, 4)` — a display-only transform. Making it editable while still showing just the year would mean every save silently discarded the month/day the record already had (`"1965-08-01"` → user edits "1965" → write back `"1965"`, losing `-08-01` permanently). Editing the full stored string avoids that data loss; the trade-off is the row is visually busier (a full date instead of a bare year), which is acceptable for a low-traffic field.

*Why not make `id` or `dateAdded` editable, given the request was "all fields"?*
Both are structural rather than descriptive metadata. `id` is the SQLite primary key — the `dbUpdateBook` writes are all `UPDATE ... WHERE id = ?`, so editing `id` itself would need delete+reinsert semantics, and it doubles as the ISBN feeding the Open Library cover URL, so an arbitrary edit would desync the two. `dateAdded` is set once at insert time and used for the Library screen's "Recent" sort; making it user-editable doesn't correspond to anything the user would naturally want to change by hand.

**Architecture state after this session:**
```
Book detail screen editable fields: title, author, genre, pages, publishedDate, coverImage, status
Read-only fields: id (ISBN, primary key), dateAdded (audit timestamp)

src/store/bookStore.ts
  updateBook(id, updates: Partial<Pick<Book, 'title'|'author'|'coverImage'|'genre'|'pages'|'publishedDate'>>)

src/services/database.ts
  dbUpdateBook() — one conditional UPDATE per editable field, all write-through to SQLite immediately
```

---

### 2026-08-05 — Fix `expo start --web` crashes (branch: main)

**What happened:**
- Diagnosed and fixed three separate, stacked errors that prevented `npx expo start --web` from loading at all (previously only tested on the Android device):
  1. **Metro couldn't bundle `wa-sqlite.wasm`** — `expo-sqlite`'s web backend statically imports a `.wasm` binary that Metro doesn't know how to handle by default. Fixed in `metro.config.js` by pushing `'wasm'` onto `config.resolver.assetExts`.
  2. **`[Error: Sync operation timeout]` / `SharedArrayBuffer is not defined`** — `expo-sqlite`'s web backend runs SQLite in a Worker and needs `SharedArrayBuffer`, which browsers only expose when the page is served with `Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` headers on the *document* response. Tried adding those via `config.server.enhanceMiddleware` in `metro.config.js` — headers showed up correctly on JS bundle requests but never on the `/` document response itself (traced into `@expo/cli`'s dev-server internals: for `web.output: "single"`, the HTML-serving `HistoryFallbackMiddleware` is wired up in a way that doesn't reliably inherit those headers in this Expo CLI version). Rather than keep patching Metro/Expo CLI internals — fragile, version-specific, and web was never a target platform for this app (see `CLAUDE.md`: Android/Pixel only) — `src/services/database.ts` now checks `Platform.OS === 'web'` and skips real SQLite entirely on web, falling back to seeding from `mock-books.json` into memory (same as pre-Phase-5 behavior). All `db*` write functions become no-ops on web. Android keeps full SQLite persistence, unchanged.
  3. **`Cannot manually set color scheme, as dark mode is type 'media'`** — unrelated NativeWind/`react-native-css-interop` web bug: its internal `MutationObserver` bootstrap tries to sync the color scheme on load and throws under Tailwind's default `darkMode: 'media'` strategy. Fixed by setting `darkMode: 'class'` in `tailwind.config.js` — safe here since the app has zero `dark:` variant usage anywhere (single fixed light theme).
- Also changed `app.json`'s `web.output` from `"static"` to `"single"` — `"static"` server-renders each route in Node before sending it to the browser, and the root layout's `initDatabase()` call was executing during that Node-side SSR pass too (this was the original source of the "Sync operation timeout" error, before the web fallback above made it moot). `"single"` is a pure client-side SPA build with no SSR, which fits a device-local app with no API routes.
- Verified via `claude-in-chrome`: loaded `localhost:8081` in an actual browser tab, confirmed zero console errors, and exercised the book-editing feature from the previous session (edited a title inline, saw it save and reflect immediately) to confirm the UI works end-to-end on web.

**Design Decisions:**

*Why fall back to in-memory-only on web instead of continuing to chase the COOP/COEP header fix?*
The header issue lives inside `@expo/cli`'s dev-server middleware ordering, not in this app's config — reproducing it required tracing through `node_modules/expo/node_modules/@expo/cli/build/src/start/server/metro/*.js`, and any fix would be pinned to this exact Expo CLI version and could silently break on the next `npx expo install` upgrade. Web was never a target platform (`CLAUDE.md` scopes this app to Android/Pixel); it's used here purely so the developer can preview UI changes without plugging in a physical device. An in-memory fallback gets that preview capability working reliably with a five-line platform check, versus an unbounded amount of fragile internals-patching for a persistence guarantee nothing on web actually needs.

*Why `web.output: "single"` instead of `"static"`?*
`"static"` server-renders every route in Node before sending HTML to the browser (for SEO/deep-linking of a real website). This app has no API routes, no need for SEO, and isn't deployed as a website — it's a local device-only tool. Server-rendering was actively harmful here: it ran `initDatabase()` in a Node context where the web SQLite backend can't function, which is what originally surfaced as "Sync operation timeout" before the Platform-guard fix made it a non-issue either way. `"single"` skips SSR entirely and matches what the app actually is: a client-only SPA.

**Architecture state after this session:**
```
src/services/database.ts
  db = Platform.OS === 'web' ? null : SQLite.openDatabaseSync(...)
  initDatabase() and every db*() write function short-circuit when db is null

Web:      no persistence — always reseeds from mock-books.json in memory, UI-preview only
Android:  unchanged — full SQLite persistence via expo-sqlite

metro.config.js   — resolver.assetExts includes 'wasm' (still required: expo-sqlite's
                     web module is bundled regardless of the runtime Platform check)
tailwind.config.js — darkMode: 'class' (app has no dark: usage; this only stops
                      NativeWind's web MutationObserver from crashing on load)
app.json            — web.output: 'single' (was 'static')

`npx expo start --web` now loads cleanly with zero console errors.
```

---

### 2026-08-05 — UI exploration workspace + blue accent (branch: design)

**What happened:**
- Created a `design` branch and an `inspo/` workspace (`inspo/references/` for dropped-in inspiration, `inspo/mockups/` for generated comps) so UI exploration doesn't touch `app/`/`src/` until a direction is chosen.
- Built two static HTML mockups covering all four screens (Reading, Library, Book Detail, Add Book): a custom-indigo "minimal & modern" pass, then a second pass after reviewing three inspiration screenshots (Perplexity's typographic restraint, Library of Babel's hexagonal-room concept, a Material 3 marketing page) — this one built on real M3 components (filled text field, filter chips, segmented buttons, extended FAB, pill-indicator nav bar) instead of an invented system, redrew the hexagon as a crisp vector motif (page background + book cover shape only, deliberately not reused anywhere else), and committed to an OLED-black high-contrast default theme.
- Added a live in-mockup accent switcher (orange/purple/green/blue) so all four could be compared side by side without four separate files; each accent carries its own light/dark tonal pair and the switcher flags known collisions live (e.g. blue and green both sit close to existing status-chip hues).
- User picked blue. Applied it to the real app: `tailwind.config.js`'s previously-unused `accent` token changed from `#b45309` (amber) to `#0061a4`, and every component that had the old amber hardcoded directly (buttons in `add.tsx`/`manual-entry.tsx`/`scan.tsx`, the `FilterBar` active pill, `+not-found.tsx`'s link, the root/tab header tints, the Book Detail edit-field underlines and pencil-icon tints) now references it — either via `bg-accent`/`text-accent` classes, or the matching raw hex where React Navigation/RN props require a literal color string (`headerTintColor`, `tabBarActiveTintColor`, `ActivityIndicator` color, `SymbolView` tintColor — none of these can consume a Tailwind class).
- Left the **TBR status color** (`bg-amber-100`/`text-amber-700` in `BookCard.tsx`, `bg-amber-600` in the Book Detail status picker) untouched — it's semantic (book status), not brand, and happened to share amber with the old accent only coincidentally.
- Pushed the `design` branch (workspace + mockups) to GitHub before starting the app edits.

**Design Decisions:**

*Why introduce a real `accent` token usage instead of just swapping every `amber-700` for a stock `blue-700`?*
`tailwind.config.js` already defined an `accent` color, but nothing in the app actually referenced it — every component hardcoded `amber-700`/`amber-600` directly, so the token was dead. Wiring components to `bg-accent`/`text-accent` instead of a literal Tailwind blue makes future re-theming a one-line change in one file, and — more immediately — using a custom hex (`#0061a4`) instead of Tailwind's stock `blue-700` (`#1d4ed8`) keeps the new accent visually distinguishable from the existing "Reading" status chip, which already uses `blue-700`/`blue-100`.

*Why blue at all, given it's the one accent option that overlaps an existing status hue?*
Flagged explicitly in the mockup comparison (orange has zero hue collisions with any status color; blue and green both risk blurring "primary action" into "book status"). User chose blue anyway with that trade-off known — mitigated as much as reasonably possible by picking a cyan-leaning blue distinct from the more indigo-leaning status blue, not by avoiding the collision entirely.

**Architecture state after this session:**
```
inspo/
  references/   — dropped-in inspiration screenshots (Perplexity, Library of Babel, Material 3)
  mockups/      — ui-direction-minimal-modern.html, ui-direction-material-crisp.html (accent switcher)

App accent color: #0061a4 (was #b45309), defined once in tailwind.config.js as `accent`,
duplicated as raw hex only where RN/React Navigation props can't take a Tailwind class
(app/_layout.tsx, app/(tabs)/_layout.tsx, app/book/[id].tsx, app/scan.tsx).

Status colors (reading/tbr/read/shelved) unchanged — still their own palette, independent
of the brand accent.
```

---

### 2026-08-05 — Material 3 / OLED-black redesign applied to the app (branch: design-material3)

**What happened:**
- Applied the Material 3 / OLED-black direction from `inspo/mockups/ui-direction-material-crisp.html` to the real app (previously only the accent color had been applied, on the old light theme). Planned first via a written plan (see plan-mode transcript) since it touched nearly every screen and added new design-system structure.
- `tailwind.config.js`'s flat `accent` color became a structured token set: `accent` (`DEFAULT`/`on`/`container`/`on-container`), `surface` (`DEFAULT`/`2`), `ink` (`DEFAULT`/`muted`/`faint`), `border`, and `status.{reading,tbr,read,shelved}.{bg,fg}` — values pulled directly from the mockup's dark/blue tokens.
- New `src/theme/colors.ts` (plain TS hex constants for the handful of spots that need a raw color instead of a className — React Navigation options, `SymbolView` tints, `ActivityIndicator` colors) and `src/components/M3TextField.tsx` (the mockup's filled-field look: label and input sharing one bordered container, accent bottom border) — replaces the duplicated `FormField` in `manual-entry.tsx` and adds a proper label to `add.tsx`'s previously label-less ISBN input.
- Every screen restyled: `BookCard` (tonal container for the large variant, flat borderless rows for the compact/list variant), `FilterBar` (M3 filter chip with a leading checkmark on the active pill), the tab bar (pill indicator behind the focused icon, built as a fully custom `TabIcon` — see decisions below), Book Detail (M3 segmented status control replacing the old per-status-colored pill row; Pages/Published reskinned as bold-numeral stat tiles that keep their existing tap-to-edit behavior), Add/Manual Entry (`M3TextField`, pill-radius buttons), Scan (dark bottom sheet), root layout (`<StatusBar style="light" />`, since it was confirmed unused anywhere before this), and `app.json` (`userInterfaceStyle: "dark"`, black splash/adaptive-icon background).
- Explicitly dropped the mockup's hex-clipped book covers per direct instruction — covers stay plain rectangular `<Image>`s, just recolored/re-radius'd. Avoided adding `react-native-svg` as a dependency entirely.
- Fixed two bugs found via screenshots the user sent after the first pass:
  1. **Filter chips ballooning to a huge oval when active.** Root cause: a `SymbolView` checkmark icon (`web: 'check'`) rendered unconstrained on web and blew up that one chip's height. Fixed by dropping the icon entirely and prefixing the label text with a literal `✓ ` character instead — simpler and immune to the platform-specific icon-sizing quirk. Applied the same fix to the Book Detail segmented control, which had the identical pattern.
  2. **Tab bar label overlapping/not aligned with the focused pill.** React Navigation renders `tabBarIcon` and the tab label as separate elements, so a pill returned from `tabBarIcon` can never visually contain the label — and on short/wide viewports RN's tab bar auto-switches to a beside-icon layout, which was colliding with my pill. Fixed by setting `tabBarShowLabel: false` and building one custom `TabIcon` component that renders the pill-wrapped icon and the label together in a single centered column, so the two can never be laid out independently of each other again.
- Fixed two more spacing issues from a follow-up round of feedback:
  1. **Too much vertical space between the two stacked `FilterBar` rows on the Library screen.** Measured via `getBoundingClientRect()` in the browser rather than guessing from a screenshot — the two rows were actually flush (0px apart); each `FilterBar`'s horizontal `ScrollView` was independently flex-growing to ~100px tall (React Native Web's `ScrollView` defaults to `flexGrow: 1` inside a flex column parent) while its content was only ~44px, so the pill row sat vertically centered inside an oversized box. Fixed with `style={{ flexGrow: 0 }}` on the `ScrollView` itself (not the `contentContainerStyle`).
  2. **Tab labels sitting flush against the bottom screen edge.** Added `pb-2` to the custom `TabIcon` wrapper.
- Took fresh screenshots of all four main screens against the new theme and swapped them into `docs/screenshots/`, replacing the light-theme ones from the previous session; updated the README's "Design direction" section and styling row in the tech-stack table to describe the token system and confirm the theme is applied to the app, not just mocked up.

**Design Decisions:**

*Why measure the `FilterBar` spacing bug with `getBoundingClientRect()` instead of just eyeballing screenshots and guessing at a padding value?*
The first instinct (reduce `contentContainerStyle`'s `paddingVertical`) would have shrunk the padding but left the actual bug untouched — the `ScrollView`'s outer box, not its content padding, was the oversized element. Screenshot-only debugging at different zoom levels/DPIs made the actual gap size ambiguous; a direct DOM measurement on the running web build gave an exact, unambiguous answer (rows were 0px apart, each box was ~100px vs ~44px of content) that pointed straight at the real fix.

*Why drop the mockup's hexagon-clipped covers instead of implementing them with `react-native-svg`?*
Explicit user instruction, given directly. The hexagon was a mockup-only motif (a nod to the Library of Babel) layered on top of the Material 3 direction, not a load-bearing part of it — keeping real book covers as plain rectangles avoids a new native dependency for a purely decorative shape.

*Why a fully custom `TabIcon` instead of trying to style React Navigation's built-in label?*
React Navigation's tab bar treats the icon (`tabBarIcon`) and the label (`tabBarLabel`/the default title-derived label) as independent, separately-positioned elements — there's no supported way to make a pill background returned from one also wrap the other. Rather than fight the library's responsive icon/label layout switching (which is what caused the original overlap), taking over both with `tabBarShowLabel: false` plus one component guarantees the pill and label are always laid out together, on every viewport.

**Architecture state after this session:**
```
tailwind.config.js — structured Material 3 token set (accent/surface/ink/border/status),
                     replacing the flat single `accent` hex from the previous session

src/theme/colors.ts        — new: raw hex mirror of the Tailwind tokens for non-className usages
src/components/M3TextField.tsx — new: shared M3 filled-text-field component

Every screen now renders on the OLED-black Material 3 theme (previously only the accent
color had changed; the light background/components were still the pre-redesign look).
docs/screenshots/*.jpg regenerated to match.

app.json: userInterfaceStyle "dark", splash/adaptive-icon background #000000 (was #fafaf9)
```

---

### 2026-08-05 — Tab bar polish + scroll-collapsing filters (branch: design-material3)

**What happened:**
- Tab bar labels ("Reading"/"Library") bumped from 11px/500 weight to 13px/600 weight for better legibility.
- Removed the hairline border between the tab bar and screen content (`borderTopWidth: 0` in `tabBarStyle`) so the bar flows into the content above it instead of being visually separated.
- Library screen's two `FilterBar` rows now collapse out of view as the book list scrolls down and slide back in as it scrolls up — the standard "hide on scroll" pattern via `Animated.diffClamp`. The filter rows moved to an absolutely-positioned `Animated.View` on top of an `Animated.FlatList`, with the list's `contentContainerStyle.paddingTop` matching the filters' height so the first book sits directly below them at rest.
- Verified the collapse behavior directly via `scrollTop`/`dispatchEvent('scroll')` in the browser console rather than fighting the browser-automation window resizer (which kept auto-expanding past the size needed to force list overflow) — confirmed the header hides by exactly its own height on scroll down, partially reveals proportionally on a partial scroll-up, and fully returns at scroll top.

**Design Decisions:**

*Why a hardcoded `FILTERS_HEIGHT` constant instead of measuring the filter section's actual height with `onLayout`?*
`Animated.diffClamp`'s min/max bounds are fixed at creation and can't be updated after an async `onLayout` measurement without recreating the animated node (and handling the render-before-measurement gap). Since both `FilterBar` rows now have a fixed, deterministic height (`h-8` pill + fixed `paddingVertical` — no more content-dependent sizing after the earlier `flexGrow` fix), hardcoding the value that already exists in `FilterBar`'s own styling is simpler and avoids a layout-thrash/flash-of-wrong-position on mount.

**Architecture state after this session:**
```
app/(tabs)/library.tsx — filters now render in an absolutely-positioned Animated.View
  driven by Animated.diffClamp(scrollY, 0, FILTERS_HEIGHT); FlatList replaced with
  Animated.FlatList wired to the same scrollY via onScroll (useNativeDriver: true).

Tab bar: 13px/600 labels, no top border — otherwise unchanged from the previous session.
```

---

### 2026-08-05 — Library search + fixed the filter/list gap bug (branch: search)

**What happened:**
- Added search to the Library screen: a toggle icon in the header opens a full-width search field (title or author, case-insensitive substring match), combining with the existing status filter and sort. The header's icons (search toggle + add) moved from `(tabs)/_layout.tsx`'s static `headerRight` into `library.tsx` itself via `useNavigation().setOptions()` in a `useLayoutEffect`, since the search toggle is this screen's own state and React Navigation's `headerRight` for a tab is otherwise only definable centrally in the layout.
- Circled both header icons in a `bg-accent-container` tonal circle for contrast against the black header — initially gave search a neutral treatment and add an accent one, then made them match per direct feedback.
- **Found and fixed the real cause of a "too much space between filters and the first book" bug** that survived several attempted padding-value fixes: `Animated.View`'s `className="absolute top-0 left-0 right-0 bg-surface"` was never actually applying `position: absolute` — checked via `getComputedStyle` in the browser and found `position: relative`. NativeWind's `className` support isn't wired up for `Animated.View` the way it is for plain `View` in this project's setup, so the "absolute" utility silently did nothing, leaving the filter overlay in normal document flow — pushing the `FlatList` down by the overlay's own height (88px) *in addition to* the `FlatList`'s own `paddingTop: 88` (reserved for exactly the floating-overlay case that wasn't actually happening), roughly doubling the gap. Fixed by moving the positioning (`position`, `top`/`left`/`right`, `backgroundColor`) onto the `style` prop instead of `className`, which isn't subject to that interop gap. No padding-value change was ever the right fix.
- Also hit two false leads while debugging this: (1) suspected a stale Metro/browser cache, restarted the dev server with `--clear` and hard-reloaded — didn't fix it, ruled out; (2) `location.reload(true)`'s force-bypass-cache argument is a no-op in modern Chrome, a reminder that JS-triggered reloads aren't a substitute for an actual cache-busting reload when ruling out staleness.

**Design Decisions:**

*Why debug with `getComputedStyle()`/`getBoundingClientRect()` in the browser console instead of reasoning from the source and screenshots?*
Three plausible-sounding theories (padding math, stale bundle, ScrollView flexGrow regression) were each individually reasonable and each turned out wrong or incomplete when checked. Screenshots show final paint, not why. Direct DOM inspection — checking what `position` a specific element actually computed to — found the real, non-obvious cause (a silent NativeWind/Animated interop gap) in one query, versus an unbounded number of "try a different number and reload" cycles.

*Why move the header's search+add icons into `library.tsx` rather than lifting `searchOpen` state up into `(tabs)/_layout.tsx`?*
The toggle button only needs to affect its own screen. Keeping the state and the header content that depends on it in the same file is simpler than introducing cross-file state (context or a store slice) for something with exactly one consumer.

**Architecture state after this session:**
```
app/(tabs)/library.tsx — owns its own headerRight (search toggle + add button, both
  circled bg-accent-container) via navigation.setOptions(); search query combines
  with the existing status filter and sort, case-insensitive on title/author.

app/(tabs)/_layout.tsx — library Tabs.Screen no longer sets a static headerRight.

Collapsing-filters overlay now genuinely position: absolute (was silently
position: relative due to a NativeWind/Animated.View className gap) — positioning
props for Animated components in this codebase should go through style, not
className, until/unless that interop gap is otherwise resolved.
```

---

### 2026-08-06 — Larger library text, fixed tab label clipping, real app icon (branch: android-view-tweaks)

**What happened:**
- Bumped text sizes in `BookCard`'s compact variant (used by the Library list): title `text-sm`→`text-base`, author/genre `text-xs`→`text-sm`, status badge `text-xs`→`text-sm`, cover art `w-12 h-16`→`w-14 h-20` to stay proportional. `FilterBar` pills went `text-sm`→`text-base` and `h-8`→`h-9` to match; `library.tsx`'s `FILTER_ROW_HEIGHT` constant (used to size the collapsing-filters animation) was updated from 44 to 48 to stay in sync with the taller pills.
- **Found and fixed the real cause of the bottom tab bar's "Reading"/"Library" labels wrapping to two lines and getting clipped.** `(tabs)/_layout.tsx`'s custom `TabIcon` renders an icon pill *and* a label together into the `tabBarIcon` slot (with `tabBarShowLabel: false`) so the focused-state pill only wraps the icon. That slot, though, is React Navigation's `TabBarIcon` wrapper — sized to a fixed 31×28px (`ICON_SIZE_WIDE`/`ICON_SIZE_TALL` in the vendored `expo-router/build/react-navigation/bottom-tabs/views/TabBarIcon.js`) meant for an icon-only glyph, and our content was absolutely positioned to fill exactly that box regardless of how much it actually needed. Traced this by reading the vendored React Navigation source rather than guessing from CSS values. Fixed by passing `tabBarIconStyle: { width: 80, height: 52 }` in `screenOptions` (a supported override — `BottomTabBar.js` forwards `options.tabBarIconStyle` straight through as the icon slot's `style`), enlarging the icon pill itself (`w-12 h-7`→`w-14 h-8`, icon glyph 22→24) so it reads less cramped, and setting an explicit `tabBarStyle.height: 80` since the default tab bar height (49px) was sized for the old fixed icon slot and wouldn't have grown to fit the new one. Also added `numberOfLines={1}` and `allowFontScaling={false}` to the label `Text` as a second line of defense against wrapping under larger device font-scale settings.
- Replaced the placeholder Expo icon/splash assets with the real app logo (an "impossible triangle" mark, supplied as `Boardlogo-roud(1).svg`) across every slot `app.json` references: `icon.png` and `favicon.png` (1024px/48px, using the source SVG as-is — it already has its near-black background baked in), `splash-icon.png` and `android-icon-foreground.png` (background stripped out, transparent, mark scaled down and centered on a padded canvas so it sits inside Android's adaptive-icon safe zone instead of touching the mask edges), `android-icon-monochrome.png` (same padded/transparent mark with all three fills flattened to white, since Android derives the themed-icon tint from alpha alone), and `android-icon-background.png` (flat `#000000`, matching `app.json`'s existing `adaptiveIcon.backgroundColor`).

**Design Decisions:**

*Why `tabBarIconStyle` instead of switching back to React Navigation's built-in label rendering?*
The built-in label path was deliberately avoided in an earlier session specifically because it visually overlapped this app's custom focused-pill treatment (see the `TabIcon` comment). `tabBarIconStyle` fixes the actual bug — an undersized fixed slot — without touching that already-solved layout problem, and keeps the icon+label as one component that's easy to reason about.

*Why rasterize the SVG with `resvg-cli` via `npx` rather than installing a conversion tool as a dependency?*
No SVG→PNG rasterizer was available locally (`rsvg-convert`, `inkscape`, ImageMagick, `sharp`, `cairosvg` were all absent), and icon generation is a one-off task, not something the app needs at runtime or build time going forward — so it didn't warrant a new `devDependency`. `npx --yes resvg-cli` fetches an ephemeral copy for the session without touching `package.json`.

*Why regenerate the adaptive-icon foreground/monochrome images with extra padding instead of just scaling the existing SVG straight to 1024px?*
The source mark fills roughly 85% of its own canvas edge-to-edge. Android's adaptive-icon mask only guarantees the inner ~66% of the foreground layer is visible across all launcher shapes (circle, squircle, rounded square) — rendering the mark at full bleed would get its corners clipped on most devices. Wrapped the background-stripped mark in a 768px canvas (1.5×) with the original 512px content centered inside, so the final 1024px export keeps the mark within the safe zone.

**Architecture state after this session:**
```
src/components/BookCard.tsx — compact variant (Library list) text bumped one Tailwind
  step across the board; large variant (Reading tab) untouched.
src/components/FilterBar.tsx — pills are h-9/text-base now; library.tsx's
  FILTER_ROW_HEIGHT constant tracks this and must be kept in sync if it changes again.

app/(tabs)/_layout.tsx — TabIcon's icon+label combo now renders into an explicitly
  sized 80×52 tabBarIconStyle slot (was an unstated default 31×28, the actual source
  of the wrapping/clipping bug); tabBarStyle.height is explicitly 80 to match.

assets/images/{icon,favicon,splash-icon,android-icon-foreground,
  android-icon-background,android-icon-monochrome}.png — real app branding (impossible-
  triangle mark) replacing Expo's default placeholder icons; app.json's references
  were already correct and needed no changes. Regenerated from
  ~/Downloads/Boardlogo-roud(1).svg via a throwaway resvg-cli pipeline (not checked
  into the repo) — re-run manually from the source SVG if the mark ever changes.
```

---

### 2026-08-06 — Fixed data loss in the multi-book barcode scan loop (branch: fix-bulk-scan)

**What happened:**
- Fixed `app/scan.tsx` silently discarding scanned books when adding several in a row. The preview step's two actions were "Add to Library" (saved the previewed book and exited immediately) and "Scan another" (which only called `resumeScanning()` — reset the camera without ever calling `addBook`). Scanning book after book and tapping "Scan another" between each one threw away every book except whichever was on screen when "Add to Library" was finally tapped.
- There was a separate, more elaborate "Bulk" mode (a header toggle, a `bulkQueue` array, "Add to Queue"/"Skip" buttons, and a "Confirm All" bar) that did defer writes correctly via a temp array — but it required deliberately switching it on first, and the reported bug was hit going through the plain, default flow, whose button labels ("Add to Library"/"Scan another") match what was reported.
- Removed the separate Bulk toggle/queue path and made the default flow itself do the right thing: `handleAddAndContinue` (bound to "Scan another") now calls `addBook` before resuming the camera, and `handleAddAndExit` (bound to "Add to Library") calls `addBook` then navigates back. Every scan is written straight to the store (and SQLite) as soon as its preview is confirmed, so scanning N books and hitting "Scan another" N-1 times followed by "Add to Library" now saves all N — matching how the two buttons already read.

**Design Decisions:**

*Why remove the Bulk toggle/queue system instead of just fixing "Scan another" underneath it and leaving Bulk mode as an option?*
Once "Scan another" saves-and-continues by default, a separate deferred-queue mode that does almost the same thing under different button labels ("Add to Queue"/"Skip"/"Confirm All") is a second way to do the same job — two overlapping multi-add mechanisms in one screen, one of which (the default) most people would hit first and by name-match is what was actually reported broken. Simpler to have one flow that works than two, one of which is undiscoverable behind a header toggle.

*Why write straight to the store per scan instead of keeping a temp array and batching the writes?*
The duplicate check (`books.some(b => b.id === isbn)`) already reads from the live Zustand store, which updates synchronously on `addBook`. Writing immediately means that check keeps working against everything scanned so far in the same session for free — a temp queue would've needed its own separate "is this already queued" check (which is in fact what the old `bulkQueue.some(...)` clause existed for, and disappeared along with the queue).

**Architecture state after this session:**
```
app/scan.tsx — single linear flow: scan → preview → [Add to Library: save + router.back()]
  or [Scan another: save + resume camera]. No mode toggle, no temp queue — every
  confirmed preview is written to the store (and SQLite) immediately via addBook.
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
