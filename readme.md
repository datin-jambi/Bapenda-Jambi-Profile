# BAPENDA Provinsi Jambi — CMS Profile

Sistem manajemen konten (CMS) untuk website profil BAPENDA (Badan Pendapatan Daerah) Provinsi Jambi. Dibangun dengan Next.js 15, PostgreSQL, Prisma ORM, dan dideploy via Docker + GitHub Actions.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (jose + jsonwebtoken) |
| Storage | ImageKit |
| Styling | Tailwind CSS + shadcn/ui |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Struktur Aplikasi

### Halaman Publik

Website ini memiliki halaman publik yang dapat diakses oleh pengunjung:

| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Beranda | Halaman utama dengan hero, layanan cepat, berita, galeri |
| `/profil/[slug]` | Profil BAPENDA | Halaman dinamis (sejarah, visi-misi, tupoksi, struktur organisasi, pejabat) |
| `/layanan` | Informasi Layanan | Daftar layanan perpajakan daerah yang tersedia |
| `/layanan/cek-pajak` | Cek Pajak Kendaraan | Halaman pemberitahuan (fitur sedang tidak tersedia) |
| `/layanan/stage/cek-pkb` | Cek Pajak Kendaraan (stage) | Cek tagihan PKB, Opsen, Jasa Raharja, dan PNBP via API Samsat (internal, tidak terindeks) |
| `/layanan/inpo-kendaraan` | Info Kendaraan | Cari info detail kendaraan dan pelajari klasifikasi pajak |
| `/lokasi-uptd` | Lokasi UPTD | Peta dan alamat kantor UPTD se-Provinsi Jambi |
| `/berita` | Berita | Daftar berita dan informasi terkini |
| `/berita/[slug]` | Detail Berita | Artikel berita lengkap |
| `/galeri` | Galeri | Galeri foto kegiatan |
| `/galeri/[id]` | Detail Galeri | Galeri foto per kategori |
| `/regulasi` | Regulasi | Daftar peraturan dan kebijakan |
| `/faq` | FAQ | Pertanyaan yang sering diajukan |
| `/kontak` | Kontak | Informasi kontak BAPENDA |
| `/ppid/tentang` | Tentang PPID | Informasi Pejabat Pengelola Informasi dan Dokumentasi |

### Layanan Interaktif

#### Cek Pajak Kendaraan (`/layanan/stage/cek-pkb`)

Layanan untuk mengecek tagihan pajak kendaraan secara *real-time* melalui integrasi API Samsat Provinsi Jambi.

> **Catatan:** Saat ini fitur diakses melalui path internal `/layanan/stage/cek-pkb` (tidak terindeks). URL publik `/layanan/cek-pajak` menampilkan pemberitahuan bahwa fitur sedang tidak tersedia.

**Data yang ditampilkan:**
- Informasi kendaraan (nomor polisi, merek, model, tahun, warna, NJKB)
- Rincian tagihan PKB per periode (pokok + denda)
- Rincian Opsen PKB (pokok + denda)
- Rincian Jasa Raharja (SWDKLLJ) per tahun
- Rincian PNBP (STNK & TNKB)
- Total yang harus dibayar
- Invoice preview + unduh PDF

**Fitur:**
- Auto-format nomor polisi (prefix `BH` untuk Jambi)
- Deteksi status pembayaran (lunas / belum bayar / belum jatuh tempo)
- Tampilan invoice siap cetak
- Unduh invoice dalam format PDF

#### Info Kendaraan (`/layanan/inpo-kendaraan`)

Layanan untuk mencari informasi detail kendaraan berdasarkan nomor polisi, plus edukasi perpajakan kendaraan.

**Data yang ditampilkan:**
- Merek, model, jenis kendaraan
- Tahun rakitan, warna, bahan bakar
- CC mesin dan NJKB
- Masa berlaku PKB & STNK
- Lokasi transaksi terakhir

**Fitur:**
- Form pencarian nomor polisi dengan auto-format
- Tautan langsung ke Cek Pajak untuk cek tagihan
- Informasi edukatif: klasifikasi kendaraan, dasar pengenaan PKB, SWDKLLJ

### API Publik (Endpoints)

| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/public/banners` | GET | Slider banner halaman utama |
| `/api/public/news` | GET | Daftar berita publik |
| `/api/public/galleries` | GET | Galeri foto publik |
| `/api/public/faq-categories` | GET | Kategori FAQ |
| `/api/public/faqs` | GET | Daftar FAQ |
| `/api/public/regulations` | GET | Regulasi publik |
| `/api/pages/[slug]` | GET | Halaman profil dinamis |

### CMS (Halaman Admin)

CMS dapat diakses setelah login di `/cms/login`. Menu yang tersedia:

| Menu | Keterangan |
|---|---|
| Dashboard | Statistik ringkas |
| Berita | CRUD berita + kategori |
| Halaman | Kelola halaman profil (sejarah, visi-misi, dll) |
| Galeri | Kelola galeri foto |
| FAQ | Kelola pertanyaan umum |
| Regulasi | Kelola peraturan |
| UPTD | Kelola data lokasi UPTD |
| Banner | Kelola slider banner |
| Pengaturan | Konfigurasi umum aplikasi |
| Pengguna | Manajemen admin CMS |

---

## Prasyarat

- Node.js 20+
- npm 10+
- Docker + Docker Compose (untuk mode Docker)
- PostgreSQL 16 (untuk mode tanpa Docker)
- Akses ke ImageKit account

---

## 1. Installation (Local tanpa Docker)

### Clone repo

```bash
git clone <repo-url>
cd bapenda-jambi-profile
```

### Install dependencies

```bash
npm ci
```

### Setup environment

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi semua variabel:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bapenda_jambi"

JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

NEXT_PUBLIC_PKB_API_HOST="https://api-samsat.example.com"
NEXT_PUBLIC_PKB_API_TOKEN="your-api-token"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="BAPENDA Provinsi Jambi"
```

### Setup database

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev

# (Opsional) Seed data awal
npm run db:seed
```

### Jalankan dev server

```bash
npm run dev
```

Akses di `http://localhost:3000`

### Cek build

```bash
npm run build
```

---

## 2. Running dengan Docker (Local)

Mode ini menjalankan app + PostgreSQL dalam container. Cocok untuk developer yang tidak ingin setup PostgreSQL manual.

### Buat file .env.local

```bash
cp .env.example .env.local
```

Isi `DATABASE_URL` dengan nilai berikut (sesuai service `db` di docker-compose.local.yml):

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/bapenda_jambi"
```

Isi variabel lainnya sesuai kebutuhan.

### Build dan jalankan

```bash
docker compose -f docker-compose.local.yml up --build
```

App berjalan di `http://localhost:3000` dengan hot reload aktif.

### Jalankan migrasi database (pertama kali)

```bash
docker compose -f docker-compose.local.yml exec app npx prisma migrate dev
```

### Seed data awal (opsional)

```bash
docker compose -f docker-compose.local.yml exec app npm run db:seed
```

### Stop

```bash
docker compose -f docker-compose.local.yml down
```

Untuk menghapus volume database juga:

```bash
docker compose -f docker-compose.local.yml down -v
```

---

## 3. Running Staging

Staging di-trigger otomatis saat push ke branch `staging`. Tapi bisa juga dijalankan manual di server.

### Prasyarat di server staging

- Docker + Docker Compose terinstall
- File `.env.staging` sudah ada di deploy path
- Image sudah di-push ke GHCR

### Jalankan manual di server

```bash
export DOCKER_IMAGE=ghcr.io/<org>/<repo>
docker compose -f docker-compose.staging.yml pull
docker compose -f docker-compose.staging.yml up -d --remove-orphans
```

App staging berjalan di port `3001`.

### CI/CD Staging

Push ke branch `staging` akan:
1. Menjalankan lint, typecheck, dan build
2. Build Docker image dan push ke GHCR dengan tag `staging` dan `staging-<sha>`
3. SSH ke server staging dan pull + restart container

---

## 4. Running Production

Production di-trigger otomatis saat push ke branch `main`.

### Prasyarat di server production

- Docker + Docker Compose terinstall
- File `.env.production` sudah ada di deploy path
- Image sudah di-push ke GHCR

### Jalankan manual di server

```bash
export DOCKER_IMAGE=ghcr.io/<org>/<repo>
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --remove-orphans
```

App production berjalan di port `3000`.

### CI/CD Production

Push ke branch `main` akan:
1. Menjalankan lint, typecheck, dan build
2. Membutuhkan approval dari environment `production` di GitHub
3. Build Docker image dan push ke GHCR dengan tag `latest`, `production`, dan `prod-<sha>`
4. SSH ke server production dan pull + restart container

---

## 5. CI/CD Flow

```
dev branch
  └── push → CI only
        ├── Install dependencies (npm ci)
        ├── Generate Prisma client
        ├── Lint
        ├── Typecheck
        └── Build

staging branch
  └── push → CI + CD
        ├── [CI] Install, Lint, Typecheck, Build
        └── [CD] Build image → push GHCR → deploy ke staging server

main branch
  └── push → CI + CD (dengan production environment approval)
        ├── [CI] Install, Lint, Typecheck, Build
        └── [CD] Build image → push GHCR → deploy ke production server
```

---

## 6. Environment Variables

