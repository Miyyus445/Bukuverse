# Architecture: Bukuverse

|                  |                                                                  |
| ---------------- | ---------------------------------------------------------------- |
| **Versi**        | 1.0                                                              |
| **Tanggal**      | 04 November 2026                                                 |
| **Status**       | Draft untuk review mentor                                        |
| **Sumber acuan** | `PRD_FINAL.md` v5.0 (kebutuhan), `BLUEPRINT.md` (rencana teknis) |

> Dokumen ini menjelaskan bagaimana sistem Bukuverse disusun dan alasan di balik keputusan teknisnya. Jika ada perbedaan dengan `BLUEPRINT.md`, `BLUEPRINT.md` yang berlaku, lalu dokumen ini diperbarui.

---

## 1. Tujuan Dokumen

Memberi gambaran teknis yang jelas bagi mentor dan pengembang tentang komponen sistem, alur data, struktur kode, model data, deployment, dan keputusan arsitektur.

## 2. Gambaran Umum

Bukuverse adalah web katalog buku. Data buku berasal dari **Google Books API**. Aplikasi terdiri dari frontend (tampilan), backend (perantara dan cache), dan database (penyimpan cache serta daftar kurasi). Semua berada dalam satu monorepo.

## 3. Diagram Arsitektur

```
                ┌───────────────────────────┐
   Browser ───► │  Next.js Frontend (web)   │   Vercel project 1
                └─────────────┬─────────────┘
                              │ HTTPS (JSON)
                              ▼
                ┌───────────────────────────┐        ┌────────────────────────┐
                │  NestJS API (api)         │ ◄────► │ Neon PostgreSQL        │
                │  proxy + cache + validasi │ Prisma │ ApiCache, CuratedAuthor│
                └─────────────┬─────────────┘        └────────────────────────┘
                              │ HTTPS
   Vercel project 2           ▼
                ┌───────────────────────────┐
                │  Google Books API         │
                └───────────────────────────┘
```

## 4. Komponen

### 4.1 Frontend (`apps/web`)

- **Teknologi:** Next.js (App Router), Tailwind CSS, TypeScript.
- **Tanggung jawab:** menampilkan halaman, mengelola state URL (`q`, `lang`, `page`), menampilkan loading/error/kosong, mengatur layout responsif (mobile-first).
- **Tidak boleh:** memanggil Google Books langsung, menyimpan rahasia.

| Rute                     | Fungsi                                            |
| ------------------------ | ------------------------------------------------- |
| `/`                      | Hero, search bar, section Karya Indonesia Ternama |
| `/search?q=&lang=&page=` | Grid hasil, filter bahasa, pagination             |
| `/books/[id]`            | Detail buku                                       |

### 4.2 Backend (`apps/api`)

- **Teknologi:** NestJS, TypeScript, Prisma.
- **Tanggung jawab:**
  1. Menerima request dari frontend dan **memvalidasi** parameter
  2. Memeriksa **cache** di database
  3. Memanggil Google Books bila cache tidak ada
  4. **Menormalisasi** data ke bentuk `Book`
  5. Menyimpan hasil ke cache dan mengembalikannya
- **Struktur modul:** `BooksModule` (controller, service), `CacheModule` (akses `ApiCache`), `CuratedModule` (akses `CuratedAuthor`), `PrismaModule`.

### 4.3 Database (Neon PostgreSQL)

Menyimpan dua hal saja: cache respons Google Books dan daftar penulis kurasi. Tidak ada data user pada MVP.

### 4.4 Paket bersama (`packages/shared`)

Tipe TypeScript yang dipakai bersama (misalnya tipe `Book`, `SearchResponse`) agar frontend dan backend selalu sepakat soal bentuk data.

## 5. Struktur Monorepo

```
bukuverse/
├── apps/
│   ├── web/          # Next.js
│   └── api/          # NestJS
├── packages/
│   └── shared/       # tipe TypeScript bersama
├── .env.example
├── turbo.json
├── BLUEPRINT.md
├── AI_AGENT.md
└── Architecture.md
```

