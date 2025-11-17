#!/bin/bash
set -e

# PostgreSQL Database Initialization Script
# ==========================================
# This script runs automatically when the PostgreSQL Docker container is first initialized.
# It is executed only once when the data volume is empty.
#
# Purpose:
# - Creates the master database for storing customer configurations and schema mappings
# - Ensures the default customer database is ready for data storage
#
# Note: This script is mounted from ./scripts/init-db/ to /docker-entrypoint-initdb.d/
#       in the PostgreSQL container via docker-compose.yml

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create master database for customer configurations and schema mappings
    CREATE DATABASE master_onboarding;

    -- Create default customer database for data storage
    -- Note: data_onboarding is already created as POSTGRES_DB, but we include it here for clarity
    -- If it exists, this will fail silently due to IF NOT EXISTS
    CREATE DATABASE IF NOT EXISTS data_onboarding;

    -- Grant all privileges to postgres user (already has them, but being explicit)
    GRANT ALL PRIVILEGES ON DATABASE master_onboarding TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE data_onboarding TO postgres;
EOSQL

echo "✓ Master database 'master_onboarding' created"
echo "✓ Default customer database 'data_onboarding' ready"
