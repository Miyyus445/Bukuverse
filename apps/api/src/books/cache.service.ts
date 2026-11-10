import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Service untuk caching response API menggunakan tabel ApiCache di PostgreSQL.
 * TTL disimpan sebagai timestamp di kolom expiresAt.
 */
@Injectable()
export class CacheService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ambil data dari cache jika ada dan belum expired.
   * Return null jika tidak ada atau sudah expired.
   */
  async get<T>(key: string): Promise<T | null> {
    const record = await this.prisma.apiCache.findUnique({
      where: { key },
    });

    if (!record) {
      return null;
    }

    // Cek expired
    if (new Date() > record.expiresAt) {
      // Hapus entry yang expired
      await this.prisma.apiCache.delete({ where: { key } });
      return null;
    }

    return record.payload as T;
  }

  /**
   * Simpan data ke cache dengan TTL dalam detik.
   * Default TTL: 24 jam (86400 detik).
   */
  async set(key: string, payload: unknown, ttlSeconds = 86400): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.prisma.apiCache.upsert({
      where: { key },
      update: {
        payload: payload as any,
        expiresAt,
      },
      create: {
        key,
        payload: payload as any,
        expiresAt,
      },
    });
  }

  /**
   * Hapus entry cache berdasarkan key.
   */
  async delete(key: string): Promise<void> {
    await this.prisma.apiCache.delete({ where: { key } }).catch(() => {
      // Ignore if not found
    });
  }

  /**
   * Hapus semua entry yang sudah expired.
   * Bisa dipanggil periodic (cron job) atau manual.
   */
  async deleteExpired(): Promise<number> {
    const result = await this.prisma.apiCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}