# PRD: Bukuverse

**Versi:** 2.0 (versi Claude)
**Tanggal:** 04 November 2026
**Status:** Siap direview
**Dokumen terkait:** `BLUEPRINT.md` (teknis), `AI_AGENT.md` (aturan AI agent)

## 1. Ringkasan
Bukuverse adalah web katalog buku. User bisa mencari buku, memfilter berdasarkan bahasa, melihat detail, lalu lanjut baca/beli lewat Google Books. Ada section khusus untuk karya penulis Indonesia.

## 2. Masalah yang Diselesaikan
- Cari buku di Google Books langsung terasa ramai dan susah menemukan karya Indonesia.
- Pelajar dan mahasiswa butuh pencarian referensi yang cepat dan bersih, terutama dari HP.

## 3. Tujuan dan Metrik Sukses
| Tujuan | Metrik (MVP) |
|---|---|
| Pencarian cepat | Hasil muncul < 3 detik (saat cache hit < 1 detik) |
| Mudah dipakai di HP | Semua halaman nyaman dipakai di layar 360px tanpa scroll horizontal |
| Karya Indonesia mudah ditemukan | Section kurasi tampil di homepage dengan minimal 12 buku |
| Stabil | Tidak ada halaman blank/crash saat API gagal (selalu ada pesan error) |

**Bukan tujuan MVP:** login, pinjam buku, dashboard admin, rekomendasi personal.

## 4. Target User
1. **Pelajar/Mahasiswa**: cari referensi cepat, filter bahasa.
2. **Pembaca umum**: jelajah buku populer, baca sinopsis.

## 5. User Story dan Kriteria Penerimaan

### Prioritas: Must Have (MVP)
**US-1 Cari buku**
Sebagai user, saya ingin mencari buku lewat judul, penulis, atau ISBN.
- Search bar ada di homepage dan halaman hasil.
- Input kosong tidak memicu request.
- Hasil tampil dalam grid dengan cover, judul, penulis.
- Ada pagination (12 buku per halaman).
- Tidak ada hasil: tampil pesan "Buku tidak ditemukan".

**US-2 Filter bahasa**
Sebagai user, saya ingin memfilter hasil berdasarkan bahasa.
- Pilihan: Semua, Indonesia, English.
- Ganti filter langsung memperbarui hasil dan URL (`?lang=id`), jadi bisa di-share.
- Pindah filter mengembalikan ke halaman 1.

**US-3 Detail buku**
Sebagai user, saya ingin melihat info lengkap sebuah buku.
- Tampil: cover, judul, penulis, penerbit, tahun terbit, sinopsis.
- Data kosong ditampilkan sebagai "Tidak tersedia", bukan dikosongkan.
- Tombol "Baca di Google Books" membuka link di tab baru. Kalau link tidak ada, tombol disembunyikan.

**US-4 Karya Indonesia Ternama**
Sebagai user, saya ingin melihat rekomendasi karya penulis Indonesia di homepage.
- Section tampil di homepage tanpa user harus mencari.
- Daftar penulis diatur dari database (`CuratedAuthor`), bukan hardcode di kode.
- Klik buku membuka halaman detail.

**US-5 Responsif**
Sebagai user HP, saya ingin tampilan yang nyaman.
- Grid: 1 kolom (HP), 2 (tablet), 3-4 (desktop).
- Tombol dan input mudah disentuh (minimal 44px).

**US-6 Kondisi khusus**
- Loading: tampil skeleton/spinner.
- Error API: tampil pesan ramah + tombol coba lagi.
- Cover kosong atau rusak: tampil placeholder.

### Prioritas: Should Have (Fase 2)
- Filter kategori/subject
- Sorting hasil (relevansi, terbaru)

### Prioritas: Could Have (kalau sempat)
- Auth sederhana + "Simulasi Pinjam"
- Dark mode

### Prioritas: Won't Have (sekarang)
- Pinjam sungguhan, denda, dashboard admin

## 6. Daftar Kurasi Awal
Pramoedya Ananta Toer, Tere Liye, Andrea Hirata, Eka Kurniawan, Dee Lestari, Leila S. Chudori.
Daftar ini bisa diubah tanpa deploy ulang karena disimpan di database.

## 7. Alur Utama
1. User buka homepage, lihat Karya Indonesia Ternama.
2. Ketik keyword lalu masuk ke halaman hasil.
3. (Opsional) pilih filter bahasa.
4. Klik buku lalu masuk halaman detail.
5. Klik "Baca di Google Books".

## 8. Kebutuhan Non-Fungsional
- **Performa:** target < 3 detik. Response Google Books di-cache di database (masa berlaku 24 jam untuk search, 7 hari untuk detail).
- **Keamanan:** Google Books hanya dipanggil dari backend. API key (kalau dipakai) hanya di `.env` backend.
- **Aksesibilitas dasar:** gambar punya teks alternatif, kontras warna cukup.
- **Bahasa UI:** Indonesia.

## 9. Batasan dan Asumsi
- Data buku sepenuhnya dari Google Books API. Kualitas data mengikuti sumber (cover/sinopsis bisa kosong).
- Google Books maksimal 40 hasil per request.
- Tanpa API key, kuota harian terbatas. Cache wajib untuk menghindari limit.
- Pengerjaan oleh satu orang pemula dibantu AI, jadi scope sengaja dibuat kecil.

## 10. Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kena rate limit Google Books | Hasil gagal tampil | Cache di DB, pakai API key bila perlu |
| Data buku jelek | Tampilan berantakan | Placeholder, fallback teks, filter data minimal |
| Timeline mepet | MVP telat | Pegang prioritas Must Have, tunda sisanya |
| Kuota AI gratis habis | Progres lambat | Task kecil per sesi, simpan progres di `BLUEPRINT.md` |

## 11. Timeline
Mengikuti `BLUEPRINT.md` bagian 9:
- **Hari 1-20:** MVP (semua Must Have)
- **Hari 21-30:** Bugfix, lalu Should/Could Have

## 12. Definisi Selesai (MVP)
- Semua user story Must Have lolos kriteria penerimaan
- Berjalan lancar di HP dan desktop
- Tidak ada error di console pada alur utama
- `BLUEPRINT.md` dan README sudah diperbarui
- Bisa dijalankan dari nol dengan `bun install` + `docker compose up -d` + `bun dev`
