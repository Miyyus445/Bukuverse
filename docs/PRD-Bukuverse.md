# PRD: Bukuverse

| | |
|---|---|
| **Versi** | 4.0 (Final, gabungan Claude + Gemini + DeepSeek) |
| **Tanggal** | 04 November 2026 |
| **Status** | Siap direview (belum disetujui) |
| **Dokumen terkait** | `BLUEPRINT.md` (rencana teknis & pembagian peran), `AI_AGENT.md` (aturan AI agent) |

---

## 1. Ringkasan
Bukuverse adalah web katalog buku yang ringan, cepat, dan mobile-first. User bisa mencari buku, memfilter berdasarkan bahasa, melihat detail, lalu lanjut ke Google Books. Homepage punya section khusus karya penulis Indonesia.

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
- Database: PostgreSQL + Prisma (cache + `CuratedAuthor`)
- Fitur: search (judul/penulis/ISBN) + pagination, filter bahasa, detail buku, section Karya Indonesia Ternama

### Fase 2 (hari 21-30)
- **Should have:** filter kategori/subject, sorting (relevansi, terbaru)
- **Could have:** auth sederhana, "Simulasi Pinjam", dark mode

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
- Keyword ikut ke URL (`/search?q=...`) sehingga bisa dibagikan.

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
| Performa | Target < 3 detik. Cache search 24 jam, detail 7 hari, kurasi 24 jam. |
| Keamanan | Google Books hanya dipanggil dari backend. API key hanya di `.env` backend. `.env` tidak boleh di-commit. |
| Validasi | Backend memvalidasi semua query (panjang keyword, `lang` hanya `id`/`en`, `page` angka positif). |
| Aksesibilitas | Teks `alt` di setiap cover, kontras warna cukup, bisa dipakai dengan keyboard. |
| Bahasa UI | Indonesia. |
| Browser | Chrome, Edge, Firefox, Safari versi terbaru; Chrome Android dan Safari iOS. |

## 8. Arsitektur dan Alur Data
```
[ Next.js Frontend ]
        │  HTTP
        ▼
[ NestJS API ] ◄──► [ PostgreSQL / Prisma ]
        │              (ApiCache, CuratedAuthor)
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
| Database mati | Backend tetap melayani langsung dari Google Books (tanpa cache) |

## 12. Rencana Pengujian
- **Unit test backend:** normalisasi data `Book`, logika cache (hit, miss, expired), validasi parameter
- **Manual test frontend:** semua user story di HP (360px), tablet, desktop
- **Skenario gagal:** matikan internet, matikan DB, keyword aneh, ID ngawur
- **End-to-end (hari 19-20):** jalankan alur utama dari awal sampai akhir

## 13. Timeline
Detail di `BLUEPRINT.md` bagian 9.
- **Hari 1-4:** setup monorepo (ada buffer untuk masalah config Windows)
- **Hari 5-8:** backend (search, detail, curated, cache, test)
- **Hari 9-14:** frontend + sambung API
- **Hari 15-18:** desain polish + responsif
- **Hari 19-20:** testing end-to-end
- **Hari 21-25:** bugfix
- **Hari 26-28:** fitur Fase 2
- **Hari 29-30:** polish final + dokumentasi

## 14. Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Rate limit Google Books | Hasil gagal | Cache di DB, pakai API key bila perlu |
| Data buku jelek | Tampilan berantakan | Placeholder, fallback teks, sanitize |
| Timeline mepet | MVP telat | Pegang prioritas Must; tunda Should/Could |
| Setup Windows bermasalah | Hari awal terbuang | Buffer 1 hari, Docker hanya untuk PostgreSQL |
| Kuota AI gratis habis | Progres lambat | Task kecil per sesi, progres dicatat di `BLUEPRINT.md` |
| Output AI saling bertabrakan | Kode tidak konsisten | `BLUEPRINT.md` jadi acuan tunggal, aturan di `AI_AGENT.md` |

## 15. Asumsi dan Batasan
- Data 100% dari Google Books API; kualitasnya mengikuti sumber.
- Google Books maksimal 40 hasil per request.
- Tanpa API key, kuota harian terbatas.
- Dikerjakan satu orang dibantu AI, jadi scope sengaja kecil.

## 16. Pertanyaan Terbuka
- Pakai API key Google Books dari awal, atau tunggu sampai kena limit?
- Hosting final: cukup lokal/staging, atau deploy ke publik (mis. Vercel + VPS)?
- Perlu tombol "Bagikan" di halaman detail?

## 17. Definisi Selesai (MVP)
- Semua user story Must lolos kriteria penerimaan
- Berjalan baik di HP dan desktop
- Tidak ada error di console pada alur utama
- Edge case di bagian 11 sudah ditangani
- `BLUEPRINT.md` dan README sudah diperbarui
- Bisa dijalankan dari nol dengan `bun install`, `docker compose up -d`, lalu `bun dev`
