import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoogleBooksService } from './google-books.service.js';
import { CacheService } from './cache.service.js';
import { SearchBooksDto } from './dto/search-books.dto.js';
import { Book, SearchBooksResponse } from '@bukuverse/shared';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly googleBooks: GoogleBooksService,
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /books/search?q=&lang=&page=&pageSize=
   * Cari buku dengan pagination dan filter bahasa.
   * Cache TTL: 24 jam
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cari buku', description: 'Pencarian buku dengan pagination dan filter bahasa opsional' })
  @ApiResponse({ status: 200, description: 'Daftar buku', type: Object })
  @ApiResponse({ status: 400, description: 'Query tidak valid' })
  @ApiResponse({ status: 429, description: 'Rate limit Google Books API' })
  @ApiResponse({ status: 502, description: 'Error dari Google Books API' })
  async search(@Query() dto: SearchBooksDto): Promise<SearchBooksResponse> {
    const { q, lang, page = 1, pageSize = 12 } = dto;

    // Build cache key
    const cacheKey = `search:${q}:${lang ?? 'all'}:${page}:${pageSize}`;

    // Cek cache
    const cached = await this.cache.get<SearchBooksResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch dari Google Books
    const { items, totalItems } = await this.googleBooks.searchBooks(q, page, pageSize, lang);

    const response: SearchBooksResponse = {
      items,
      totalItems,
      page,
      pageSize,
    };

    // Simpan ke cache (TTL 24 jam = 86400 detik)
    await this.cache.set(cacheKey, response, 86400);

    return response;
  }

  /**
   * GET /books/curated
   * Daftar "Karya Indonesia Ternama" - ambil buku dari CuratedAuthor.
   * Cache TTL: 24 jam
   */
  @Get('curated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Karya Indonesia Ternama', description: 'Daftar buku kurasi penulis Indonesia' })
  @ApiResponse({ status: 200, description: 'Daftar buku kurasi', type: [Object] })
  @ApiResponse({ status: 502, description: 'Error dari Google Books API' })
  async getCurated(): Promise<Book[]> {
    const cacheKey = 'curated:indonesia';

    // Cek cache
    const cached = await this.cache.get<Book[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Ambil daftar penulis kurasi dari DB (urutan by order)
    const authors = await this.prisma.curatedAuthor.findMany({
      orderBy: { order: 'asc' },
    });

    // Untuk tiap penulis, ambil 1-2 buku teratas
    const allBooks: Book[] = [];
    for (const author of authors) {
      const books = await this.googleBooks.searchByAuthor(author.name, 2);
      allBooks.push(...books);
    }

    // Hapus duplikat berdasarkan ID buku (beberapa penulis bisa punya buku yg sama)
    const uniqueBooks = Array.from(new Map(allBooks.map(b => [b.id, b])).values());

    // Simpan ke cache (TTL 24 jam)
    await this.cache.set(cacheKey, uniqueBooks, 86400);

    return uniqueBooks;
  }

  /**
   * GET /books/:id
   * Detail buku by ID.
   * Cache TTL: 7 hari
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detail buku', description: 'Ambil detail buku berdasarkan ID Google Books' })
  @ApiParam({ name: 'id', description: 'ID buku dari Google Books', example: 'abc123' })
  @ApiResponse({ status: 200, description: 'Detail buku', type: Object })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  @ApiResponse({ status: 429, description: 'Rate limit Google Books API' })
  @ApiResponse({ status: 502, description: 'Error dari Google Books API' })
  async getById(@Param('id') id: string): Promise<Book> {
    const cacheKey = `detail:${id}`;

    // Cek cache
    const cached = await this.cache.get<Book>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch dari Google Books
    const book = await this.googleBooks.getBookById(id);

    // Simpan ke cache (TTL 7 hari = 604800 detik)
    await this.cache.set(cacheKey, book, 604800);

    return book;
  }
}