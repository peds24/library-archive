import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Book, BookStatus } from '@/src/types/book';
import mockBooks from '@/src/data/mock-books.json';

// expo-sqlite's web backend requires SharedArrayBuffer (cross-origin isolation
// headers on the document response), which Expo's web dev server doesn't reliably
// provide. This app targets Android only — web is a UI preview convenience — so on
// web we skip real persistence and just seed from mock-books.json into memory.
const db = Platform.OS === 'web' ? null : SQLite.openDatabaseSync('library.db');

export function initDatabase(): Book[] {
  if (!db) {
    return mockBooks as Book[];
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS books (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      author       TEXT NOT NULL,
      coverImage   TEXT NOT NULL,
      genre        TEXT NOT NULL,
      pages        INTEGER NOT NULL,
      publishedDate TEXT NOT NULL,
      status       TEXT NOT NULL,
      dateAdded    TEXT NOT NULL
    );
  `);

  const count = (db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM books;'))?.n ?? 0;

  if (count === 0) {
    const insert = db.prepareSync(
      `INSERT INTO books (id, title, author, coverImage, genre, pages, publishedDate, status, dateAdded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    );
    for (const b of mockBooks as Book[]) {
      insert.executeSync([b.id, b.title, b.author, b.coverImage, b.genre, b.pages, b.publishedDate, b.status, b.dateAdded]);
    }
    insert.finalizeSync();
    return mockBooks as Book[];
  }

  return db.getAllSync<Book>('SELECT * FROM books ORDER BY dateAdded DESC;');
}

export function dbAddBook(book: Book): void {
  if (!db) return;
  db.runSync(
    `INSERT OR IGNORE INTO books (id, title, author, coverImage, genre, pages, publishedDate, status, dateAdded)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [book.id, book.title, book.author, book.coverImage, book.genre, book.pages, book.publishedDate, book.status, book.dateAdded]
  );
}

export function dbDeleteBook(id: string): void {
  if (!db) return;
  db.runSync('DELETE FROM books WHERE id = ?;', [id]);
}

export function dbUpdateStatus(id: string, status: BookStatus): void {
  if (!db) return;
  db.runSync('UPDATE books SET status = ? WHERE id = ?;', [status, id]);
}

type EditableBookFields = Pick<Book, 'title' | 'author' | 'coverImage' | 'genre' | 'pages' | 'publishedDate'>;

export function dbUpdateBook(id: string, updates: Partial<EditableBookFields>): void {
  if (!db) return;
  if (updates.title !== undefined) {
    db.runSync('UPDATE books SET title = ? WHERE id = ?;', [updates.title, id]);
  }
  if (updates.author !== undefined) {
    db.runSync('UPDATE books SET author = ? WHERE id = ?;', [updates.author, id]);
  }
  if (updates.coverImage !== undefined) {
    db.runSync('UPDATE books SET coverImage = ? WHERE id = ?;', [updates.coverImage, id]);
  }
  if (updates.genre !== undefined) {
    db.runSync('UPDATE books SET genre = ? WHERE id = ?;', [updates.genre, id]);
  }
  if (updates.pages !== undefined) {
    db.runSync('UPDATE books SET pages = ? WHERE id = ?;', [updates.pages, id]);
  }
  if (updates.publishedDate !== undefined) {
    db.runSync('UPDATE books SET publishedDate = ? WHERE id = ?;', [updates.publishedDate, id]);
  }
}
