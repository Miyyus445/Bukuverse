'use client';

import { Book } from '@/lib/api';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
}

/**
 * Komponen Card untuk menampilkan buku
 * Mobile-first: 1 kolom HP, 2 tablet, 3-4 desktop
 */
export function BookCard({ book }: BookCardProps) {
  const coverUrl = book.thumbnail || 'https://via.placeholder.com/128x192/cccccc/666666?text=No+Cover';
  const authors = book.authors.join(', ') || 'Penulis tidak diketahui';
  const publisher = book.publisher ? ` | ${book.publisher}` : '';
  const year = book.publishedYear ? ` | ${book.publishedYear}` : '';

  return (
    <Link
      href={`/books/${book.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Cover Image */}
      <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img
          src={coverUrl}
          alt={`Cover ${book.title}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/128x192/cccccc/666666?text=No+Cover';
          }}
        />
      </div>

      {/* Book Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
          {authors}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {publisher}{year}
        </p>
      </div>
    </Link>
  );
}