# Plan: Frontend UI (Basic/Mentah)

**Task Jira:** SCRUM-15 (Frontend UI)
**Referensi PRD:** Section 5 (In-Scope) & Section 6 (User Story)
**Referensi Blueprint:** Section 7 (Halaman Frontend)

## 🎯 Tujuan
Membangun antarmuka web Next.js (fungsionalitas dasar tanpa desain visual rumit) yang memanggil API backend dan menampilkan data buku. Desain UI/UX yang estetik akan dikerjakan di Sprint berikutnya.

## 🛠️ Langkah-langkah Eksekusi

1. **Aktifkan CORS di Backend**
   - Buka `apps/api/src/main.ts`.
   - Tambahkan `app.enableCors()` agar frontend di port 3000 bisa mengakses backend di port 3001.

2. **Setup API Client di Frontend**
   - Buat file `apps/web/lib/api.ts`.
   - Buat fungsi `fetchApi` untuk memanggil backend (base URL: `http://localhost:3001`).
   - Definisikan tipe `Book` (bisa import dari `@bukuverse/shared` atau copy-paste manual tipe-nya).

3. **Komponen Reusable (Basic)**
   - Buat `components/BookCard.tsx`: Komponen card sederhana (cover, judul, penulis). Pakai gambar placeholder jika thumbnail kosong.

4. **Halaman Home (`apps/web/app/page.tsx`)**
   - Bikin form Search Bar sederhana (input + tombol).
   - Bikin section "Karya Indonesia Ternama" yang fetch ke `/books/curated`.
   - Tampilkan hasilnya dalam grid menggunakan `BookCard`.

5. **Halaman Pencarian (`apps/web/app/search/page.tsx`)**
   - Baca URL Search Params (`q`, `lang`, `page`).
   - Fetch ke `/books/search`.
   - Tampilkan hasil dalam bentuk grid.
   - Tambahkan dropdown sederhana untuk Filter Bahasa (Semua, id, en).
   - Tambahkan tombol Next/Prev untuk pagination.

6. **Halaman Detail (`apps/web/app/books/[id]/page.tsx`)**
   - Fetch ke `/books/:id`.
   - Tampilkan cover (ukuran lebih besar), judul, penulis, penerbit, tahun, dan deskripsi.
   - Tambahkan tombol "Baca di Google Books" jika `previewLink` ada.

7. **Handling State (Wajib)**
   - Tampilkan teks "Loading..." atau skeleton sederhana saat fetch data.
   - Tampilkan pesan "Buku tidak ditemukan" jika data kosong.
   - Tampilkan pesan error jika fetch gagal.

## ✅ Kriteria Selesai (Definition of Done)
- [ ] CORS backend aktif.
- [ ] Halaman Home nampilin section "Karya Indonesia" dari API backend.
- [ ] Search bar berfungsi (navigasi ke /search).
- [ ] Hasil pencarian muncul dalam bentuk grid.
- [ ] Pagination & Filter bahasa berfungsi.
- [ ] Halaman Detail nampilin info buku.
- [ ] `bun run build` di frontend (dan backend) tidak error.