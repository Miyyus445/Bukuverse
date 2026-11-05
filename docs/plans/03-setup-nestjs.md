# Plan: Setup NestJS (Backend)

**Task Jira:** SCRUM-12 (Setup NestJS)
**Referensi PRD:** Section 5 (In-Scope)
**Referensi Blueprint:** Section 2 (Tech Stack) & Section 3 (Struktur Monorepo)

## 🎯 Tujuan
Menginisialisasi NestJS di dalam `apps/api` sebagai fondasi backend (API Gateway & Proxy ke Google Books). Memastikan dev server NestJS bisa berjalan di dalam ekosistem Turborepo.

## 🛠️ Langkah-langkah Eksekusi

1. **Inisialisasi NestJS**
   - Masuk ke direktori `apps/api`.
   - Jalankan `bunx @nestjs/cli new . --package-manager bun --skip-git`. 
   - (Kalau ditanya mau pakai package manager apa, pilih `bun`).

2. **Konfigurasi Package.json**
   - Buka `apps/api/package.json`.
   - Ubah nama package jadi `"@bukuverse/api"`.
   - Pastikan script `dev` (biasanya `nest start --watch`), `build`, dan `lint` sudah sesuai.

3. **Setup Basic Controller & Service (Health Check)**
   - Bikin module `AppModule` bawaan NestJS.
   - Di `AppController`, ubah route `/` jadi `/api/health` yang return JSON `{ status: 'ok', timestamp: ... }`.
   - Pastikan port backend jalan di `3001` (ubah di `main.ts` kalau perlu, biar ga bentrok sama Next.js di 3000).

4. **Uji Coba Turborepo**
   - Kembali ke root folder proyek (Bukuverse).
   - Jalankan `bun run dev`.
   - Pastikan *kedua* server (Next.js di 3000, NestJS di 3001) bisa jalan bareng via Turborepo.
   - Cek `http://localhost:3001/api/health` di browser.

## ✅ Kriteria Selesai (Definition of Done)
- [ ] Folder `apps/api` berisi project NestJS.
- [ ] `bun run dev` di root berhasil menyalakan Next.js DAN NestJS secara bersamaan.
- [ ] Endpoint `/api/health` bisa diakses dan return 200 OK.
- [ ] README.md diperbarui (opsional).