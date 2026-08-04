import * as SQLite from 'expo-sqlite';
import { Book, BookStatus } from '@/src/types/book';
import mockBooks from '@/src/data/mock-books.json';

const db = SQLite.openDatabaseSync('library.db');

export function initDatabase(): Book[] {
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
  db.runSync(
    `INSERT OR IGNORE INTO books (id, title, author, coverImage, genre, pages, publishedDate, status, dateAdded)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [book.id, book.title, book.author, book.coverImage, book.genre, book.pages, book.publishedDate, book.status, book.dateAdded]
  );
}

export function dbDeleteBook(id: string): void {
  db.runSync('DELETE FROM books WHERE id = ?;', [id]);
}

export function dbUpdateStatus(id: string, status: BookStatus): void {
  db.runSync('UPDATE books SET status = ? WHERE id = ?;', [status, id]);
}

export function dbUpdateBook(id: string, updates: Partial<Pick<Book, 'genre' | 'pages'>>): void {
  if (updates.genre !== undefined) {
    db.runSync('UPDATE books SET genre = ? WHERE id = ?;', [updates.genre, id]);
  }
  if (updates.pages !== undefined) {
    db.runSync('UPDATE books SET pages = ? WHERE id = ?;', [updates.pages, id]);
  }
}
