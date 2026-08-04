# Project Execution Plan

This document outlines the phased approach for building the application using AI code generation tools.

## Phase 1: Static Prototype
* Initialize the Expo project with Expo Router and NativeWind.
* Create a hardcoded `mockBooks.json` file matching exact metadata requirements.
* Build the **Currently Reading** and **Library** views using the mock data.
* Implement basic UI filtering (sort by status, genre, alphabetical) in the Library view.

## Phase 2: Detailed Views & State Management
* Build the detailed **Book View** that opens when a book is tapped.
* Integrate Zustand for global state management.
* Make the "status" field editable in the Book View, ensuring the change reflects back in the Library and Currently Reading views.

## Phase 3: Google Books API Integration
* Build the manual entry version of the **Add Book** flow by typing an ISBN.
* Write a service utility to fetch data from `https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}`.
* Map the Google Books API response to the local Book Metadata structure.
* Build the preview confirmation UI before adding the book to the state.

## Phase 4: Camera & Bulk Scanning Flow
* Integrate `expo-camera` to replace manual ISBN typing with a native barcode scanner.
* Implement the **Bulk Add Flow** logic: scan -> preview -> add to temporary array -> reset scanner -> repeat until user hits "Confirm All".

## Phase 5: SQLite Persistence
* **Database Initialization:** Create a database initialization utility that runs on app start.
* **Schema Creation:** Create a `books` table that maps to the application's metadata.
* **Seed Data Logic:** Write a function to check if the database is empty; if so, insert mock JSON data for immediate UI testing.
* Ensure every time a book is added or its status is updated, the new state is saved to local storage.