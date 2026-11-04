# Plan: Setup Next.js (Frontend)

**Task Jira:** SCRUM-11 (Setup Next.js)
**Referensi PRD:** Section 5 (In-Scope)
**Referensi Blueprint:** Section 2 (Tech Stack) & Section 3 (Struktur Monorepo)

## 🎯 Tujuan

Menginisialisasi Next.js (App Router) + Tailwind CSS di dalam `apps/web` sebagai fondasi antarmuka pengguna Bukuverse. Memastikan dev server bisa berjalan mandiri di dalam ekosistem Turborepo.

## 🛠️ Langkah-langkah Eksekusi

1. **Inisialisasi Next.js**
   - Masuk ke direktori `apps/web`.
   - Jalankan `bun create next-app@latest .` dengan opsi: TypeScript (Yes), ESLint (Yes), Tailwind CSS (Yes), `src/` directory (No), App Router (Yes), Turbopack (Yes), Import alias (No).

2. **Konfigurasi Package.json**
   - Buka `apps/web/package.json`.
   - Pastikan nama package-nya sesuai (misal: `"@bukuverse/web"`).
   - Pastikan script `dev`, `build`, `lint` sudah sesuai standar.

3. **Bersihkan Boilerplate**
   - Hapus gambar bawaan Next.js di folder `public` (kecuali file favicon).
   - Bersihkan isi `app/page.tsx` dan `app/globals.css` (biarkan import tailwind-nya aja).
   - Ganti metadata default di `app/layout.tsx` jadi "Bukuverse".

4. **Uji Coba Turborepo**
   - Kembali ke root folder proyek (Bukuverse).
   - Jalankan `bun run dev`.
   - Pastikan Next.js berjalan di port default (3000) dan dapat diakses di browser.

## ✅ Kriteria Selesai (Definition of Done)

- [ ] Folder `apps/web` berisi project Next.js (App Router + Tailwind).
- [ ] `bun run dev` di root berhasil menyalakan server Next.js.
- [ ] Halaman default Next.js udah bersih dari logo-logo bawaan.
- [ ] README.md diperbarui (jika perlu).