Pengelola monorepo: **Turborepo**. Package manager: **Bun**.

## 6. Alur Data

### 6.1 Pencarian

1. User mengetik keyword, frontend memanggil `GET /books/search?q=&lang=&page=`.
2. Backend memvalidasi parameter (tolak jika tidak valid dengan `400`).
3. Backend membentuk **cache key** dari keyword yang sudah dinormalisasi (huruf kecil, spasi dirapikan), `lang`, dan `page`.
4. **Cache hit** (belum kedaluwarsa): kembalikan data dari database.
5. **Cache miss:** panggil Google Books (`startIndex`, `maxResults=12`), normalisasi hasil, simpan ke cache, kembalikan.
6. Frontend menampilkan grid.

### 6.2 Detail buku

Sama seperti pencarian, dengan endpoint `GET /books/:id`. Jika Google Books mengembalikan 404, backend membalas `404`.

### 6.3 Karya Indonesia Ternama

1. Backend membaca daftar penulis dari tabel `CuratedAuthor` (urut `order`).
2. Untuk tiap penulis, backend mengambil buku dengan query `inauthor:"<nama>"`.
3. Hasil digabung menjadi satu daftar dan di-cache.

## 7. Strategi Cache

| Data            | Cache key (contoh)         | Masa berlaku |
| --------------- | -------------------------- | ------------ |
| Hasil pencarian | `search:{q}:{lang}:{page}` | 24 jam       |
| Detail buku     | `book:{id}`                | 7 hari       |
| Daftar kurasi   | `curated`                  | 24 jam       |

Aturan tambahan:

- Cache disimpan di tabel PostgreSQL, **tanpa Redis** (cukup untuk skala MVP, lebih sedikit komponen).
- Jika Google Books gagal tetapi ada cache lama, backend boleh memakai cache lama.
- Jika database tidak bisa dihubungi, backend tetap melayani langsung dari Google Books (tanpa cache).

## 8. Model Data (Prisma, rancangan)

```prisma
model ApiCache {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  payload   Json
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model CuratedAuthor {
  id    Int    @id @default(autoincrement())
  name  String @unique
  order Int
}
```

Seed awal `CuratedAuthor`: Pramoedya Ananta Toer, Tere Liye, Andrea Hirata, Eka Kurniawan, Dee Lestari, Leila S. Chudori.

## 9. Kontrak API

| Endpoint             | Parameter                                                              | Respons sukses                             |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `GET /books/search`  | `q` (wajib, maks 100 karakter), `lang` (`id`/`en`), `page` (default 1) | `{ items: Book[], total, page, pageSize }` |
| `GET /books/:id`     | `id`                                                                   | `Book`                                     |
| `GET /books/curated` | -                                                                      | `{ items: Book[] }`                        |

Bentuk `Book` (dinormalisasi oleh backend):

```
{ id, title, authors[], publisher, publishedYear, description,
  thumbnail, language, previewLink }
```

Semua field selain `id` dan `title` boleh `null`.

| Kode  | Arti                         |
| ----- | ---------------------------- |
| `400` | Parameter tidak valid        |
| `404` | Buku tidak ditemukan         |
| `429` | Rate limit                   |
| `502` | Google Books gagal dihubungi |

## 10. Arsitektur Deployment

| Komponen | Platform                                  | Catatan                                                                                                    |
| -------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Frontend | Vercel (Free), project 1, root `apps/web` |                                                                                                            |
| Backend  | Vercel (Free), project 2, root `apps/api` | Berjalan sebagai serverless function; butuh entry point serverless (detail ditentukan saat deploy hari 19) |
| Database | Neon (Free Tier)                          | Branch `dev` untuk development, branch `main` untuk production                                             |

Jadwal: hari 1-4 hanya menyiapkan konfigurasi env production tanpa deploy; setup Neon production dan deploy Vercel dilakukan di hari 19-20.

