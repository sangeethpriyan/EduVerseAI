#!/bin/bash

# EduVerse AI - Quick Start Script
# This script sets up the development environment

set -e

echo "🚀 EduVerse AI - Quick Start Setup"
echo "=================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"

# Create .env file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created. Please update with your configuration."
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check Docker
echo ""
echo "🐳 Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    
    # Start Docker services
    echo ""
    read -p "Would you like to start Docker services now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Starting Docker services..."
        docker-compose up -d
        echo "✅ Docker services started"
        sleep 5
        
        # Wait for PostgreSQL
        echo "⏳ Waiting for PostgreSQL to be ready..."
        for i in {1..30}; do
            if docker exec eduverse-postgres pg_isready -U postgres > /dev/null 2>&1; then
                echo "✅ PostgreSQL is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "❌ PostgreSQL failed to start"
                exit 1
            fi
            echo -n "."
            sleep 1
        done
        
        # Wait for MongoDB
        echo ""
        echo "⏳ Waiting for MongoDB to be ready..."
        for i in {1..30}; do
            if docker exec eduverse-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
                echo "✅ MongoDB is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "❌ MongoDB failed to start"
                exit 1
            fi
            echo -n "."
            sleep 1
        done
    fi
fi

# Setup database
echo ""
echo "🗄️  Setting up database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ] && ! grep -q "^DATABASE_URL=" .env.local; then
    echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/eduverse_db" >> .env.local
fi

npm run db:push
npm run db:seed

echo "✅ Database setup complete"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development servers, run:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:3001"
echo ""
echo "Test credentials:"
echo "  Student: student1@eduverse.com / student123"
echo "  Teacher: teacher1@eduverse.com / teacher123"
echo "  Admin: admin@eduverse.com / admin123"
echo ""
echo "Documentation:"
echo "  - README.md - Project overview"
echo "  - DEVELOPMENT.md - Development guide"
echo "  - DEPLOYMENT.md - Deployment guide"
echo ""
