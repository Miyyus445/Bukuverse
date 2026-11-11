'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookCard } from '@/components/BookCard';
import { searchBooks, SearchBooksResponse } from '@/lib/api';

const LANGUAGES = [
  { code: '', label: 'Semua Bahasa' },
  { code: 'id', label: 'Indonesia' },
  { code: 'en', label: 'Inggris' },
  { code: 'jv', label: 'Jawa' },
  { code: 'su', label: 'Sunda' },
  { code: 'ms', label: 'Melayu' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Ambil nilai langsung dari URL (source of truth)
  const q = searchParams.get('q') || '';
  const lang = searchParams.get('lang') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // State hanya untuk input teks (search box)
  const [searchQuery, setSearchQuery] = useState(q);
  const [results, setResults] = useState<SearchBooksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books ketika URL params berubah
  useEffect(() => {
    async function fetchBooks() {
      if (!q.trim()) {
        setResults({ items: [], totalItems: 0, page: 1, pageSize: 12 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await searchBooks(q, page, 12, lang || undefined);
        setResults(data);
      } catch (err) {
        setError('Gagal mencari buku. Silakan coba lagi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [q, lang, page]); // dependency dari URL, bukan state

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (lang) params.set('lang', lang);
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (e.target.value) params.set('lang', e.target.value);
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (lang) params.set('lang', lang);
    params.set('page', String(newPage));
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = results ? Math.ceil(results.totalItems / results.pageSize) : 0;

  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Hasil Pencarian
          </h1>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, penulis, atau ISBN..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="lang-filter" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Bahasa:
            </label>
            <select
              id="lang-filter"
              value={lang}
              onChange={handleLangChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Info */}
          {results && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {results.totalItems > 0
                ? `Ditemukan ${results.totalItems} buku${lang ? ` (bahasa: ${LANGUAGES.find((l) => l.code === lang)?.label || lang})` : ''}`
                : 'Tidak ada buku yang cocok dengan pencarian Anda.'
              }
            </p>
          )}
        </div>
      </section>

      {/* Results Grid */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {loading && !results && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && results && results.items.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada buku yang cocok dengan pencarian <strong className="text-gray-900 dark:text-white">{q}</strong>.
            </div>
          )}

          {!loading && !error && results && results.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {results.items.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Halaman sebelumnya"
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Halaman selanjutnya"
                  >
                    Next →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function SearchPageSkeleton() {
  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Hasil Pencarian
          </h1>
          <div className="animate-pulse space-y-4 max-w-xl mx-auto">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </section>
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}