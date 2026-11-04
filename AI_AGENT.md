# AI_AGENT: Aturan untuk OpenCode

File ini dibaca AI agent (OpenCode) sebelum mengerjakan task apa pun di proyek Bukuverse.

## Wajib baca dulu
1. `BLUEPRINT.md`: stack, struktur, endpoint, database, timeline
2. Bagian "Status" di BLUEPRINT.md untuk tahu progres terakhir

Kalau task bertabrakan dengan BLUEPRINT.md, **berhenti dan tanya**, jangan ubah arsitektur sendiri.

## Konteks pemilik proyek
Pemula (sekitar 3 bulan belajar IT). Jadi:
- Kode harus sederhana dan mudah dibaca
- Kasih komentar singkat di bagian yang tidak jelas
- Penjelasan singkat, jangan panjang lebar
- Jangan pakai pola rumit (over-engineering) kalau ada cara yang lebih simpel

## Stack (jangan diganti)
Bun, Turborepo, Next.js (App Router), Tailwind CSS, NestJS, TypeScript, Neon (PostgreSQL), Prisma, Vercel.

Dilarang menambah library/service baru (termasuk Redis) tanpa izin pemilik.

## Aturan kerja
1. **Satu task kecil per sesi.** Kuota model gratis terbatas, jadi jangan kerjakan banyak hal sekaligus.
2. Sebelum coding, tulis rencana 3-5 poin, lalu kerjakan.
3. Ubah file seperlunya saja, jangan refactor file yang tidak terkait.
4. Setelah selesai, jalankan build/lint/test yang relevan dan laporkan hasilnya jujur.
5. Update bagian "Status" di `BLUEPRINT.md` setelah task selesai.
6. Kalau bingung atau ada beberapa pilihan, tanya. Jangan menebak.

## Konvensi kode
- TypeScript strict, hindari `any`
- Nama file: `kebab-case`. Komponen React: `PascalCase`
- Backend NestJS: pisah `controller`, `service`, `module`
- Tipe yang dipakai bersama frontend dan backend ditaruh di `packages/shared`
- Pakai package manager `bun` (bukan npm/yarn/pnpm)
- Env: semua rahasia di `.env`, jangan commit. Sediakan `.env.example`
- Prisma pakai `DATABASE_URL` (pooled) dan `DIRECT_URL` (migrasi). Jangan jalankan migrasi ke branch Neon `main` (production) tanpa izin pemilik
- API key Google Books (kalau nanti dipakai) hanya di env backend. Jangan pernah pakai awalan `NEXT_PUBLIC_` untuk rahasia

## Aturan khusus Bukuverse
- Google Books API **hanya** dipanggil dari NestJS, tidak dari frontend
- Search wajib punya pagination (maks 40 hasil per request dari Google)
- Cover kosong/rusak wajib pakai placeholder
- Setiap halaman wajib handle: loading, kosong, error
- Desain mobile-first, mulai dari layar kecil
- Cache response Google Books di tabel `ApiCache`

## Yang tidak boleh dikerjakan (di luar MVP)
Auth, pinjam buku, keranjang, dashboard admin, denda. Baru boleh di Fase 2 dan hanya kalau disuruh.

## Lingkungan
- Windows 10 Pro 22H2. Perhatikan path dan script shell yang kompatibel Windows
- Database di Neon (tidak ada PostgreSQL/Docker lokal). Saat development selalu pakai branch `dev`
- Deploy ke Vercel baru dikerjakan di hari 19-20, kecuali pemilik minta lebih awal

## Format laporan setelah task
```
Selesai: <apa yang dikerjakan>
File diubah: <daftar file>
Cara test: <perintah>
Catatan/masalah: <kalau ada>
Next: <saran task berikutnya>
```

## Kerja sama dengan AI lain
- Desain/UI dari Gemini/Stitch: ikuti, jangan diubah gaya besar tanpa izin
- Hasil kode dari DeepSeek: periksa dulu sebelum di-merge, sesuaikan dengan konvensi di atas
- Bug yang buntu: catat gejala + langkah reproduksi di `BLUEPRINT.md` supaya bisa dibawa ke AI lain
