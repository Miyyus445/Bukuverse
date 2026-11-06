# Plan: Setup Database Neon & Prisma

**Task Jira:** SCRUM-13 (Setup Database Neon & Prisma)
**Referensi PRD:** Section 5 (In-Scope) & Section 7 (NFR - Keamanan Env)
**Referensi Blueprint:** Section 6 (Database)

## 🎯 Tujuan
Menghubungkan backend NestJS ke database PostgreSQL (Neon) menggunakan Prisma ORM. Membuat skema awal untuk tabel `ApiCache` dan `CuratedAuthor`, serta menjalankan migrasi database.

## 🛠️ Langkah-langkah Eksekusi

1. **Persiapan Manual (Pemilik Proyek):**
   - **PENTING:** Langkah ini harus dilakukan manual oleh user (bukan AI).
   - Buat akun di [Neon.tech](https://neon.tech/) dan buat project baru bernama `bukuverse`.
   - Ambil connection string (Pooled & Direct).
   - Buat file `.env` di root folder `apps/api/` dan isi `DATABASE_URL` serta `DIRECT_URL`.

2. **Inisialisasi Prisma di `apps/api`**
   - Masuk ke folder `apps/api`.
   - Install dependency: `bun add prisma -d` dan `bun add @prisma/client`.
   - Jalankan `bunx prisma init`.
   - Pastikan folder `prisma/schema.prisma` terbentuk.

3. **Setup Skema Database (`schema.prisma`)**
   - Ubah provider jadi `postgresql`.
   - Buat model `ApiCache` dengan field: `key` (String, @id), `payload` (Json), `expiresAt` (DateTime).
   - Buat model `CuratedAuthor` dengan field: `id` (String, @id, @default(uuid())), `name` (String), `order` (Int).

4. **Update `schema.prisma` untuk dual URL**
   - Tambahkan konfigurasi `directUrl = env("DIRECT_URL")` di dalam blok `datasource db`.

5. **Jalankan Migrasi**
   - Jalankan `bunx prisma db push` (atau `prisma migrate dev --name init` jika pakai migration).
   - Pastikan tabel terbuat di Neon tanpa error.

6. **Setup Prisma Client di NestJS**
   - Buat file `apps/api/src/prisma/prisma.service.ts` yang mewarisi `PrismaClient` dan implement `OnModuleInit`.
   - Daftarkan `PrismaService` sebagai provider di `AppModule`.

## ✅ Kriteria Selesai (Definition of Done)
- [ ] File `.env` berisi `DATABASE_URL` & `DIRECT_URL` (tidak di-commit ke Git).
- [ ] File `schema.prisma` berisi model `ApiCache` dan `CuratedAuthor`.
- [ ] Tabel berhasil dibuat di Neon (bisa dicek via Prisma Studio atau dashboard Neon).
- [ ] `PrismaService` terdaftar di `AppModule` dan tidak error saat aplikasi jalan.