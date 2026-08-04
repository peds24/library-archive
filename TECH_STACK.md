# Technical Architecture

This application is built to be extremely lightweight, responsive, and optimized for mobile devices (specifically Google Pixel) without requiring user accounts.

## Core Stack
* **Framework:** React Native with Expo (Managed workflow).
* **Language:** TypeScript (Ensures data structures like Book Metadata stay consistent).
* **Routing:** Expo Router (File-based routing).
* **Styling:** NativeWind (Tailwind CSS for React Native) to achieve a minimal UI without bloated style sheets.
* **State Management:** Zustand (Lighter and less boilerplate than Redux).

## Storage & APIs
* **Database:** `expo-sqlite`. A local SQLite database keeps the app fast and offline-capable, ensuring lightning-fast sorting and filtering as the library grows.
* **Barcode Scanning:** `expo-camera` (Utilizes highly optimized, native barcode scanning).
* **API Client:** Native `fetch` API.
* **Book Lookup:** Google Books API.

## Database Schema Overview
The `books` table maps directly to the required metadata:
* `id` (ISBN)
* `title`
* `author`
* `cover_image`
* `genre`
* `pages`
* `published_date`
* `status` (shelved, reading, tbr, read) 
* `date_added`