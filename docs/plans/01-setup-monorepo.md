# Plan: Setup Monorepo Turborepo + Bun

**Task Jira:** SCRUM-10 (Scaffold Turborepo + Bun Monorepo)
**Referensi PRD:** Section 5 (In-Scope) & Section 13 (Timeline)
**Referensi Blueprint:** Section 2 (Tech Stack) & Section 3 (Struktur Monorepo)

## 🎯 Tujuan

Menginisialisasi struktur proyek monorepo menggunakan Turborepo dan Bun sebagai package manager. Menyiapkan fondasi dasar untuk frontend (Next.js) dan backend (NestJS), serta menyiapkan folder untuk shared packages.

## 🛠️ Langkah-langkah Eksekusi

1. **Inisialisasi Proyek Root**
   Jalankan `bun init -y` di root folder untuk membuat `package.json` awal.

2. **Konfigurasi Workspace (`package.json`)**
   Update `package.json` di root agar mendukung Turborepo dan workspaces:
   - Tambahkan `"workspaces": ["apps/*", "packages/*"]`.
   - Tambahkan script `"dev": "turbo run dev"`, `"build": "turbo run build"`, `"lint": "turbo run lint"`.
   - Install `turbo` sebagai devDependency.

3. **Buat Struktur Folder**
   Buat folder dasar: `apps/web` (Next.js), `apps/api` (NestJS), dan `packages/shared` (shared types).

4. **Konfigurasi Turborepo (`turbo.json`)**
   Buat file `turbo.json` di root dengan konfigurasi pipeline untuk `build`, `lint`, dan `dev`.

5. **Setup `.gitignore`**
   Pastikan `node_modules`, `.turbo`, `.next`, `dist`, dan file `.env` di-ignore.

6. **Update `README.md`**
   Update struktur folder di dokumentasi `README.md` agar sesuai dengan setup monorepo yang baru.

## ✅ Kriteria Selesai (Definition of Done)

- [ ] Folder `apps/` dan `packages/` sudah ada.
- [ ] File `package.json` dan `turbo.json` di root sudah terkonfigurasi.
- [ ] `bun install` berjalan sukses.
- [ ] `README.md` sudah diperbarui.
