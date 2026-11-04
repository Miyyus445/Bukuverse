# PRD: Bukuverse

| | |
|---|---|
| **Versi** | 5.0 (Final, gabungan Claude + Gemini + DeepSeek) |
| **Tanggal** | 04 November 2026 |
| **Status** | **Approved** (review Claude, 04 Nov 2026), dengan catatan risiko di bagian 14 |
| **Dokumen terkait** | `BLUEPRINT.md` (rencana teknis & pembagian peran), `AI_AGENT.md` (aturan AI agent) |

> Catatan persetujuan: status Approved ini berasal dari review Claude sebagai reviewer AI. Keputusan akhir tetap di pemilik proyek (dan mentor bila diperlukan).

---

## 1. Ringkasan
Bukuverse adalah web katalog buku yang ringan, cepat, dan mobile-first. User bisa mencari buku, memfilter berdasarkan bahasa, melihat detail, lalu lanjut ke Google Books. Homepage punya section khusus karya penulis Indonesia. MVP akan dipublikasikan ke publik lewat Vercel dengan database Neon.

## 2. Masalah yang Diselesaikan
- Mencari buku di Google Books langsung terasa ramai, dan karya Indonesia sulit ditemukan.
- Pelajar dan mahasiswa butuh pencarian referensi yang cepat dan bersih, terutama dari HP.

## 3. Tujuan dan Metrik Sukses
| # | Tujuan | Metrik | Cara ukur |
|---|---|---|---|
| G1 | Pencarian cepat | Hasil tampil < 3 detik; cache hit < 1 detik | Network tab / log backend |
| G2 | Nyaman di HP | Semua halaman rapi di 360px, tanpa scroll horizontal | Cek manual + DevTools |
| G3 | Karya Indonesia mudah ditemukan | Section kurasi tampil di homepage, min. 12 buku | Cek manual |
| G4 | Tahan gangguan | Tidak ada halaman blank saat API gagal; selalu ada pesan error + opsi coba lagi | Test skenario error |
| G5 | Bisa diakses publik | Web live di URL Vercel dan alur utama jalan di production | Smoke test di URL production |

**Bukan tujuan MVP:** login, pinjam buku, dashboard admin, rekomendasi personal.

## 4. Target User
1. **Pelajar/Mahasiswa**: cari referensi cepat via judul, penulis, ISBN; filter bahasa.
2. **Pembaca umum**: jelajah buku populer, baca sinopsis, buka tautan pratinjau.
3. *(Fase lanjut)* **Pustakawan/Admin**: kelola ketersediaan buku.

## 5. Scope

### In-Scope (MVP, hari 1-20)
- Monorepo Turborepo + Bun
- Frontend: Next.js (App Router) + Tailwind CSS, mobile-first
- Backend: NestJS sebagai proxy + caching untuk Google Books API
- Database: **Neon** (serverless PostgreSQL, Free Tier) + Prisma. Dipakai untuk development dan production, dipisah per branch Neon (`dev` dan `main`). Isi: cache + `CuratedAuthor`.
- **Deployment:** **Vercel (Free Plan)**. Frontend dan backend dideploy sebagai dua project Vercel terpisah dari satu monorepo Turborepo.
- Fitur: search (judul/penulis/ISBN) + pagination, filter bahasa, detail buku, section Karya Indonesia Ternama

### Fase 2 (hari 21-30)
- **Should have:** filter kategori/subject, sorting (relevansi, terbaru)
- **Could have:** tombol Bagikan (share) di halaman detail, auth sederhana, "Simulasi Pinjam", dark mode

### Out-of-Scope
Peminjaman sungguhan, denda, dashboard admin, rekomendasi personal.

## 6. User Story dan Kriteria Penerimaan

### US-1 Cari buku (Must)
Sebagai user, saya ingin mencari buku lewat judul, penulis, atau ISBN.
- Search bar ada di homepage dan header halaman hasil.
- Input kosong/spasi saja tidak memicu request.
- Hasil tampil dalam grid; tiap kartu berisi cover, judul, penulis.
- Pagination 12 buku per halaman.
- Tidak ada hasil: tampil "Buku tidak ditemukan" + saran ubah kata kunci.
- Keyword ikut ke URL (`/search?q=...`) sehingga bisa dibagikan lewat salin URL.

### US-2 Filter bahasa (Must)
Sebagai user, saya ingin memfilter hasil menurut bahasa.
- Opsi: Semua, Indonesia, English.
- Ganti filter memperbarui URL (`?lang=id|en`) tanpa reload penuh.
- Ganti filter mengembalikan ke halaman 1.

### US-3 Detail buku (Must)
Sebagai user, saya ingin melihat info lengkap sebuah buku.
- Tampil: cover, judul, penulis, penerbit, tahun terbit, sinopsis.
- Data kosong tampil sebagai "Tidak tersedia".
- Tombol "Baca di Google Books" membuka `previewLink` di tab baru; disembunyikan bila tautan tidak ada.
- ID buku tidak valid: tampil halaman "Buku tidak ditemukan" (bukan crash).

