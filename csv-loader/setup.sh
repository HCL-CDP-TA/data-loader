#!/bin/bash

echo "=== CSV Loader Setup Script ==="
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database connection details before running the loader"
    echo
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo
echo "🎯 Setup complete!"
echo
echo "Next steps:"
echo "1. Edit .env file with your PostgreSQL connection string"
echo "2. Run 'npm run prisma:migrate' to create database tables"
echo "3. Run 'npm start' to load the CSV data"
echo
