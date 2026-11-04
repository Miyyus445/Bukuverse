# Bukuverse 📚

Bukuverse adalah platform web katalog buku yang memudahkan pengguna mencari literatur dari Google Books API, dengan fokus khusus pada kurasi karya penulis Indonesia.

Dokumen Product Requirements lengkap dapat dilihat di [docs/PRD-Bukuverse.md](docs/PRD-Bukuverse.md).

## 🛠 Tech Stack
- **Monorepo:** [Turborepo](https://turbo.build/) + [Bun](https://bun.sh/)
- **Frontend:** [Next.js](https://nextjs.org/) (App Router) + Tailwind CSS
- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)

## 📁 Struktur Folder
*(Akan diupdate setelah setup monorepo selesai)*
```text
.
├── apps/
│   ├── web/        # Frontend Next.js
│   └── api/        # Backend NestJS
├── packages/       # Shared configurations, types, dll
├── docs/           # Dokumentasi proyek (PRD, arsitektur)
└── README.md