#!/bin/bash

set -e

# Wait for database to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "Waiting for database connection..."
  sleep 5
done

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run seeds if SEED_DB is true
if [ "$SEED_DB" = "true" ]; then
  echo "Running database seeds..."
  npx ts-node scripts/seed.ts
fi

echo "Database setup completed successfully"