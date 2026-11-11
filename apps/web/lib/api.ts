/**
 * API Client untuk memanggil Backend Bukuverse
 * Base URL: http://localhost:3001 (backend NestJS)
 */

// Interface Book dari packages/shared
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Fetch dengan error handling dan timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Search books dengan pagination dan filter bahasa
 */
export async function searchBooks(
  q: string,
  page = 1,
  pageSize = 12,
  lang?: string
): Promise<SearchBooksResponse> {
  const params = new URLSearchParams({
    q,
    page: String(page),
    pageSize: String(pageSize),
  });
  if (lang) {
    params.set('lang', lang);
  }

  const url = `${API_BASE_URL}/books/search?${params.toString()}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get book detail by ID
 */
export async function getBookById(id: string): Promise<Book> {
  const url = `${API_BASE_URL}/books/${id}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Buku tidak ditemukan');
    }
    throw new Error(`Get book failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get curated books (Karya Indonesia Ternama)
 */
export async function getCuratedBooks(): Promise<Book[]> {
  const url = `${API_BASE_URL}/books/curated`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Curated failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Placeholder image untuk cover yang kosong/rusak
 */
export function getPlaceholderCover(): string {
  return 'https://via.placeholder.com/128x192/cccccc/666666?text=No+Cover';
}

/**
 * Validasi cover URL - return placeholder jika kosong/rusak
 */
export function getValidCover(thumbnail?: string): string {
  if (!thumbnail) return getPlaceholderCover();
  return thumbnail;
}