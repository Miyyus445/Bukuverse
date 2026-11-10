/**
 * Shared types between frontend and backend.
 * Kontrak API sesuai PRD Section 9.
 */

export interface Book {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  description?: string;
  thumbnail?: string;
  language?: string;
  previewLink?: string;
}

export interface SearchBooksResponse {
  items: Book[];
  totalItems: number;
  page: number;
  pageSize: number;
}

export interface CuratedAuthor {
  id: string;
  name: string;
  order: number;
}