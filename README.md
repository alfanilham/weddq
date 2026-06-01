# weddQ — Platform Undangan Digital Pernikahan

Monorepo (npm workspaces) berisi:

- `apps/api` — Express + Prisma + PostgreSQL + JWT
- `apps/web` — React + Vite + Tailwind + React Router

Stack didesain dengan tema **klasik-modern Indonesia** (sepia, krem, emas, marun) — terinspirasi referensi awal.

## Cara menjalankan

```bash
# 1. Install dependency
npm install

# 2. Jalankan Postgres + Adminer via Docker
npm run db:up
# Postgres → localhost:5433  (user: weddq, pass: weddq_secret, db: weddq)
# Adminer  → http://localhost:8081

# 3. Setup .env (lihat apps/api/.env.example)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Migrate database & seed contoh data
npm run db:migrate
npm run db:seed

# 5. Jalankan dev server (API + Web sekaligus)
npm run dev
```

Setelah jalan:

- Web: <http://localhost:5173>
- API: <http://localhost:4000>
- Adminer: <http://localhost:8081>

## Akun seed

| Peran  | Email                 | Password   |
|--------|-----------------------|------------|
| Admin  | admin@weddq.id        | admin1234  |
| Mempelai | arini@weddq.id      | demo1234   |

Halaman undangan publik contoh: <http://localhost:5173/u/arini-bagas>

## Struktur

```
apps/
  api/                Express + Prisma backend
    prisma/schema.prisma
    src/routes/       Auth, weddings, templates, guests, RSVP, wishes, admin
    src/middleware/   JWT auth, error handler
    src/seed/         Demo seeder
  web/                React + Vite + Tailwind frontend
    src/pages/        Landing, auth, dashboard, templates, preview, admin, public invitation
    src/components/   Shared UI (Nav, Footer, Ornaments)
docker-compose.yml    Postgres 16 + Adminer
```
