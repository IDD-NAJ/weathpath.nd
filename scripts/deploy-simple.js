const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Preparing WealthPath for deployment...')

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.')
    process.exit(1)
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
    console.log('⚠️  Warning: .env.local not found. Creating template...')
    const envTemplate = `# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# Session Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key"

# App URL (for production)
NEXTAUTH_URL="https://your-domain.vercel.app"
`
    fs.writeFileSync('.env.local', envTemplate)
    console.log('📝 Created .env.local template. Please update with your actual values.')
}

// Install dependencies
console.log('📦 Installing dependencies...')
try {
    execSync('npm install', { stdio: 'inherit' })
} catch (error) {
    console.error('❌ Failed to install dependencies')
    process.exit(1)
}

// Run database migrations
console.log('🗄️  Running database migrations...')
try {
    execSync('node scripts/run-simple-migrations.js', { stdio: 'inherit' })
} catch (error) {
    console.error('❌ Database migrations failed')
    process.exit(1)
}

// Verify all routes
console.log('🔍 Verifying all routes...')
try {
    execSync('node scripts/verify-all-routes.js', { stdio: 'inherit' })
} catch (error) {
    console.error('❌ Route verification failed')
    process.exit(1)
}

// Test build
console.log('🏗️  Testing production build...')
try {
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ Build successful!')
} catch (error) {
    console.error('❌ Build failed. Please fix the errors before deploying.')
    process.exit(1)
}

// Create .gitignore if it doesn't exist
if (!fs.existsSync('.gitignore')) {
    console.log('📝 Creating .gitignore...')
    const gitignoreContent = `# Dependencies
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
`
    fs.writeFileSync('.gitignore', gitignoreContent)
}

// Create uploads directory
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true })
    fs.writeFileSync('public/uploads/.gitkeep', '')
}

// Git setup
console.log('🔧 Setting up Git repository...')
if (!fs.existsSync('.git')) {
    try {
        execSync('git init', { stdio: 'inherit' })
        console.log('📝 Initialized Git repository')
    } catch (error) {
        console.log('⚠️  Git initialization failed, but continuing...')
    }
} else {
    console.log('✅ Git repository already exists')
}

// Check if remote exists
try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8', stdio: 'pipe' }).trim()
    if (remoteUrl) {
        console.log('✅ Git remote already configured')
    } else {
        console.log('⚠️  No Git remote found. Please add your GitHub repository:')
        console.log('   git remote add origin <your-github-repo-url>')
    }
} catch (error) {
    console.log('⚠️  No Git remote found. Please add your GitHub repository:')
    console.log('   git remote add origin <your-github-repo-url>')
}

// Stage files
console.log('📋 Staging files...')
try {
    execSync('git add .', { stdio: 'inherit' })
} catch (error) {
    console.log('⚠️  Git staging failed, but continuing...')
}

// Check if there are changes to commit
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' }).trim()
    if (status) {
        console.log('📝 Ready to commit changes:')
        console.log('   git commit -m "Ready for Vercel deployment"')
    } else {
        console.log('✅ No changes to commit')
    }
} catch (error) {
    console.log('📝 Ready to commit changes:')
    console.log('   git commit -m "Ready for Vercel deployment"')
}

console.log('')
console.log('🎉 Deployment preparation complete!')
console.log('')
console.log('📋 Next steps:')
console.log('   1. Update .env.local with your actual environment variables')
console.log('   2. Add your GitHub repository as remote: git remote add origin <repo-url>')
console.log('   3. Commit changes: git commit -m "Ready for Vercel deployment"')
console.log('   4. Push to GitHub: git push origin main')
console.log('   5. Import your repository in Vercel and configure environment variables')
console.log('')
console.log('🔗 Required Vercel environment variables:')
console.log('   - DATABASE_URL')
console.log('   - NEXTAUTH_SECRET')
console.log('   - NEXTAUTH_URL')
console.log('')
console.log('📚 For more information, see README.md')
