#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || {
    echo "Migration failed, continuing anyway..."
}

# Run database seed (optional - only if needed)
echo "Running database seed..."
npm run db:seed || {
    echo "Seed skipped or failed, continuing..."
}

# Start Next.js server
echo "Starting Next.js server on port $PORT..."
exec "$@"
