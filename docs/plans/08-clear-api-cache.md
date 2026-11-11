# Plan: Clear API Cache

## 🎯 Tujuan
Menghapus data lama di tabel `ApiCache` (Neon DB) karena menyimpan respons Google Books yang masih mengandung data duplikat (sebelum ada fix deduplikasi).

## 🛠️ Langkah Eksekusi
1. Buat script sementara atau gunakan Prisma CLI untuk menghapus semua record di tabel `ApiCache`.
2. Atau, buat endpoint khusus (opsional) untuk flush cache.
3. Pastikan setelah cache dihapus, endpoint `/books/curated` mengembalikan data tanpa duplikat.