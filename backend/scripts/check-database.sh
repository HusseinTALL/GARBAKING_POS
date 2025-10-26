#!/bin/bash

# Database Check Script
# Verifies database exists and has required tables

set -e

DB_FILE="./dev.db"
REQUIRED_TABLES=("users" "categories" "menu_items" "orders" "order_items" "payments")

echo "🔍 Checking database..."

# Check if database file exists
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    echo "📝 Run: npm run db:setup"
    exit 1
fi

# Check if database is empty
DB_SIZE=$(stat -f%z "$DB_FILE" 2>/dev/null || stat -c%s "$DB_FILE" 2>/dev/null || echo "0")
if [ "$DB_SIZE" -lt 1000 ]; then
    echo "❌ Database file is empty or too small (${DB_SIZE} bytes)"
    echo "📝 Run: npm run db:setup"
    exit 1
fi

# Check for required tables
echo "🔍 Checking for required tables..."
MISSING_TABLES=()

for table in "${REQUIRED_TABLES[@]}"; do
    if ! sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q "$table"; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo "❌ Missing tables: ${MISSING_TABLES[*]}"
    echo "📝 Run: npm run db:setup"
    exit 1
fi

echo "✅ Database check passed!"
echo "✅ All required tables exist"
exit 0
