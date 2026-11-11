# Plan: Fix Search Page URL Sync

## 🎯 Tujuan
Memperbaiki bug di mana perubahan pagination (Next/Prev) dan filter bahasa tidak memicu re-fetch data. Hanya URL yang berubah, UI tetap statis sampai di-refresh.

## 🛠️ Langkah Eksekusi

1. Buka `apps/web/app/search/page.tsx`.
2. Pindahkan ekstraksi parameter URL (`q`, `lang`, `page`) langsung dari `useSearchParams()` (jangan disimpen di `useState` untuk data fetch).
3. Buat state lokal terpisah khusus untuk input text (`searchQuery`), sinkronkan saat user ngetik.
4. Ubah `useEffect` yang melakukan fetch data, ganti dependency array-nya menjadi parameter URL yang udah diekstrak.
5. Ganti semua fungsi navigasi (`window.location.href` atau `router.push` yang lama) agar menggunakan `router.push` dengan parameter URL yang baru.