### US-4 Karya Indonesia Ternama (Must)
Sebagai user, saya ingin melihat rekomendasi karya penulis Indonesia di homepage.
- Tampil tanpa perlu mencari.
- Daftar penulis berasal dari tabel `CuratedAuthor`, bukan hardcode.
- Penulis awal: Pramoedya Ananta Toer, Tere Liye, Andrea Hirata, Eka Kurniawan, Dee Lestari, Leila S. Chudori.
- Klik buku membuka halaman detail.

### US-5 Responsif (Must)
Sebagai user HP, saya ingin tampilan yang nyaman.
- Grid: 1 kolom (HP), 2 (tablet), 3-4 (desktop).
- Elemen interaktif minimal 44x44px.
- Tidak ada scroll horizontal di 360px.

### US-6 Kondisi khusus (Must)
- **Loading:** skeleton/spinner.
- **Error API:** pesan ramah + tombol "Coba lagi".
- **Cover kosong/rusak:** placeholder.
- **Rate limit tercapai:** tampil pesan "Layanan sedang sibuk, coba beberapa saat lagi" (atau data dari cache bila ada).

## 7. Kebutuhan Non-Fungsional
| Area | Kebutuhan |
|---|---|
| Performa | Target < 3 detik. Cache search 24 jam, detail 7 hari, kurasi 24 jam. Request pertama setelah database Neon "tidur" boleh lebih lambat; frontend wajib menampilkan loading state. |
| Keamanan | Google Books hanya dipanggil dari backend. **API key Google Books (bila dipakai) hanya disimpan di Environment Variables project backend di Vercel**, tidak pernah di frontend (jangan pakai awalan `NEXT_PUBLIC_`) dan tidak boleh di-commit. Saat development lokal, disimpan di `.env` backend. |
| Environment | Variabel wajib: `DATABASE_URL` (koneksi pooled Neon), `DIRECT_URL` (koneksi langsung untuk migrasi Prisma), `GOOGLE_BOOKS_API_KEY` (opsional, diisi saat kena limit), alamat backend untuk frontend, dan origin frontend untuk CORS. Sediakan `.env.example`. Nilai production dan development dipisah. |
| CORS | Backend hanya mengizinkan origin frontend (lokal dan production). |
| Validasi | Backend memvalidasi semua query (panjang keyword, `lang` hanya `id`/`en`, `page` angka positif). |
| Aksesibilitas | Teks `alt` di setiap cover, kontras warna cukup, bisa dipakai dengan keyboard. |
| Bahasa UI | Indonesia. |
| Browser | Chrome, Edge, Firefox, Safari versi terbaru; Chrome Android dan Safari iOS. |

## 8. Arsitektur dan Alur Data
```
[ Next.js Frontend  (Vercel project 1) ]
        │  HTTP
        ▼
[ NestJS API        (Vercel project 2) ] ◄──► [ Neon PostgreSQL / Prisma ]
        │                                        (ApiCache, CuratedAuthor)
        ▼
[ Google Books API ]
```
Alur search: frontend memanggil NestJS, NestJS cek cache. Kalau ada dan belum kedaluwarsa, langsung dikembalikan. Kalau tidak, NestJS memanggil Google Books, menyimpan hasil ke cache, lalu mengembalikannya. Detail teknis ada di `BLUEPRINT.md`.

## 9. Kontrak API (ringkas)
| Endpoint | Parameter | Respons |
|---|---|---|
| `GET /books/search` | `q` (wajib), `lang` (`id`/`en`, opsional), `page` (default 1) | `{ items: Book[], total, page, pageSize }` |
| `GET /books/:id` | `id` | `Book` atau 404 |
| `GET /books/curated` | - | `{ items: Book[] }` |

Bentuk `Book` (dinormalisasi oleh backend, frontend tidak melihat format mentah Google):
```
{ id, title, authors[], publisher, publishedYear, description,
  thumbnail, language, previewLink }
```
Semua field selain `id` dan `title` boleh `null`.

Kode error: `400` (parameter salah), `404` (tidak ditemukan), `429` (rate limit), `502` (Google Books gagal).

## 10. Model Data
- **ApiCache:** `key` (unik), `payload` (JSON), `expiresAt`
- **CuratedAuthor:** `id`, `name`, `order`

Tidak ada data user di MVP.

## 11. Edge Case yang Wajib Ditangani
| Kasus | Perilaku |
|---|---|
| Keyword sangat panjang | Dipotong/ditolak (400), maks 100 karakter |
| Karakter spesial di keyword | Di-encode benar, tidak membuat error |
| `page` melebihi total | Tampil "tidak ada hasil", bukan error |
| Buku tanpa penulis/penerbit/sinopsis | Tampil "Tidak tersedia" |
| Sinopsis mengandung HTML dari Google | Dibersihkan (sanitize) sebelum ditampilkan |
| Cover berupa `http://` | Diubah ke `https://` |
| Google Books timeout | Pakai cache lama bila ada, kalau tidak tampil pesan error |
| Database (Neon) tidak bisa dihubungi | Backend tetap melayani langsung dari Google Books (tanpa cache) |
| Database Neon baru "bangun" (cold start) | Request pertama lambat; frontend menampilkan loading, tidak error |

