#!/bin/bash
set -e

echo "Setting up databases..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=postgres psql -h localhost -U postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - creating databases"

# Create master database
PGPASSWORD=postgres psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'master_onboarding'" | grep -q 1 || \
PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE master_onboarding"

# Create default customer database
PGPASSWORD=postgres psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'data_onboarding'" | grep -q 1 || \
PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE data_onboarding"

echo "Databases created successfully!"
echo ""
echo "Now you can:"
echo "1. Run 'npm run start:dev' to start the application (this will auto-create tables via synchronize)"
echo "2. After tables are created, run 'npm run seed:master' to populate the master database with default data"
