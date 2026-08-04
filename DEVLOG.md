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
