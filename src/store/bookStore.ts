import { create } from 'zustand';
import { Book, BookStatus } from '@/src/types/book';
import mockBooks from '@/src/data/mock-books.json';

interface BookStore {
  books: Book[];
  addBook: (book: Book) => void;
  updateStatus: (id: string, status: BookStatus) => void;
}

export const useBookStore = create<BookStore>()((set) => ({
  books: mockBooks as Book[],
  addBook: (book) =>
    set((state) => ({ books: [book, ...state.books] })),
  updateStatus: (id, status) =>
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, status } : b)),
    })),
}));
