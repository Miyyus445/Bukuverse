import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Book } from '@bukuverse/shared';

/**
 * Service untuk memanggil Google Books API dan menormalkan response
 * sesuai kontrak Book di PRD Section 9.
 */
@Injectable()
export class GoogleBooksService {
  private readonly baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  /**
   * Normalisasi volume Google Books ke tipe Book (kontrak API)
   */
  private normalizeVolume(volume: any): Book {
    const info = volume.volumeInfo ?? {};
    const accessInfo = volume.accessInfo ?? {};

    // Ambil thumbnail - prioritaskan thumbnail besar, fallback ke kecil
    let thumbnail: string | undefined;
    if (info.imageLinks) {
      thumbnail =
        info.imageLinks.thumbnail?.replace('http:', 'https:') ??
        info.imageLinks.smallThumbnail?.replace('http:', 'https:');
    }

    return {
      id: volume.id,
      title: info.title ?? 'Judul Tidak Diketahui',
      authors: info.authors ?? ['Penulis Tidak Diketahui'],
      publisher: info.publisher,
      publishedYear: info.publishedDate
        ? parseInt(info.publishedDate.split('-')[0], 10)
        : undefined,
      description: info.description,
      thumbnail,
      language: info.language,
      previewLink: info.previewLink ?? accessInfo.webReaderLink,
    };
  }

  /**
   * Bangun URL dengan query params
   */
  private buildUrl(path: string, params: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    if (this.apiKey) {
      url.searchParams.set('key', this.apiKey);
    }
    return url.toString();
  }

  /**
   * Fetch dengan timeout dan error handling
   */
  private async fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Bukuverse/1.0',
        },
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpException('Google Books API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new HttpException('Gagal menghubungi Google Books API', HttpStatus.BAD_GATEWAY);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Baca error body dari response Google Books
   */
  private async readErrorBody(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text;
    } catch {
      return 'Tidak bisa baca error body';
    }
  }

  /**
   * Cari buku dengan query, pagination, dan filter bahasa
   */
  async searchBooks(
    q: string,
    page = 1,
    pageSize = 12,
    lang?: string,
  ): Promise<{ items: Book[]; totalItems: number }> {
    const startIndex = (page - 1) * pageSize;
    const queryParts = [q];
    if (lang) {
      queryParts.push(`lang:${lang}`);
    }

    const url = this.buildUrl('', {
      q: queryParts.join(' '),
      startIndex,
      maxResults: pageSize,
      printType: 'books',
      projection: 'lite',
    });

    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new HttpException('Rate limit Google Books API', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new HttpException('Error dari Google Books API', HttpStatus.BAD_GATEWAY);
    }

    const data = await response.json();
    const items = (data.items ?? []).map((vol: any) => this.normalizeVolume(vol));

    return {
      items,
      totalItems: data.totalItems ?? 0,
    };
  }

  /**
   * Ambil detail buku by ID
   */
  async getBookById(id: string): Promise<Book> {
    const url = this.buildUrl(`/${id}`, {});
    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new HttpException('Buku tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      if (response.status === 429) {
        throw new HttpException('Rate limit Google Books API', HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new HttpException('Error dari Google Books API', HttpStatus.BAD_GATEWAY);
    }

    const volume = await response.json();
    return this.normalizeVolume(volume);
  }

  /**
   * Cari buku by author (untuk curated)
   * Query pencarian biasa dengan nama penulis (tanpa inauthor:)
   */
  async searchByAuthor(authorName: string, maxResults = 2): Promise<Book[]> {
    console.log('CEK API KEY:', !!this.apiKey);
    console.log('SEARCH AUTHOR:', authorName);

    const url = this.buildUrl('', {
      q: authorName,
      maxResults,
      printType: 'books',
      projection: 'lite',
    });

    console.log('REQUEST URL:', url.replace(this.apiKey ?? '', '[HIDDEN]'));

    const response = await this.fetchWithTimeout(url);

    if (!response.ok) {
      const errorBody = await this.readErrorBody(response);
      console.error('GOOGLE API ERROR:', response.status, errorBody);
      
      if (response.status === 429) {
        throw new HttpException('Rate limit Google Books API', HttpStatus.TOO_MANY_REQUESTS);
      }
      // Jangan throw error untuk curated, kembalikan array kosong
      return [];
    }

    const data = await response.json();
    return (data.items ?? []).map((vol: any) => this.normalizeVolume(vol));
  }
}