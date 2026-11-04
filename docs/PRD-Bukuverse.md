# Product Requirements Document (PRD): Bukuverse
**Version:** 1.0 (Draft)
**Date:** 03 November 2026
**Author:** DeepSeek (Pusat Project)
**Status:** Ready for Review

## 1. Overview & Objective
**Bukuverse** adalah platform web katalog buku berbasis web yang dirancang untuk memudahkan pelajar, mahasiswa, dan masyarakat umum dalam mencari referensi literatur. 

**Tujuan Utama:**
1. Menyediakan antarmuka pencarian buku yang cepat, bersih, dan responsif.
2. Mengakomodasi kebutuhan literatur global, dengan penekanan khusus pada kurasi buku karya penulis Indonesia ternama.
3. Menjadi fondasi awal (MVP) untuk sistem perpustakaan digital di masa depan.

## 2. Target User (User Persona)
1. **Pelajar/Mahasiswa:** Butuh cari buku referensi cepat, filter berdasarkan bahasa atau penulis tertentu.
2. **Masyarakat Umum:** Butuh eksplorasi buku bacaan populer, melihat sinopsis, dan link ke penyedia buku.
3. *(Fase Selanjutnya)* **Pustakawan/Admin:** Mengelola ketersediaan buku pinjaman.

## 3. Scope of Work (MVP)
**In-Scope (Fase 20 Hari):**
- Web app responsif (Mobile-first).
- Integrasi data dari Google Books API.
- Fitur Pencarian (berdasarkan judul, penulis, ISBN).
- Filter (Bahasa, Kategori/Subject).
- Halaman Detail Buku (Cover, Sinopsis, Penerbit, Link ke Google Books).
- Kurasi "Buku Indonesia Ternama" (hardcoded query atau filter di backend).

**Out-of-Scope (Masuk Fase Bugfix/Update):**
- Autentikasi (Login/Register).
- Fitur Pinjam Buku / Keranjang.
- Dashboard Admin.
- Sistem denda atau pengembalian.
- Database lokal untuk menyimpan data user (Database saat ini difokuskan untuk *caching* atau *system state* jika diperlukan, bukan data buku utama).

## 4. Functional Requirements (FR)

### FR-1: Pencarian & Filter Katalog
- Sistem dapat menerima input *keyword* pencarian (judul/penulis).
- Sistem dapat menampilkan hasil dari Google Books API.
- **Filter Bahasa:** User bisa memfilter hasil (misal: hanya Bahasa Indonesia, atau English).
- **Filter Kategori/Subject:** (Opsional di MVP, bisa masuk fase bugfix) Filter berdasarkan kategori tertentu.

### FR-2: Highlight Katalog (Buku Indonesia Ternama)
- Halaman utama (Landing) harus menampilkan section khusus "Karya Indonesia Ternama".
- Data diambil dari Google Books API dengan query spesifik (misal: `inauthor:"Pramoedya Ananta Toer"` atau *subject* terkait).

### FR-3: Halaman Detail Buku
- Menampilkan informasi: Thumbnail Cover (HD jika tersedia), Judul, Penulis, Penerbit, Tahun Terbit, Deskripsi/Sinopsis.
- Tombol/Link "Baca di Google Books" yang mengarah ke `previewLink` dari API.

### FR-4: Responsivitas
- Tampilan harus *mobile-first* (sesuai pembagian tim Claude x Gemini).
- Grid katalog menyesuaikan ukuran layar (1 kolom di HP, 3-4 kolom di Desktop).

## 5. Non-Functional Requirements (NFR)
- **Performance:** Waktu muat halaman < 3 detik. Mengingat API Google Books bisa lambat, wajib menggunakan teknik *caching* (misal di level Next.js `fetch` atau Redis di NestJS).
- **Scalability:** Menggunakan arsitektur monorepo (Turborepo) agar mudah ditambahkan service baru di masa depan.
- **Security:** API Google Books dipanggil dari backend (NestJS) agar API Key (jika nanti digunakan) tidak terekspos ke frontend.
- **UI/UX:** Desain bersih, *minimalist*, fokus pada *cover* buku (seperti Goodreads/Google Books).

## 6. Technical Architecture
- **Monorepo:** Turborepo + Bun.
- **Frontend:** Next.js (App Router) + Tailwind CSS (atau Stitch design system).
- **Backend:** NestJS (sebagai *API Gateway* & *Proxy* ke Google Books).
- **Database:** PostgreSQL (Lokal) + Prisma ORM (Fungsi utama di MVP: Logging, cache tabel sederhana, atau menyimpan *curated list*).

## 7. User Flow (Alur Utama)
**Alur Pencarian Buku:**
User buka web → Masuk ke Homepage (lihat section "Buku Indonesia") → Ketik keyword di search bar → (Frontend hit API NestJS) → (NestJS hit Google Books API + caching) → Hasil muncul (Grid layout) → Klik salah satu buku → Masuk Halaman Detail → Klik "Baca di Google Books".

**Alur Filter:**
User di halaman pencarian → Buka dropdown "Bahasa" → Pilih "Indonesia" → Daftar buku terupdate otomatis.

## 8. Timeline (30 Hari Total)

**Fase 1: Development MVP (Hari 1 - 20)**
- **Hari 1-3:** Setup Monorepo (Turborepo+Bun), Setup Next.js, Setup NestJS, Setup Prisma+PostgreSQL Lokal.
- **Hari 4-7:** Integrasi Backend NestJS ke Google Books API (Endpoint Search, Detail, Curated List). Buat unit testing sederhana.
- **Hari 8-14:** Pembuatan Frontend Next.js (Halaman Home, Search Result, Detail). Integrasi API Backend.
- **Hari 15-18:** Responsive Design & Styling Polish (Claude x Gemini ambil alih di sini).
- **Hari 19-20:** End-to-End Testing MVP. Deploy ke lokal/staging.

**Fase 2: Bugfix & Minor Feature (Hari 21 - 30)**
- **Hari 21-25:** Bug fixing dari hasil testing MVP.
- **Hari 26-28:** Implementasi Auth & Fitur "Simulasi Pinjam" (Jika sempat).
- **Hari 29-30:** Final Polish & Dokumentasi.

## 9. Risiko & Mitigasi
1. **Google Books API Rate Limit / Limitasi Tanpa Key:**
   - *Mitigasi:* Terapkan *caching* di NestJS (simpan response ke DB/Redis). Gunakan key jika nanti dibutuhkan.
2. **Timeline Mepet (20 Hari):**
   - *Mitigasi:* Fokus ke *core feature* (Search, Detail, Responsive). Fitur Auth/Pinjam di-skip dulu, masuk fase Bugfix.
3. **Kualitas Data Google Books (Sampul pecah / Data ga lengkap):**
   - *Mitigasi:* Handling UI jika gambar tidak ada (pakai placeholder). Filter data minimal yang layak tampil.