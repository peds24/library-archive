# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal home library scanner and book tracker for Android (Google Pixel), built with React Native/Expo. No user accounts — all data lives on-device.

## Development Commands

```bash
npx expo start          # Start dev server
npx expo start --android  # Start and open on Android device
npx expo run:android    # Build and run native Android app

npx tsc --noEmit        # Type-check without emitting
```

## Architecture

**Stack:** React Native + Expo (managed workflow), TypeScript, Expo Router (file-based routing), NativeWind (Tailwind for RN), Zustand, `expo-sqlite`, `expo-camera`.

**Routing (Expo Router):** File-based. Screens live under `app/`. The views are:
- `app/(tabs)/index.tsx` — Currently Reading
- `app/(tabs)/library.tsx` — Full library with filtering
- `app/book/[id].tsx` — Book detail (every field editable here)
- `app/add.tsx` — Add book by ISBN, plus entry points to scanning and manual entry
- `app/scan.tsx` — Barcode scanner (step 1 of a scan; commits nothing)
- `app/scan-review.tsx` — Confirm/edit a scanned book (step 2; commits)
- `app/manual-entry.tsx` — Hand-typed fallback

**Source layout:**
- `app/` — Expo Router screens (must stay at root)
- `src/components/` — reusable UI components (`BookCard`, `FilterBar`, `BookEditor`, `M3TextField`)
- `src/services/` — `bookLookup.ts` (lookup entry point), `googleBooks.ts`, `openLibrary.ts`, `database.ts`
- `src/store/bookStore.ts` — Zustand store
- `src/types/book.ts` — canonical `Book` interface and `BookStatus` type
- `src/data/mock-books.json` — seed data (5 books covering all statuses)
- `docs/` — planning docs (`PROJECT_PLAN.md`, `TECH_STACK.md`, `brainstorm.md`)

**NativeWind:** `global.css` is imported in `app/_layout.tsx`. Tailwind classes apply directly via `className` on React Native core components. Full class strings must appear literally in source (no dynamic string concatenation) so the Tailwind scanner picks them up — use lookup objects keyed by status/variant instead.

**State (Zustand):** A single store holds the books array in memory. On startup, it hydrates from SQLite. Every status update and new book addition writes back to SQLite immediately.

**Database (`expo-sqlite`):** Single `books` table. On app start, check if table is empty; if so, seed from `src/data/mock-books.json`.

**Book Lookup:** `src/services/bookLookup.ts` is the single entry point every screen calls. It tries Google Books first (`src/services/googleBooks.ts`, needs `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` — returns null immediately when unset) and falls back to Open Library (`src/services/openLibrary.ts`, no API key, cover images via `https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg`). Manual entry is the last resort. Never call the two service modules directly from a screen.

**Barcode Scanning (`expo-camera`):** Two-step, so a bad scan can't add itself. `app/scan.tsx` scans and shows a preview sheet but writes nothing; "Confirm Book" pushes the looked-up book as a JSON param to `app/scan-review.tsx`, which holds it in local draft state and commits on either "Add to Library" (`dismissAll`) or "Add & Scan Another" (`back` to the scanner, which resets itself via `useFocusEffect`).

**Cover art (`src/services/covers.ts`):** Cover URLs are resolved and *validated* separately from metadata, because both APIs return URLs that load fine but aren't covers: Google's high-zoom render collapses to a landscape strip on some volumes (measured 575x92), and Open Library's ISBN-keyed CDN answers 200 with a 1x1 blank rather than 404ing. `resolveCover` walks a best-first candidate list and takes the first image whose real dimensions look like a cover (aspect 0.4-1.1, width >= 100). Google's `imageLinks.thumbnail` is only ~128px wide; `googleCoverAtZoom` rewrites `zoom=1` to `zoom=3` (575px) and strips `edge=curl`.

**API keys in builds:** `.env.local` is gitignored and EAS Build uploads from git, so cloud builds read `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` from EAS environment variables (set for development/preview/production), not from disk. Manage with `eas env:list` / `eas env:set`. Note any `EXPO_PUBLIC_*` value is inlined into the shipped bundle in plaintext.

**Editable book view:** `src/components/BookEditor.tsx` renders the cover, tap-to-edit fields, and status picker, and is shared by `app/book/[id].tsx` (edits go straight to the store) and `app/scan-review.tsx` (edits go to draft state until committed). Add new book fields there, not in either screen.

## Book Metadata Schema

```typescript
type BookStatus = 'shelved' | 'reading' | 'tbr' | 'read';

interface Book {
  id: string;          // ISBN (primary key)
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  pages: number;
  publishedDate: string;
  status: BookStatus;
  dateAdded: string;   // ISO 8601
}
```

Defined in `src/types/book.ts`. `src/data/mock-books.json` is the canonical example and the SQLite seed data.

## Dev Log

`DEVLOG.md` is a required part of this project. After every session that involves code changes or significant design decisions, add a new dated entry to `DEVLOG.md` using the template at the bottom of that file. Each entry must include:

- **What happened** — bullet list of changes made
- **Design Decisions** — for any non-obvious choice, explain the trade-offs and why this option was picked over alternatives
- **Architecture state** — a short plain-text snapshot of where the app stands structurally after the session

Do not skip this step, even for small changes. The log is a learning record the developer refers back to.

## Build Phases

The project follows a phased plan (see `docs/PROJECT_PLAN.md`). Current state: **all five phases complete**. The phases were:
1. ✅ Static prototype with `mock-books.json`
2. ✅ Book detail view + Zustand state
3. ✅ Book lookup — Google Books primary, Open Library fallback
4. ✅ Camera/barcode scanning, with a two-step scan → review → add flow
5. ✅ SQLite persistence
