# DESIGN SPEC: Bukuverse Frontend

Acuan implementasi UI/UX. Sumber: desain Stitch (Modern Editorial) yang sudah disaring dan disesuaikan dengan PRD v5.0.

## 0. Aturan Pakai (WAJIB DIBACA)
1. **Token di dokumen ini adalah acuan**, bukan warna yang terlihat di screenshot Stitch (render Stitch sedikit berbeda, mis. latar lebih hangat).
2. **Teks baku (bagian 4) dipakai persis.** Jangan mengubah kata.
3. **Jangan menambah apa pun di luar spec** (lihat bagian 9: daftar terlarang). Fitur harus sesuai PRD_FINAL.md.
4. Aplikasi hanya **Bahasa Indonesia**, mobile-first (mulai 360px), dark mode mengikuti pengaturan sistem (tanpa tombol toggle).
5. Tailwind CSS **v4**: token ditaruh di `globals.css` (`@theme`), **bukan** `tailwind.config.ts`.

## 1. Warna
| Token | Terang | Gelap | Pakai untuk |
|---|---|---|---|
| `bg` | `#FFFFFF` | `#0F1117` | Latar halaman |
| `surface` | `#F7F7F8` | `#1B1D26` | Kartu, input, panel |
| `border` | `#E5E7EB` | `#2D3139` | Garis tepi |
| `text` | `#111111` | `#F9FAFB` | Teks utama |
| `text-secondary` | `#4B5563` | `#9CA3AF` | Teks pendukung (penulis, deskripsi) |
| `text-muted` | `#6B7280` | `#8B93A1` | Placeholder, keterangan kecil |
| `primary` | `#3B49DF` | `#4F46E5` | Tombol utama (teks putih) |
| `primary-hover` | `#2F3CBC` | `#4338CA` | Hover tombol utama |
| `accent` | `#3B49DF` | `#818CF8` | Tautan, teks aksen, fokus |
| `error` | `#DC2626` | `#F87171` | Teks/ikon error |

Aturan kontras (hasil hitung manual, tetap cek dengan contrast checker):
- `text-muted` hanya di atas `bg`. Di atas `surface` pakai `text-secondary` (kontrasnya mepet 4,5:1).
- Teks kecil di cover memakai putih opasitas minimal 80%.
- Jangan pakai warna semantik (hijau/kuning) sebagai teks di latar terang.

Implementasi (pola Tailwind 4 / Next.js):
```css
@import "tailwindcss";
:root { --bg:#fff; --surface:#f7f7f8; --border:#e5e7eb; --text:#111; --text-secondary:#4b5563; --text-muted:#6b7280; --primary:#3b49df; --primary-hover:#2f3cbc; --accent:#3b49df; --error:#dc2626; }
@media (prefers-color-scheme: dark) { :root { --bg:#0f1117; --surface:#1b1d26; --border:#2d3139; --text:#f9fafb; --text-secondary:#9ca3af; --text-muted:#8b93a1; --primary:#4f46e5; --primary-hover:#4338ca; --accent:#818cf8; --error:#f87171; } }
@theme inline { --color-bg:var(--bg); --color-surface:var(--surface); --color-border:var(--border); --color-text:var(--text); --color-text-secondary:var(--text-secondary); --color-text-muted:var(--text-muted); --color-primary:var(--primary); --color-primary-hover:var(--primary-hover); --color-accent:var(--accent); --color-error:var(--error); }
```

## 2. Tipografi
- Heading: **Playfair Display** (serif). Body/UI: **Plus Jakarta Sans**. Dimuat lewat `next/font/google`, variabel `--font-serif` dan `--font-sans`.
- Skala: judul hero 36/44 (mobile 30/36) bold; judul seksi 24/32 bold; judul kartu 16/24 semibold (maks 2 baris); body 16/24; teks pendukung 14/20; teks kecil 12/16 (minimum 12px).

## 3. Bentuk
- Spasi kelipatan 4px. Container maks 1200px, padding samping 16px (mobile), 24px (tablet), 32px (desktop).
- Radius: `sm` 4px, `md` 8px (tombol, input, chips), `lg` 12px (kartu, panel), `full` (badge, chips).
- Bayangan: `sm` untuk cover dan kartu, `md` saat hover kartu. Cover asli: border 1px `border` + bayangan lembut.
- Semua elemen interaktif minimal **44x44px**. Fokus keyboard terlihat: ring 2px `accent`.

