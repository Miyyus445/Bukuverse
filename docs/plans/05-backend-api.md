# Plan: Backend API (Search, Detail, Curated) & Cache

**Task Jira:** SCRUM-14 (Backend API)
**Referensi PRD:** Section 5 (In-Scope) & Section 9 (Kontrak API)
**Referensi Blueprint:** Section 5 (Endpoint Backend) & Section 6 (Database)

## 🎯 Tujuan
Membuat endpoint API di NestJS untuk mencari buku, melihat detail, dan mengambil daftar penulis kurasi. Mengintegrasikan Google Books API dan menerapkan sistem caching menggunakan PostgreSQL (Neon) via Prisma.

## 🛠️ Langkah-langkah Eksekusi

1. **Setup Environment & Google Books Service**
   - Buat module `BooksModule`.
   - Buat `GoogleBooksService` untuk memanggil API `https://www.googleapis.com/books/v1/volumes`.
   - Buat fungsi untuk normalisasi response Google Books agar sesuai dengan tipe `Book` di kontrak API (id, title, authors, publisher, publishedYear, description, thumbnail, language, previewLink).

2. **Implementasi Cache Logic**
   - Buat `CacheService` yang menggunakan `PrismaService` (tabel `ApiCache`).
   - Fungsi: `get(key)`, `set(key, payload, ttl)`, `deleteExpired()`.

3. **Implementasi Endpoint Search (`GET /books/search`)**
   - Terima query `q` (wajib), `lang` (opsional), `page` (default 1).
   - Cek cache di DB. Jika ada dan belum expired, kembalikan data cache.
   - Jika tidak ada, panggil Google Books API (pakai `startIndex` & `maxResults` untuk pagination), simpan ke cache (TTL 24 jam), lalu kembalikan.

4. **Implementasi Endpoint Detail (`GET /books/:id`)**
   - Terima parameter `id`.
   - Cek cache. Jika tidak ada, panggil Google Books API (`/volumes/:id`), simpan ke cache (TTL 7 hari).

5. **Implementasi Endpoint Curated (`GET /books/curated`)**
   - Ambil data `CuratedAuthor` dari database.
   - Untuk tiap penulis, panggil Google Books API dengan query `inauthor:"<nama>"`.
   - Kembalikan list buku (bisa ambil 1-2 buku teratas per penulis).

6. **Validasi & Error Handling**
   - Buat `ValidationPipe` global atau DTO untuk validasi query.
   - Handle error jika Google Books API timeout atau limit (kembalikan status 429/502).

## ✅ Kriteria Selesai (Definition of Done)
- [ ] Endpoint `/books/search` berfungsi dan mengembalikan data ter-normalisasi.
- [ ] Endpoint `/books/:id` berfungsi.
- [ ] Endpoint `/books/curated` berfungsi.
- [ ] Cache berfungsi (request kedua ke endpoint yang sama jauh lebih cepat dan ga nembak Google Books lagi).
- [ ] `bun run build` dan `bun run lint` pass.