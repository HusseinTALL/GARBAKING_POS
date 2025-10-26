#!/bin/bash

# Database Setup Script
# Initializes database with schema and seed data

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Go to backend directory (parent of scripts/)
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
# Change to backend directory for all operations
cd "$BACKEND_DIR"

echo "🚀 Setting up database..."
echo "📁 Working directory: $BACKEND_DIR"

# Check if Prisma is installed
if ! command -v prisma &> /dev/null; then
    echo "⚠️  Prisma CLI not found, using npx..."
    PRISMA_CMD="npx prisma"
else
    PRISMA_CMD="prisma"
fi

# Remove old database if it exists and is invalid
if [ -f "./dev.db" ]; then
    # Cross-platform file size check
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        DB_SIZE=$(stat -f%z "./dev.db" 2>/dev/null || echo "0")
    else
        # Linux
        DB_SIZE=$(stat -c%s "./dev.db" 2>/dev/null || echo "0")
    fi

    if [ "$DB_SIZE" -lt 1000 ]; then
        echo "🗑️  Removing invalid database file..."
        rm -f ./dev.db ./dev.db-journal
    fi
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
if ! $PRISMA_CMD generate 2>&1; then
    echo "❌ Failed to generate Prisma Client"
    echo "⚠️  This might be due to network issues. Trying with checksum ignore..."
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 $PRISMA_CMD generate || {
        echo "❌ Prisma generation failed. Please check your internet connection."
        exit 1
    }
fi

# Push schema to database
echo "📊 Pushing database schema..."
$PRISMA_CMD db push --accept-data-loss --skip-generate || {
    echo "❌ Failed to push database schema"
    exit 1
}

# Seed database
echo "🌱 Seeding database..."
npm run db:seed || {
    echo "❌ Failed to seed database"
    exit 1
}

echo "✅ Database setup complete!"
echo ""
echo "📋 Database info:"

# Cross-platform file size check
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    DB_SIZE=$(stat -f%z "./dev.db" 2>/dev/null || echo "0")
else
    # Linux
    DB_SIZE=$(stat -c%s "./dev.db" 2>/dev/null || echo "0")
fi

echo "   Path: $BACKEND_DIR/dev.db"
echo "   Size: $DB_SIZE bytes"
echo ""

# Verify setup
if command -v sqlite3 &> /dev/null; then
    echo "📊 Table counts:"
    sqlite3 ./dev.db "SELECT 'Users: ' || COUNT(*) FROM users;
                      SELECT 'Categories: ' || COUNT(*) FROM categories;
                      SELECT 'Menu Items: ' || COUNT(*) FROM menu_items;
                      SELECT 'Orders: ' || COUNT(*) FROM orders;" 2>/dev/null || true
else
    echo "⚠️  sqlite3 command not found, skipping table count verification"
fi

echo ""
echo "✅ Database is ready!"