## 4. Teks Baku (copy deck)
| Konteks | Teks |
|---|---|
| Brand | Bukuverse |
| Tagline hero | Eksplorasi mahakarya sastra dan khazanah literatur Indonesia pilihan dengan kurasi mendalam. |
| Placeholder cari | Cari judul, penulis, atau ISBN |
| Tombol cari | Cari |
| Label chips | Populer: (chips: Pramoedya, Andrea Hirata, Tere Liye) |
| Seksi kurasi | Karya Indonesia Ternama |
| Subjudul kurasi | Koleksi kanonik yang membentuk pilar kesusastraan nusantara lintas masa. |
| Kurasi gagal | Gagal memuat karya pilihan / Terjadi kendala saat menghubungkan ke katalog. Silakan periksa koneksi Anda dan coba kembali. / [Coba lagi] |
| Judul hasil | Hasil untuk “{kata kunci}” |
| Filter bahasa | Semua, Indonesia, English |
| Hasil kosong | Buku tidak ditemukan. / Coba kata kunci lain. |
| Hasil error | Gagal memuat hasil / Terjadi masalah saat mengambil data untuk “{kata kunci}”. / [Coba lagi] |
| Layanan sibuk (429) | Layanan sedang sibuk, coba beberapa saat lagi / Permintaan pencarian untuk “{kata kunci}” belum dapat diproses. / [Coba lagi] |
| Pagination | Sebelumnya, Berikutnya, Hal. {n} dari {total} |
| Breadcrumb detail | Beranda / Hasil pencarian / {judul} |
| Tombol detail | Kembali ke hasil pencarian; Baca di Google Books |
| Label info | Penerbit, Tahun terbit, Bahasa; nilai kosong: Tidak tersedia |
| Sinopsis | Sinopsis; Baca selengkapnya / Tutup |
| Buku tidak ditemukan | Buku tidak ditemukan / Buku yang Anda cari tidak tersedia. / [Kembali ke Beranda] [Cari buku] |
| 404 global | Halaman tidak ditemukan / Alamat yang Anda buka tidak tersedia. / [Kembali ke Beranda] [Cari buku] |
| Error global | Terjadi kesalahan / Terjadi masalah saat memuat halaman. / [Coba lagi] [Kembali ke Beranda] |
| Offline | Tidak ada koneksi internet / Periksa koneksi Anda lalu coba lagi. / [Coba lagi] |
| Footer | Data dari Google Books • © 2026 Bukuverse |

## 5. Komponen

**Header** (semua halaman, sticky): kiri ikon buku terbuka (SVG vektor, warna `accent`) + teks "Bukuverse" (Playfair); kanan ikon cari (44px). **Tidak ada** menu, ikon akun, tombol kembali, atau judul halaman. Ikon cari dan tombol "Cari buku" menuju `/#cari` (memfokuskan kolom cari di Beranda).

**Footer**: satu baris teks baku, tengah, `text-secondary`, tanpa tautan. Latar `surface`, ikut mode gelap penuh.

**Kolom cari**: input (ikon kaca pembesar, placeholder baku) + tombol "Cari" (primary). Di halaman hasil ada tombol hapus (x) saat terisi. Input kosong tidak mengirim request. Di HP, tombol di samping input (tidak membungkus).

**Filter bahasa**: chips/segmented control 3 pilihan, tinggi 44px, pilihan aktif berlatar `primary` teks putih. Mengubah filter memperbarui URL dan kembali ke halaman 1.

**Cover buku** (satu komponen untuk semua tempat), rasio 2:3:
- Ada gambar dari Google: `next/image`, border + bayangan lembut, `https` (ubah `http://`), jika gagal muat jatuh ke placeholder.
- Tidak ada gambar: placeholder tipografi. Isi **hanya**: monogram inisial judul (maks 3 huruf), judul (Playfair, maks 4 baris), penulis (kecil), tahun (kecil). Warna latar dipilih deterministik dari hash judul di antara 6 warna gelap: `#1E2A44`, `#1F3A32`, `#3A1F28`, `#2A2A33`, `#2B2147`, `#3A2A1E`; teks putih. Dilarang label karangan (Klasik, Edisi, Koleksi, Tetralogi, dsb).
- `alt`: "Sampul {judul}".

**Kartu buku**: permukaan `surface`, border, radius `lg`, hover bayangan `md`. Isi: cover, judul (maks 2 baris), penulis (1 baris), "{penerbit} • {tahun}" (kecil), badge bahasa (satu kali, di baris info). Variasi: HP (<640px) horizontal (cover kiri 80px, info kanan); ≥640px vertikal. Seluruh kartu adalah tautan ke `/books/[id]`.

**Grid**: <640px 1 kolom; 640-1023px 2 kolom; 1024-1279px 3 kolom; ≥1280px 4 kolom. Jarak 16px (HP) / 24px (desktop).

**Badge bahasa**: pill kecil, teks `ID` / `EN` (di kartu) dan "Indonesia" / "English" (di detail).