### Environment variables

| Variabel               | Dipakai di | Keterangan                                 |
| ---------------------- | ---------- | ------------------------------------------ |
| `DATABASE_URL`         | api        | Koneksi pooled Neon                        |
| `DIRECT_URL`           | api        | Koneksi langsung Neon untuk migrasi Prisma |
| `GOOGLE_BOOKS_API_KEY` | api        | Opsional; diisi hanya jika kena limit      |
| `FRONTEND_ORIGIN`      | api        | Untuk pengaturan CORS                      |
| `API_BASE_URL`         | web        | Alamat backend                             |

Nilai development dan production dipisah. Berkas `.env` tidak boleh di-commit; sediakan `.env.example`.

## 11. Keamanan

- Google Books hanya dipanggil dari backend.
- API key (jika dipakai) hanya di Environment Variables backend; tidak pernah di frontend dan tidak memakai awalan `NEXT_PUBLIC_`.
- CORS: backend hanya mengizinkan origin frontend.
- Semua input divalidasi di backend.
- Sinopsis dari Google dibersihkan dari HTML sebelum ditampilkan.
- Tidak ada secret di repository.

## 12. Ketahanan (Resilience)

| Situasi                   | Penanganan                                                            |
| ------------------------- | --------------------------------------------------------------------- |
| Google Books lambat/gagal | Pakai cache lama bila ada; jika tidak, pesan error + tombol coba lagi |
| Rate limit                | Pesan "Layanan sedang sibuk"; daftar API key bila perlu               |
| Neon cold start           | Request pertama lebih lambat; frontend menampilkan loading            |
| Database tidak tersedia   | Langsung ke Google Books tanpa cache                                  |
| Cover kosong/rusak        | Placeholder; `http://` diubah ke `https://`                           |

## 13. Keputusan Arsitektur

| Keputusan                                | Alasan                                                                  | Alternatif yang ditolak                                                |
| ---------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Monorepo Turborepo + Bun                 | Satu repo untuk frontend, backend, dan tipe bersama; mudah dikembangkan | Dua repo terpisah (sinkronisasi tipe lebih repot)                      |
| Backend NestJS sebagai proxy             | Menyembunyikan API key, tempat cache dan normalisasi data               | Frontend memanggil Google langsung (rahasia terekspos, tanpa cache)    |
| Cache di PostgreSQL                      | Sudah ada database; tanpa tambahan service                              | Redis (komponen tambahan, belum dibutuhkan di MVP)                     |
| Neon untuk database                      | Gratis, tanpa instalasi lokal, bisa dipakai dev dan production          | PostgreSQL + Docker lokal (tidak bisa dipakai untuk production publik) |
| Vercel untuk hosting                     | Gratis, terhubung ke Git, cocok untuk Next.js                           | VPS (butuh setup dan perawatan server)                                 |
| Data `Book` dinormalisasi di backend     | Frontend tidak bergantung pada format mentah Google                     | Meneruskan respons mentah                                              |
| Kurasi disimpan di tabel `CuratedAuthor` | Daftar bisa diubah tanpa deploy ulang                                   | Hardcode di kode                                                       |

## 14. Batasan dan Risiko Teknis

- Google Books maksimal 40 hasil per request.
- Tanpa API key, kuota harian terbatas.
- Free Plan Vercel dan Free Tier Neon memiliki batasan; Neon bisa "tidur" saat sepi.
- NestJS serverless di Vercel perlu diuji lebih awal (durasi eksekusi, koneksi database). Rencana cadangan: pindah host backend.
- Kualitas data mengikuti Google Books (cover/sinopsis bisa kosong).

## 15. Pengembangan Lanjutan (Fase 2 dan seterusnya)

Filter kategori, sorting, tombol bagikan, autentikasi, simulasi pinjam, dark mode. Penambahan autentikasi akan menambah tabel `User` pada database dan modul baru di backend tanpa mengubah alur pencarian.
