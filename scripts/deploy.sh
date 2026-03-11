#!/bin/bash

# WealthPath Deployment Script
# This script prepares the application for Vercel deployment

set -e

echo "🚀 Preparing WealthPath for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Creating template..."
    cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# Session Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key"

# App URL (for production)
NEXTAUTH_URL="https://your-domain.vercel.app"
EOF
    echo "📝 Created .env.local template. Please update with your actual values."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️  Running database migrations..."
node scripts/run-simple-migrations.js

# Verify all routes
echo "🔍 Verifying all routes..."
node scripts/verify-all-routes.js

# Test build
echo "🏗️  Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.pnpm-store/

# Production builds
.next/
out/
dist/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Uploads
public/uploads/*
!public/uploads/.gitkeep

# Database
*.sqlite
*.db

# Temporary files
*.tmp
*.temp
EOF
fi

# Create uploads directory
mkdir -p public/uploads
touch public/uploads/.gitkeep

# Git setup
echo "🔧 Setting up Git repository..."
if [ ! -d ".git" ]; then
    git init
    echo "📝 Initialized Git repository"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No Git remote found. Please add your GitHub repository:"
    echo "   git remote add origin <your-github-repo-url>"
else
    echo "✅ Git remote already configured"
fi

# Stage files
echo "📋 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "📝 Ready to commit changes:"
    echo "   git commit -m \"Ready for Vercel deployment\""
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env.local with your actual environment variables"
echo "   2. Add your GitHub repository as remote: git remote add origin <repo-url>"
echo "   3. Commit changes: git commit -m \"Ready for Vercel deployment\""
echo "   4. Push to GitHub: git push origin main"
echo "   5. Import your repository in Vercel and configure environment variables"
echo ""
echo "🔗 Required Vercel environment variables:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo ""
echo "📚 For more information, see README.md"
