#!/bin/sh
set -e

# Laporan konfigurasi di awal log; tidak menghentikan start bila gagal.
node ./scripts/check-config.mjs || echo "Cek konfigurasi error, lanjut..."

# Migrasi & seed TIDAK dijalankan di container — jalankan dari luar:
#   npx prisma migrate deploy
#   npm run db:seed   (menghapus isi tabel dump lalu isi ulang)

echo "Starting Next.js server on port $PORT..."
exec "$@"
