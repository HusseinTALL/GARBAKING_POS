#!/bin/bash

# Database Setup Script
# Initializes database with schema and seed data

set -e

echo "🚀 Setting up database..."

# Check if Prisma is installed
if ! command -v prisma &> /dev/null; then
    echo "⚠️  Prisma CLI not found, using npx..."
    PRISMA_CMD="npx prisma"
else
    PRISMA_CMD="prisma"
fi

# Remove old database if it exists and is invalid
if [ -f "./dev.db" ]; then
    DB_SIZE=$(stat -f%z "./dev.db" 2>/dev/null || stat -c%s "./dev.db" 2>/dev/null || echo "0")
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
DB_SIZE=$(stat -f%z "./dev.db" 2>/dev/null || stat -c%s "./dev.db" 2>/dev/null || echo "0")
echo "   Size: $DB_SIZE bytes"
echo ""

# Verify setup
if command -v sqlite3 &> /dev/null; then
    echo "📊 Table counts:"
    sqlite3 ./dev.db "SELECT 'Users: ' || COUNT(*) FROM users;
                      SELECT 'Categories: ' || COUNT(*) FROM categories;
                      SELECT 'Menu Items: ' || COUNT(*) FROM menu_items;
                      SELECT 'Orders: ' || COUNT(*) FROM orders;" 2>/dev/null || true
fi

echo ""
echo "✅ Database is ready!"
