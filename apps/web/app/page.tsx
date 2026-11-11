'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookCard } from '@/components/BookCard';
import { getCuratedBooks } from '@/lib/api';
import { Book } from '@/lib/api';

/**
 * Home Page: Hero + Search Bar + Karya Indonesia Ternama
 */
export default function Home() {
  const router = useRouter();
  const [curatedBooks, setCuratedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch curated books on mount
  useEffect(() => {
    async function fetchCurated() {
      try {
        setLoading(true);
        const books = await getCuratedBooks();
        setCuratedBooks(books);
      } catch (err) {
        setError('Gagal memuat Karya Indonesia Ternama');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCurated();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero + Search Bar */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Bukuverse 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-2xl mx-auto">
            Katalog buku dari Google Books API — fokus kurasi karya penulis Indonesia
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex gap-2">
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
        </div>
      </section>

      {/* Karya Indonesia Ternama */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Karya Indonesia Ternama
          </h2>

          {loading && (
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

          {!loading && !error && curatedBooks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada buku kurasi tersedia saat ini.
            </div>
          )}

          {!loading && !error && curatedBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {curatedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}