### .env.local (development)

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL lokal |
| `JWT_SECRET` | Secret key JWT access token (min 32 karakter) |
| `JWT_REFRESH_SECRET` | Secret key JWT refresh token (min 32 karakter) |
| `JWT_EXPIRES_IN` | Durasi access token, contoh: `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Durasi refresh token, contoh: `7d` |
| `IMAGEKIT_PUBLIC_KEY` | Public key ImageKit |
| `IMAGEKIT_PRIVATE_KEY` | Private key ImageKit |
| `IMAGEKIT_URL_ENDPOINT` | URL endpoint ImageKit |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | Public key ImageKit (client-side) |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | URL endpoint ImageKit (client-side) |
| `NEXT_PUBLIC_PKB_API_HOST` | Base URL API Samsat (contoh: `https://api-samsat.example.com`) |
| `NEXT_PUBLIC_PKB_API_TOKEN` | Bearer token untuk autentikasi API Samsat |
| `NEXT_PUBLIC_APP_URL` | URL aplikasi, contoh: `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Nama aplikasi |

### .env.staging / .env.production

Sama seperti `.env.local` namun nilainya disesuaikan dengan environment masing-masing. File ini **tidak di-commit** ke repository — harus dibuat manual di server.

### GitHub Actions Secrets

Secrets yang perlu dikonfigurasi di Settings → Secrets → Actions pada repository GitHub:

**Shared (semua environment):**
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`

**Dev branch:**
- `DEV_DATABASE_URL`, `DEV_JWT_SECRET`, `DEV_JWT_REFRESH_SECRET`

**Staging branch:**
- `STAGING_DATABASE_URL`, `STAGING_JWT_SECRET`, `STAGING_JWT_REFRESH_SECRET`
- `STAGING_APP_URL`
- `STAGING_SSH_HOST`, `STAGING_SSH_USER`, `STAGING_SSH_KEY`, `STAGING_SSH_PORT`
- `STAGING_DEPLOY_PATH`

**Main branch (production):**
- `PROD_DATABASE_URL`, `PROD_JWT_SECRET`, `PROD_JWT_REFRESH_SECRET`
- `PROD_APP_URL`
- `PROD_SSH_HOST`, `PROD_SSH_USER`, `PROD_SSH_KEY`, `PROD_SSH_PORT`
- `PROD_DEPLOY_PATH`

---

## 7. Docker Compose Environments

| File | Environment | Port | Digunakan oleh |
|---|---|---|---|
| `docker-compose.local.yml` | Local dev | 3000 | Developer lokal |
| `docker-compose.staging.yml` | Staging | 3001 | CI/CD staging branch |
| `docker-compose.production.yml` | Production | 3000 | CI/CD main branch |

---

## 8. Common Issues

### Install dependencies error di CI

**Gejala:** Step `Install dependencies` gagal di GitHub Actions.

**Penyebab:** Flag `--frozen-lockfile` adalah flag milik pnpm, bukan npm. `npm ci` sudah enforce lockfile secara default.

**Solusi:** Gunakan `npm ci` tanpa flag tambahan. Pastikan `package-lock.json` ter-commit dan sinkron dengan `package.json`.

---

### Docker: node_modules corrupt / module not found

**Gejala:** Error `Cannot find module` padahal sudah build.

**Penyebab:** Volume mount dari host menimpa `node_modules` di dalam container.

**Solusi:** `docker-compose.local.yml` sudah menggunakan anonymous volume untuk `node_modules` dan `.next`:

```yaml
volumes:
  - .:/app
  - /app/node_modules   # tidak tertimpa dari host
  - /app/.next
```

Jika masih bermasalah, hapus volume lama:

```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up --build
```

---

### Port conflict

**Gejala:** Error `bind: address already in use`.

**Solusi:**

```bash
# Cek proses yang menggunakan port
lsof -i :3000
lsof -i :5432

# Kill proses atau ubah port mapping di docker-compose.local.yml
```

---

### Node version mismatch

**Gejala:** Build error di lokal tapi tidak di CI, atau sebaliknya.

**Solusi:** Pastikan menggunakan Node.js 20:

```bash
node -v  # harus v20.x.x
```

Gunakan [nvm](https://github.com/nvm-sh/nvm) untuk switch versi:

```bash
nvm install 20
nvm use 20
```

---

### Prisma: Cannot find module '.prisma/client'

**Solusi:**

```bash
npx prisma generate
```

Jalankan setiap kali `prisma/schema.prisma` berubah.

---

### next build gagal karena env vars tidak ada

**Penyebab:** `next build` membutuhkan env vars (termasuk `DATABASE_URL`) untuk generate Prisma queries saat build time.

**Solusi:** Pastikan semua GitHub Actions secrets sudah dikonfigurasi di repository settings. Lihat daftar secrets di bagian [Environment Variables](#6-environment-variables).
