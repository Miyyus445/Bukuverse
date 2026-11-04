# BLUEPRINT: Bukuverse

Web katalog buku berbasis Google Books API. Fokus: pencarian cepat, tampilan bersih, dan kurasi buku karya penulis Indonesia.

> Dokumen ini adalah sumber kebenaran proyek. Kalau ada konflik dengan PRD atau chat AI, BLUEPRINT ini yang menang. Update file ini setiap ada keputusan baru.

## 1. Tujuan MVP

- Cari buku (judul, penulis, ISBN)
- Filter bahasa (kategori masuk di fase 2)
- Halaman detail buku
- Section "Karya Indonesia Ternama" di homepage
- Mobile-first, responsif

**Di luar MVP:** login/register, pinjam buku, dashboard admin, denda.

## 2. Tech Stack

| Bagian   | Teknologi                                                           |
| -------- | ------------------------------------------------------------------- |
| Monorepo | Turborepo + Bun                                                     |
| Frontend | Next.js (App Router) + Tailwind CSS + TypeScript                    |
| Backend  | NestJS (proxy ke Google Books API)                                  |
| Database | Neon (serverless PostgreSQL, Free Tier) + Prisma ORM                |
| Hosting  | Vercel (Free Plan): frontend dan backend sebagai 2 project terpisah |

**Keputusan:**

- Tidak pakai Redis. Cache disimpan di tabel PostgreSQL (Neon).
- Tidak pakai Docker/PostgreSQL lokal. Development dan production sama-sama di Neon, dipisah branch (`dev` dan `main`).
- Prisma pakai dua URL: `DATABASE_URL` (pooled) dan `DIRECT_URL` (untuk migrasi).
- Tanpa API key Google Books dulu. Kalau kena limit, daftar key dan simpan di Environment Variables Vercel (backend) + `.env` lokal. Jangan pernah di frontend.

## 3. Struktur Monorepo

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
└── AI_AGENT.md
```

## 4. Alur Data

User -> Next.js (`web`) -> NestJS (`api`) -> cek cache DB -> (kalau miss) Google Books API -> simpan cache -> balikin ke frontend.

Google Books hanya dipanggil dari backend. Frontend tidak pernah akses langsung.

## 5. Endpoint Backend

| Method | Path                           | Fungsi                           |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/books/search?q=&lang=&page=` | Cari buku, ada pagination        |
| GET    | `/books/:id`                   | Detail buku                      |
| GET    | `/books/curated`               | Daftar "Karya Indonesia Ternama" |

Catatan: Google Books maksimal 40 hasil per request. Pakai `startIndex` + `maxResults` untuk pagination (default 12 per halaman).

## 6. Database (Prisma)

Dua fungsi saja, jelas:

1. **ApiCache**: `key` (unik), `payload` (JSON), `expiresAt`
2. **CuratedAuthor**: `id`, `name`, `order`

Seed awal CuratedAuthor: Pramoedya Ananta Toer, Tere Liye, Andrea Hirata, Eka Kurniawan, Dee Lestari, Leila S. Chudori.
Backend mengambil buku tiap penulis lewat query `inauthor:"<nama>"`.

## 7. Halaman Frontend

- `/` : hero + search bar + section Karya Indonesia Ternama
- `/search?q=&lang=&page=` : grid hasil + filter bahasa + pagination
- `/books/[id]` : cover, judul, penulis, penerbit, tahun, sinopsis, tombol "Baca di Google Books"

Grid: 1 kolom (HP), 2 (tablet), 3-4 (desktop). Cover kosong/rusak pakai placeholder.

## 8. Non-Functional

- Load halaman target < 3 detik (dibantu cache)
- UI minimalis, fokus cover buku
- Handle state: loading, kosong, error

## 9. Timeline (30 hari, dengan buffer)

**Fase 1: MVP (hari 1-20)**

- Hari 1-4: Setup monorepo, Next, Nest, Prisma, project Neon (branch `dev`), siapkan konfigurasi env production. Belum deploy. (buffer 1 hari untuk error config di Windows)
- Hari 5-8: Backend: search, detail, curated, cache + test sederhana
- Hari 9-14: Frontend: home, search, detail + sambung ke API
- Hari 15-18: Desain polish + responsif
- Hari 19-20: Testing MVP + setup Neon production (branch `main`) + deploy ke Vercel (frontend + backend) + smoke test di URL production

**Fase 2: Bugfix & tambahan (hari 21-30)**

- Hari 21-25: Bugfix
- Hari 26-28: Filter kategori, lalu auth + "simulasi pinjam" kalau sempat
- Hari 29-30: Polish final + dokumentasi

## 10. Risiko

| Risiko                                                          | Mitigasi                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Rate limit Google Books                                         | Cache di DB, pakai API key kalau perlu                                                  |
| Timeline mepet                                                  | Fokus core: search, detail, responsif                                                   |
| Data buku jelek (cover pecah, data kosong)                      | Placeholder + filter data minimal                                                       |
| Setup di Windows ribet                                          | Buffer waktu; tidak butuh Docker karena DB di Neon                                      |
| Neon cold start bikin request pertama lambat                    | Loading state jelas, ukur saat testing                                                  |
| NestJS serverless di Vercel Free bermasalah (durasi/koneksi DB) | Pakai koneksi pooled, uji deploy awal di hari 19, siapkan rencana cadangan host backend |
| Dev dan production bentrok di Neon                              | Pisahkan branch + env                                                                   |
| Kuota model gratis OpenCode habis                               | Kerjain per task kecil, simpan progres di file                                          |

## 11. Pembagian Peran

| Area            | Siapa                              |
| --------------- | ---------------------------------- |
| Pusat project   | DeepSeek                           |
| PRD             | Claude x Gemini x DeepSeek         |
| Design          | Gemini x Claude x Stitch           |
| Coding / prompt | DeepSeek                           |
| Fix bug         | DeepSeek x Copilot x Claude        |
| Responsif       | Claude x Gemini                    |
| AI Agent        | OpenCode (aturan di `AI_AGENT.md`) |

## 12. Status

- [x] PRD v5.0 (Approved, file `PRD_FINAL.md`)
- [x] BLUEPRINT.md
- [x] AI_AGENT.md
- [x] Setup monorepo
- [ ] Backend
- [ ] Frontend
- [ ] Responsif
- [ ] Testing
- [ ] Deploy Vercel + Neon production
