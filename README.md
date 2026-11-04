# Bukuverse 📚

Bukuverse adalah platform web katalog buku yang memudahkan pengguna mencari literatur dari Google Books API, dengan fokus khusus pada kurasi karya penulis Indonesia.

Dokumen Product Requirements lengkap dapat dilihat di [docs/PRD-Bukuverse.md](docs/PRD-Bukuverse.md).

## 🛠 Tech Stack

- **Monorepo:** [Turborepo](https://turbo.build/) + [Bun](https://bun.sh/)
- **Frontend:** [Next.js](https://nextjs.org/) (App Router) + Tailwind CSS
- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)

## 📁 Struktur Folder

```text
.
├── apps/
│   ├── web/        # Frontend Next.js
│   └── api/        # Backend NestJS
├── packages/
│   └── shared/     # Shared TypeScript types
├── docs/           # Dokumentasi proyek (PRD, arsitektur)
├── .env.example    # Contoh environment variables
├── turbo.json      # Konfigurasi Turborepo
├── BLUEPRINT.md    # Sumber kebenaran proyek
├── AI_AGENT.md     # Aturan untuk AI agent
└── README.md
```

## 🚀 Perintah Dasar

```bash
# Install dependencies
bun install

# Jalankan development (semua apps)
bun run dev

# Build semua apps
bun run build

# Lint semua apps
bun run lint

# Format kode
bun run format
```

## 📦 Package Manager

Project ini menggunakan **Bun** sebagai package manager. Pastikan Bun terinstall sebelum menjalankan perintah di atas.
