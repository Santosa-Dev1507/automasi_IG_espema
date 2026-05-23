# SMPN 5 Klaten — IG Content Automation

Sistem otomatisasi konten Instagram untuk SMPN 5 Klaten. Multi-user, dengan auto-posting terjadwal, AI caption (Gemini), dan integrasi Google Drive.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript + Tailwind CSS v4**
- **NextAuth v5** untuk authentication multi-user
- **Vercel Postgres** untuk database
- **Vercel Cron** untuk auto-posting terjadwal
- **Google Gemini AI** untuk caption generator
- **Meta Graph API** untuk posting Instagram

## Development Lokal

```bash
# 1. Install dependencies
npm install

# 2. Salin env template
cp .env.example .env.local

# 3. Isi minimal:
#    - GEMINI_API_KEY (untuk AI caption)
#    - INSTAGRAM_ACCESS_TOKEN (untuk Instagram)
#    - GOOGLE_DRIVE_FOLDER_ID (untuk media)
#    - DEV_BYPASS_AUTH=true (skip login di local)

# 4. Run dev server
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:yourname/smpn5klaten-ig.git
git push -u origin main
```

### 2. Connect ke Vercel
- Login ke [vercel.com](https://vercel.com)
- Import project dari GitHub
- Framework: **Next.js** (auto-detect)
- **JANGAN deploy dulu** — atur env variables dulu

### 3. Buat Vercel Postgres
- Di Vercel dashboard → tab **Storage** → Create Database → **Postgres**
- Pilih project, lalu Connect
- Variable `POSTGRES_URL` otomatis ter-inject

### 4. Set Environment Variables (di Vercel Settings)

Wajib di-set:

| Variable | Cara Dapat |
|----------|------------|
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL Vercel deployment kamu |
| `INSTAGRAM_ACCESS_TOKEN` | Dari Meta Developer Console |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `GOOGLE_DRIVE_FOLDER_ID` | Dari URL folder Drive yang di-share |
| `CRON_SECRET` | `openssl rand -base64 32` |
| `INIT_SECRET` | `openssl rand -base64 32` |
| `INIT_ADMIN_PASSWORD` | Password admin pertama (akan di-hash) |

**JANGAN SET** `DEV_BYPASS_AUTH` di production.

### 5. Deploy
Klik **Deploy**. Tunggu sampai build selesai.

### 6. Inisialisasi Database
Setelah deploy berhasil, akses sekali:
```
https://your-domain.vercel.app/api/init?secret=NILAI_INIT_SECRET
```

Akan membuat:
- Tabel: `users`, `posts`, `settings`, `analytics`
- Admin default: `admin@smpn5klaten.sch.id` (password = `INIT_ADMIN_PASSWORD`)

### 7. Login & Ganti Password
- Login di `/login`
- **Segera ganti password admin** via SQL atau halaman settings

## Endpoint Utama

- `/dashboard` — Overview
- `/dashboard/buat` — Buat post baru
- `/dashboard/jadwal` — Daftar jadwal posting
- `/dashboard/drive` — Konversi link Google Drive
- `/dashboard/ai` — AI Caption Generator
- `/dashboard/analitik` — Statistik (placeholder)
- `/dashboard/settings` — Konfigurasi

### API Routes

- `POST /api/posts` — Buat post (draft/scheduled)
- `POST /api/posts/publish` — Posting langsung ke IG
- `POST /api/ai/caption` — Generate caption AI
- `GET /api/instagram/test` — Test koneksi IG
- `GET /api/cron/post` — Cron auto-posting (Vercel Cron)
- `GET /api/init?secret=X` — Inisialisasi DB (sekali pakai)

## Cron Schedule

Default: setiap 5 menit cek post yang dijadwalkan dan posting yang sudah jatuh tempo.

Konfigurasi di `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/post", "schedule": "*/5 * * * *" }
  ]
}
```

**Catatan:** Vercel Hobby plan terbatas pada 1 cron/hari. Untuk testing yang lebih sering, perlu Pro plan atau pindah ke VPS dengan cron native.

## Migrasi ke VPS (nanti)

Stack-nya portable. Untuk migrasi:
1. Database: dump dari Vercel Postgres → restore ke PostgreSQL di VPS
2. Cron: ganti `vercel.json` dengan cron native (`crontab -e`)
3. Build: `npm run build && npm start`
4. Reverse proxy: nginx/caddy

## Keamanan

- Token IG, Gemini key, dan password disimpan **hanya** di env variables
- File `.env.local` tidak ter-commit (di-ignore via `.gitignore`)
- Endpoint sensitif (`/api/init`, `/api/cron/post`) dilindungi secret
- Auth bypass hanya aktif di non-production environment
