# Product Requirements Document (PRD): Bukuverse
**Version:** 3.0 (Unified & Integrated Release)  
**Date:** 04 November 2026  
**Status:** Approved / Ready for Blueprint & Implementation  
**Related Documents:** BLUEPRINT.md, AI_AGENT.md

---

## 1. Executive Summary & Objective
Bukuverse adalah platform katalog buku berbasis web yang dirancang ringan, responsif (mobile-first), dan cepat. Platform ini memfasilitasi pelajar, mahasiswa, dan pembaca umum dalam mencari referensi literatur global serta mengeksplorasi karya-karya penulis Indonesia ternama.

### Primary Objectives & Success Metrics
1. **Performa & Kecepatan:** Waktu muat halaman pertama dan pencarian < 3 detik (Target cache hit < 1 detik via Caching Strategy di NestJS).
2. **Responsivitas & Layout Mobile-First:** Tampilan optimal di layar kecil (360px ke atas) tanpa horizontal overflow/scroll.
3. **Eksplorasi Karya Lokal:** Section kurasi penulis Indonesia tampil secara dinamis di homepage.
4. **Resilience & Fault Tolerance:** Handling graceful degradation saat API Google Books bermasalah (menggunakan skeleton, state error yang jelas, dan image fallback).

---

## 2. Project Governance & Collaboration Stack
* **Pusat Project:** DeepSeek
* **PRD:** Claude x Gemini x DeepSeek
* **Design & Layout System:** Gemini x Claude x Stitch
* **Coding / Prompting Core:** DeepSeek
* **Fix Bug / Refactoring:** DeepSeek x Copilot x Claude
* **Responsivitas & Accessibility:** Claude x Gemini
* **AI Agent Execution:** OpenCode
* **Wajib Dokumentasi:** BLUEPRINT.md & AI_AGENT.md di root workspace.

---

## 3. Target User (User Persona)
1. **Pelajar / Mahasiswa:** Membutuhkan pencarian literatur cepat berdasarkan judul, penulis, atau ISBN, serta memfilter referensi berdasarkan bahasa.
2. **Pembaca Umum:** Ingin mengeksplorasi rekomendasi buku populer, membaca sinopsis singkat, dan mengakses tautan pratinjau resmi.

---

## 4. Scope of Work (MVP - 20 Hari First Release)

### In-Scope (Must Have)
* **Architecture:** Monorepo menggunakan Turborepo + Bun.
* **Frontend Layer:** Next.js (App Router) + Tailwind CSS + Stitch Design Components. Layout mobile-first.
* **Backend Layer:** NestJS sebagai API Gateway & Proxy Google Books API + Caching Layer.
* **Database & ORM:** PostgreSQL + Prisma ORM (Digunakan untuk caching search/detail dan menyimpan data CuratedAuthor).
* **Fitur Utama:**
  * Search katalog (Judul, Penulis, ISBN) dengan pagination (12 item per halaman).
  * Filter Bahasa (`Semua`, `Indonesia`, `English`) yang tersinkronisasi ke URL parameter (`?lang=id`).
  * Detail Halaman Buku (Metadata lengkap, Sinopsis, Cover HD/Fallback, dan Link Google Books).
  * Section "Karya Indonesia Ternama" di homepage yang bersumber dari tabel database `CuratedAuthor`.

### Out-of-Scope (Fase 2 / Update 10 Hari Terakhir)
* Autentikasi Pengguna (Login/Register).
* Fitur Bookmark / Keranjang / Simulasi Peminjaman.
* Dashboard Admin Pustakawan.
* Filter Subject/Category Lanjutan.

---

## 5. User Stories & Acceptance Criteria (AC)

### US-1: Pencarian Katalog Buku
* **As a** user, **I want to** mencari buku berdasarkan keyword (judul, penulis, ISBN), **so that** saya bisa menemukan referensi yang dibutuhkan.
* **Acceptance Criteria:**
  - Search bar tersedia di homepage dan header results page.
  - Input kosong/spasi tidak memicu HTTP request.
  - Hasil ditampilkan dalam bentuk Grid Layout (1 kolom mobile, 2 kolom tablet, 3–4 kolom desktop).
  - Setiap card menampilkan cover, judul, dan penulis.
  - Jika data tidak ditemukan, sistem menampilkan UI State: *"Buku tidak ditemukan"*.

### US-2: Filter Bahasa & Sinkronisasi URL
* **As a** user, **I want to** memfilter hasil pencarian berdasarkan bahasa, **so that** hasil yang muncul sesuai kebutuhan membaca saya.
* **Acceptance Criteria:**
  - Opsi filter: `Semua`, `Bahasa Indonesia`, `English`.
  - Mengubah filter akan memperbarui query URL (`?lang=id` / `?lang=en`) tanpa full page reload.
  - Mengubah filter otomatis mengembalikan pagination ke Halaman 1.

### US-3: Halaman Detail Buku
* **As a** user, **I want to** melihat rincian informasi buku, **so that** saya bisa memutuskan untuk membaca atau membelinya.
* **Acceptance Criteria:**
  - Menampilkan: Cover, Judul, Penulis, Penerbit, Tahun Terbit, dan Sinopsis lengkap.
  - Data yang bernilai `null` atau `undefined` dari API diganti dengan label *"Tidak tersedia"*.
  - Tombol *"Baca di Google Books"* membuka `previewLink` di tab baru (`target="_blank"`). Jika tautan tidak ada, tombol disembunyikan secara kondisional.

### US-4: Section "Karya Indonesia Ternama"
* **As a** user, **I want to** melihat daftar rekomendasi penulis lokal Indonesia di homepage, **so that** saya bisa menemukan karya sastra/literatur nasional dengan mudah.
* **Acceptance Criteria:**
  - Tampil di homepage tanpa memerlukan input pencarian pengguna.
  - Sumber daftar penulis dikelola via tabel `CuratedAuthor` di PostgreSQL melalui Prisma ORM (dinamis, tanpa hardcode di frontend).
  - Penulis awal: Pramoedya Ananta Toer, Tere Liye, Andrea Hirata, Eka Kurniawan, Dee Lestari, Leila S. Chudori.

---

## 6. Non-Functional Requirements (NFR)
* **Performance:** Integrasi NestJS caching layer. Cache pencarian berlaku 24 jam; cache detail buku berlaku 7 hari.
* **Security:** Google Books API dipanggil eksklusif melalui backend NestJS untuk menyembunyikan API Key dari client bundle.
* **UI/UX & Accessibility:**
  - Menerapkan desain minimalist clean (fokus pada visual cover buku).
  - Elemen interaktif memiliki touch target minimal 44x44px untuk kenyamanan perangkat seluler.
  - Penggunaan teks alternatif (`alt`) pada setiap gambar cover buku.

---

## 7. Technical Architecture & Data Flow
```text
[ Next.js Frontend (App Router) ]
         │  (HTTP / Fetch API)
         ▼
[ NestJS API Gateway ] ◄──► [ PostgreSQL / Prisma ORM ] (Cache & CuratedAuthor)
         │  (External API Call)
         ▼
[ Google Books API ]