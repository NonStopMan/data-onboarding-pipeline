#!/bin/bash
set -e

echo "Setting up databases..."

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Use environment variables or defaults
DB_HOST=${MASTER_DB_HOST:-localhost}
DB_PORT=${MASTER_DB_PORT:-5432}
DB_USER=${MASTER_DB_USERNAME:-postgres}
DB_PASSWORD=${MASTER_DB_PASSWORD:-postgres}
MASTER_DB=${MASTER_DB_DATABASE:-master_onboarding}
CUSTOMER_DB=${DB_DATABASE:-data_onboarding}

echo "Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Master DB: $MASTER_DB"
echo "  Default Customer DB: $CUSTOMER_DB"
echo ""

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - creating databases"

# Create master database
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$MASTER_DB'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $MASTER_DB"

echo "✓ Master database '$MASTER_DB' ready"

# Create default customer database
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$CUSTOMER_DB'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $CUSTOMER_DB"

echo "✓ Default customer database '$CUSTOMER_DB' ready"

echo ""
echo "Databases created successfully!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run start:dev' to start the application (auto-creates tables)"
echo "  2. After tables are created, run 'npm run seed:master' to populate default data"
echo "  3. Access Swagger docs at http://localhost:3000/api/docs"