## 12. Rencana Pengujian
- **Unit test backend:** normalisasi data `Book`, logika cache (hit, miss, expired), validasi parameter
- **Manual test frontend:** semua user story di HP (360px), tablet, desktop
- **Skenario gagal:** matikan internet, putuskan database, keyword aneh, ID ngawur
- **End-to-end lokal (hari 19-20):** jalankan alur utama dari awal sampai akhir
- **Smoke test production (hari 19-20):** setelah deploy, uji search, filter, detail, dan section kurasi di URL Vercel, termasuk dari HP

## 13. Timeline
Detail di `BLUEPRINT.md` bagian 9.
- **Hari 1-4:** setup monorepo, buat project Neon (branch `dev`), siapkan konfigurasi env production. **Belum deploy.** (ada buffer untuk masalah config Windows)
- **Hari 5-8:** backend (search, detail, curated, cache, test)
- **Hari 9-14:** frontend + sambung API
- **Hari 15-18:** desain polish + responsif
- **Hari 19-20:** **testing MVP + setup Neon production (branch `main`) + deploy ke Vercel (frontend dan backend)**
- **Hari 21-25:** bugfix
- **Hari 26-28:** fitur Fase 2
- **Hari 29-30:** polish final + dokumentasi

## 14. Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Rate limit Google Books (tanpa API key) | Hasil gagal | Cache di DB. Kalau limit tercapai, daftar API key dan simpan di Environment Variables Vercel (backend) + `.env` lokal |
| Neon cold start (database tidur saat sepi) | Request pertama lambat, bisa melewati target 3 detik | Loading state yang jelas; cache mengurangi query; ukur saat testing, bukan diasumsikan |
| Backend NestJS berjalan serverless di Vercel Free | Batas durasi eksekusi dan koneksi database bisa jadi masalah | Pakai koneksi pooled Neon; uji deploy lebih awal di hari 19; siapkan rencana cadangan (pindah host backend) bila tidak cocok |
| Development dan production memakai Neon yang sama | Data/migrasi dev bisa merusak production | Pisahkan lewat branch Neon (`dev` dan `main`) dengan env berbeda |
| Deploy baru dilakukan di hari 19-20 | Masalah deploy baru ketahuan di akhir | Env production disiapkan sejak hari 1-4; sisihkan waktu bugfix di hari 21-25 |
| Data buku jelek | Tampilan berantakan | Placeholder, fallback teks, sanitize |
| Timeline mepet | MVP telat | Pegang prioritas Must; tunda Should/Could |
| Setup Windows bermasalah | Hari awal terbuang | Buffer 1 hari; tidak butuh Docker karena database di Neon |
| Kuota AI gratis habis | Progres lambat | Task kecil per sesi, progres dicatat di `BLUEPRINT.md` |
| Output AI saling bertabrakan | Kode tidak konsisten | `BLUEPRINT.md` jadi acuan tunggal, aturan di `AI_AGENT.md` |

## 15. Asumsi dan Batasan
- Data 100% dari Google Books API; kualitasnya mengikuti sumber.
- Google Books maksimal 40 hasil per request.
- Tanpa API key, kuota harian terbatas.
- Memakai Free Plan Vercel dan Free Tier Neon, jadi tunduk pada batasan masing-masing.
- Pengembangan butuh koneksi internet karena database ada di Neon.
- Dikerjakan satu orang dibantu AI, jadi scope sengaja kecil.

## 16. Pertanyaan Terbuka: **Resolved**
| # | Pertanyaan | Keputusan | Status |
|---|---|---|---|
| 1 | API key Google Books | Tanpa API key dulu. Daftar dan pasang di Environment Variables backend hanya jika limit tercapai | Resolved |
| 2 | Hosting final | Deploy publik ke Vercel (Free), frontend dan backend terpisah dalam satu monorepo | Resolved |
| 3 | Database | Neon (serverless PostgreSQL, Free Tier) untuk development dan production via Prisma; dipisah per branch | Resolved |
| 4 | Tombol Bagikan | Tidak masuk MVP; masuk Could Have Fase 2 | Resolved |
| 5 | Waktu deploy | Setup Neon production dan deploy Vercel di hari 19-20; hari 1-4 hanya siapkan env | Resolved |

## 17. Definisi Selesai (MVP)
- Semua user story Must lolos kriteria penerimaan
- Berjalan baik di HP dan desktop
- Tidak ada error di console pada alur utama
- Edge case di bagian 11 sudah ditangani
- Web sudah live di Vercel (frontend + backend) dan smoke test production lolos
- Tidak ada secret (API key, URL database) di repository
- `BLUEPRINT.md` dan README sudah diperbarui
- Bisa dijalankan dari nol dengan `bun install`, mengisi `.env` dari `.env.example`, lalu `bun dev`