**Tombol**: utama (`primary`, teks putih, tinggi min 44px, radius `md`), sekunder (`surface` + border). Tombol "Baca di Google Books" memakai ikon tautan keluar kecil, membuka tab baru (`noopener noreferrer`), lebar penuh di HP.

**Pagination**: desktop: Sebelumnya, nomor (halaman aktif berlatar `primary`, `aria-current="page"`, elipsis untuk rentang panjang), Berikutnya. HP: Sebelumnya | "Hal. n dari total" (satu baris) | Berikutnya. Tombol nonaktif tampil jelas (opasitas turun, `disabled`). Semua target 44px.

**Skeleton**: `animate-pulse`, warna `border`/`surface`, bentuk persis kartu/halaman yang dimuat (cover 2:3 + 3-4 baris). Tanpa teks.

**Pesan status** (kosong/error/sibuk/404/offline): ilustrasi garis monokrom sederhana (ikon SVG), judul (Playfair), teks (`text-secondary`), tombol sesuai bagian 4. Tidak pakai kartu pembungkus; selalu rata tengah.

## 6. Layar
- **Beranda `/`**: header → hero (judul "Bukuverse", tagline, kolom cari `id="cari"`, chips Populer yang menuju `/search?q=...`) → seksi "Karya Indonesia Ternama" (8 kartu) → footer. State: skeleton 8 kartu, error (pesan status), kosong disembunyikan.
- **Hasil `/search?q=&lang=&page=`**: header → kolom cari terisi → filter bahasa → "Hasil untuk “...”" → grid 12 kartu → pagination → footer. State: skeleton (saat ganti filter/halaman tampilkan skeleton, bukan layar kosong), kosong, error, sibuk (429). `page` melebihi total: tampil kosong atau arahkan ke halaman terakhir.
- **Detail `/books/[id]`**: HP: cover tengah di atas → judul → penulis → kartu info (Penerbit, Tahun terbit, Bahasa) → tombol "Baca di Google Books" → Sinopsis. Desktop: cover + tombol di kiri, breadcrumb/judul/penulis/info/sinopsis di kanan. Sinopsis dilipat ±6 baris dengan "Baca selengkapnya"/"Tutup". Penulis banyak: chips yang wrap. Judul panjang wrap. Tombol "Baca di Google Books" disembunyikan jika `previewLink` kosong. "Kembali ke hasil pencarian" dan item breadcrumb "Hasil pencarian" kembali ke URL pencarian terakhir (simpan di `sessionStorage`); bila tidak ada konteks pencarian, keduanya disembunyikan. Sinopsis ditampilkan sebagai teks (HTML dibuang, backend yang membersihkan).
- **Buku tidak ditemukan**, **404 global**, **Error global**, **Offline**: pesan status di tengah halaman dengan header dan footer standar.

## 7. Pemetaan ke Next.js
`app/layout.tsx` (header, footer, font, metadata), `app/not-found.tsx` (404 global), `app/error.tsx` (error global), `app/loading.tsx` dan `app/search/loading.tsx`, `app/books/[id]/loading.tsx`, `app/books/[id]/not-found.tsx` (buku tidak ditemukan), tombol "Coba lagi" memakai `reset()`. Offline ditangani di komponen error global (cek `navigator.onLine`). Komponen bersama di `components/`.

## 8. Aksesibilitas
Satu `h1` per halaman; `alt` pada setiap cover; label untuk input (boleh `sr-only`); `aria-current="page"` di pagination; skip link "Lewati ke konten" di layout; status loading/error diumumkan lewat `aria-live="polite"`; urutan tab logis; `lang="id"`.

## 9. DILARANG Diimplementasikan (tidak ada di PRD)
Ikon/menu akun, login, bottom navigation, bookmark/koleksi, rating, ulasan, jumlah halaman, ISBN, cetakan/edisi, kategori/genre/topik, tab filter kategori, kutipan, rekomendasi/buku populer/terkait, statistik angka, kartu "kurasi berkualitas/catatan editorial/koneksi layanan", menu "Katalog/Kritik & Esai/Penulis/Kurasi Pilihan", tautan footer (Tentang/Kontak/dsb), eyebrow/label dekoratif, nomor urut di cover, tag "Judul/ISBN" di kolom cari, tombol bagikan, toggle dark mode.

## 10. Keputusan yang Perlu Dikonfirmasi
1. **Filter bahasa**: desain dan PRD hanya 3 opsi (Semua, Indonesia, English). Kode lama punya 6 (jv, su, ms). Default: ikuti PRD. Cek apakah backend menolak `jv/su/ms`.
2. Ikon cari di header dan tombol "Cari buku" sama-sama menuju `/#cari`.
