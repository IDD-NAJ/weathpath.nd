# WealthPath Deployment Script for PowerShell
# This script prepares the application for Vercel deployment

Write-Host "🚀 Preparing WealthPath for deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found. Creating template..." -ForegroundColor Yellow
    $envContent = @"
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# Session Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key"

# App URL (for production)
NEXTAUTH_URL="https://your-domain.vercel.app"
"@
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "📝 Created .env.local template. Please update with your actual values." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
node scripts/run-simple-migrations.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database migrations failed" -ForegroundColor Red
    exit 1
}

# Verify all routes
Write-Host "🔍 Verifying all routes..." -ForegroundColor Blue
node scripts/verify-all-routes.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Route verification failed" -ForegroundColor Red
    exit 1
}

# Test build
Write-Host "🏗️  Testing production build..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors before deploying." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Build successful!" -ForegroundColor Green
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "📝 Creating .gitignore..." -ForegroundColor Blue
    $gitignoreContent = @"
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
"@
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
}

# Create uploads directory
New-Item -ItemType Directory -Force -Path "public/uploads" | Out-Null
New-Item -ItemType File -Force -Path "public/uploads/.gitkeep" | Out-Null

# Git setup
Write-Host "🔧 Setting up Git repository..." -ForegroundColor Blue
if (-not (Test-Path ".git")) {
    git init
    Write-Host "📝 Initialized Git repository" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Check if remote exists
try {
    $remoteUrl = git remote get-url origin 2>$null
    if (-not $remoteUrl) {
        Write-Host "⚠️  No Git remote found. Please add your GitHub repository:" -ForegroundColor Yellow
        Write-Host "   git remote add origin <your-github-repo-url>" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Git remote already configured" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  No Git remote found. Please add your GitHub repository:" -ForegroundColor Yellow
    Write-Host "   git remote add origin <your-github-repo-url>" -ForegroundColor Yellow
}

# Stage files
Write-Host "📋 Staging files..." -ForegroundColor Blue
git add .

# Check if there are changes to commit
try {
    $stagedChanges = git diff --staged --quiet 2>$null; $LASTEXITCODE -eq 1
    if (-not $stagedChanges) {
        Write-Host "✅ No changes to commit" -ForegroundColor Green
    } else {
        Write-Host "📝 Ready to commit changes:" -ForegroundColor Yellow
        Write-Host "   git commit -m 'Ready for Vercel deployment'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "📝 Ready to commit changes:" -ForegroundColor Yellow
    Write-Host "   git commit -m 'Ready for Vercel deployment'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update .env.local with your actual environment variables" -ForegroundColor White
Write-Host "   2. Add your GitHub repository as remote: git remote add origin <repo-url>" -ForegroundColor White
Write-Host "   3. Commit changes: git commit -m 'Ready for Vercel deployment'" -ForegroundColor White
Write-Host "   4. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host "   5. Import your repository in Vercel and configure environment variables" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Required Vercel environment variables:" -ForegroundColor Cyan
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "   - NEXTAUTH_URL" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see README.md" -ForegroundColor Cyan
