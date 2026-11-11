'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBookById, getValidCover } from '@/lib/api';
import { Book } from '@/lib/api';

/**
 * Book Detail Page: Cover, judul, penulis, deskripsi, tombol "Baca di Google Books"
 * URL: /books/[id]
 */
function BookDetailPageContent() {
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
          setError('Buku tidak ditemukan');
        } else {
          setError('Gagal memuat detail buku. Silakan coba lagi.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBook();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="animate-pulse space-y-4">
            <div className="aspect-[2/3] max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error}
            </h2>
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!book) {
    return null;
  }

  const coverUrl = getValidCover(book.thumbnail);
  const authors = book.authors.join(', ') || 'Penulis tidak diketahui';
  const publisher = book.publisher || 'Penerbit tidak diketahui';
  const year = book.publishedYear ? ` (${book.publishedYear})` : '';
  const language = book.language ? ` | Bahasa: ${book.language.toUpperCase()}` : '';
  const description = book.description || 'Tidak ada deskripsi tersedia untuk buku ini.';
  const previewLink = book.previewLink;

  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:underline">Beranda</Link></li>
            <li className="text-gray-300 dark:text-gray-600">/</li>
            <li className="text-gray-900 dark:text-white truncate max-w-xs">{book.title}</li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover + Info */}
          <div className="flex flex-col md:flex-row">
            {/* Cover */}
            <div className="md:w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-700 relative">
              <img
                src={coverUrl}
                alt={`Cover ${book.title}`}
                className="w-full h-full object-cover min-h-[384px]"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/128x192/cccccc/666666?text=No+Cover';
                }}
              />
            </div>

            {/* Details */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium">Penulis:</span> {authors}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium">Penerbit:</span> {publisher}{year}
              </p>
              {language && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {language}
                </p>
              )}

              {/* Description */}
              <div className="flex-1 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sinopsis
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {previewLink && (
                  <a
                    href={previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg text-center hover:bg-blue-700 transition-colors"
                  >
                    Baca di Google Books
                  </a>
                )}
                <Link
                  href="/"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function BookDetailSkeleton() {
  return (
    <main className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="aspect-[2/3] max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </main>
  );
}

export default function BookDetailPage() {
  return (
    <Suspense fallback={<BookDetailSkeleton />}>
      <BookDetailPageContent />
    </Suspense>
  );
}