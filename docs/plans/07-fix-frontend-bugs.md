# Plan: Fix Frontend Bugs (Duplicate Key & Timeout)

## 🎯 Tujuan
Memperbaiki dua bug fungsional pada integrasi frontend-backend:
1. React Warning "Duplicate Key" karena data duplikat dari Google Books API.
2. Error "Gagal memuat" karena timeout 10 detik tidak cukup saat pertama kali load (Neon cold start).

## 🛠️ Langkah Eksekusi

1. **Fix Duplicate Key (Backend)**
   - Buka `apps/api/src/books/books.controller.ts`.
   - Di method `getCurated()`, tambahkan logika untuk menghapus duplikat ID sebelum data disimpan ke cache atau dikembalikan.
   - Gunakan `Map` atau `Set` berdasarkan `book.id` untuk memfilter array `allBooks`.

2. **Fix Timeout (Frontend)**
   - Buka `apps/web/lib/api.ts`.
   - Di fungsi `fetchWithTimeout`, ubah parameter default `timeoutMs = 10000` menjadi `timeoutMs = 30000` (30 detik).

3. Build dan lint kedua aplikasi untuk memastikan tidak ada error.