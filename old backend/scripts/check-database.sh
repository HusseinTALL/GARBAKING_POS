#!/bin/bash

# Database Check Script
# Verifies database exists and has required tables

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Go to backend directory (parent of scripts/)
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
# Database file is in backend directory
DB_FILE="$BACKEND_DIR/dev.db"

REQUIRED_TABLES=("users" "categories" "menu_items" "orders" "order_items" "payments")

echo "🔍 Checking database..."
echo "📁 Database path: $DB_FILE"

# Check if database file exists
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    echo "📝 Run: npm run db:setup"
    exit 1
fi

# Check if database is empty (cross-platform)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    DB_SIZE=$(stat -f%z "$DB_FILE" 2>/dev/null || echo "0")
else
    # Linux
    DB_SIZE=$(stat -c%s "$DB_FILE" 2>/dev/null || echo "0")
fi

if [ "$DB_SIZE" -lt 1000 ]; then
    echo "❌ Database file is empty or too small (${DB_SIZE} bytes)"
    echo "📝 Run: npm run db:setup"
    exit 1
fi

# Check for required tables
echo "🔍 Checking for required tables..."
MISSING_TABLES=()

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    echo "⚠️  sqlite3 command not found, skipping table validation"
    echo "✅ Database file exists (${DB_SIZE} bytes)"
    exit 0
fi

for table in "${REQUIRED_TABLES[@]}"; do
    if ! sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" 2>/dev/null | grep -q "$table"; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo "❌ Missing tables: ${MISSING_TABLES[*]}"
    echo "📝 Run: npm run db:setup"
    exit 1
fi

echo "✅ Database check passed!"
echo "✅ Database size: ${DB_SIZE} bytes"
echo "✅ All required tables exist"
exit 0
