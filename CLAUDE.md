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

**Routing (Expo Router):** File-based. Screens live under `app/`. The four main views are:
- `app/(tabs)/index.tsx` — Currently Reading
- `app/(tabs)/library.tsx` — Full library with filtering
- `app/book/[id].tsx` — Book detail (status is editable here)
- `app/add.tsx` — Add book (single or bulk scan flow)

**Source layout:**
- `app/` — Expo Router screens (must stay at root)
- `src/components/` — reusable UI components (`BookCard`, `FilterBar`)
- `src/types/book.ts` — canonical `Book` interface and `BookStatus` type
- `src/data/mock-books.json` — seed data (5 books covering all statuses)
- `docs/` — planning docs (`PROJECT_PLAN.md`, `TECH_STACK.md`, `brainstorm.md`)

**NativeWind:** `global.css` is imported in `app/_layout.tsx`. Tailwind classes apply directly via `className` on React Native core components. Full class strings must appear literally in source (no dynamic string concatenation) so the Tailwind scanner picks them up — use lookup objects keyed by status/variant instead.

**State (Zustand):** A single store holds the books array in memory. On startup, it hydrates from SQLite. Every status update and new book addition writes back to SQLite immediately. *(Phase 2 — not yet built)*

**Database (`expo-sqlite`):** Single `books` table. On app start, check if table is empty; if so, seed from `src/data/mock-books.json`. *(Phase 5 — not yet built)*

**Book Lookup:** Google Books API — `https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}`. Native `fetch`. No auth required. *(Phase 3 — not yet built)*

**Barcode Scanning (`expo-camera`):** Bulk flow: scan → preview → add to temp array → reset scanner → repeat → "Confirm All" commits to store/DB. *(Phase 4 — not yet built)*

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

The project follows a phased plan (see `docs/PROJECT_PLAN.md`). Current state: **Phase 1 complete** — static UI with mock data, no state management or persistence yet. The phases are:
1. Static prototype with `mock-books.json`
2. Book detail view + Zustand state
3. Google Books API integration
4. Camera/barcode scanning
5. SQLite persistence
