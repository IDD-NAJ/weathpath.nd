# WealthPath - Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Code already pushed to `https://github.com/IDD-NAJ/weathpath.nd`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Neon Database**: PostgreSQL database set up and migrated
4. **API Keys**: OpenAI and Pixabay API keys ready

---

## Deployment Steps

### Step 1: Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. If not connected, click **"Connect GitHub Account"**
5. Find and select: **IDD-NAJ/weathpath.nd**
6. Click **"Import"**

### Step 2: Configure Project

Vercel will auto-detect Next.js settings:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 3: Add Environment Variables

**CRITICAL**: Add these environment variables before deploying:

Click **"Environment Variables"** and add:

#### Required Variables

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | Production, Preview, Development |
| `SESSION_SECRET` | Random 32+ character string | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-...` from OpenAI | Production, Preview, Development |
| `PIXABAY_API_KEY` | Your Pixabay API key | Production, Preview, Development |

#### How to Get Values

**DATABASE_URL**:
```
postgresql://user:password@host.neon.tech/database?sslmode=require
```
- Get from your Neon dashboard
- Make sure it includes `?sslmode=require`

**SESSION_SECRET**:
```bash
# Generate with:
openssl rand -base64 32
# Or use any password generator (32+ characters)
```

**OPENAI_API_KEY**:
- Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Format: `sk-proj-...` or `sk-...`

**PIXABAY_API_KEY**:
- Get from [pixabay.com/api/docs](https://pixabay.com/api/docs/)
- Sign up and get your API key from the dashboard

### Step 4: Deploy

1. After adding all environment variables, click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Your site will be live at: `https://your-project-name.vercel.app`

---

## Post-Deployment

### Verify Deployment

Test these pages:
- ✅ Homepage: `https://your-site.vercel.app`
- ✅ Articles: `https://your-site.vercel.app/articles`
- ✅ Stories: `https://your-site.vercel.app/stories`
- ✅ Login: `https://your-site.vercel.app/login`
- ✅ Admin Dashboard: `https://your-site.vercel.app/admin`

### Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow DNS configuration instructions

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin master
```

Vercel will:
1. Detect the push
2. Build automatically
3. Deploy to production
4. Keep previous deployments for rollback

---

## Using Vercel CLI (Alternative Method)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy to Production

```bash
# From your project directory
vercel --prod
```

The CLI will:
1. Detect Next.js framework
2. Build the project
3. Deploy to production
4. Provide the live URL

### Set Environment Variables via CLI

```bash
vercel env add DATABASE_URL production
vercel env add SESSION_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add PIXABAY_API_KEY production
```

---

## Troubleshooting

### Build Fails

**Check build logs** in Vercel dashboard:
- Look for missing dependencies
- Verify Node version compatibility (20.x)
- Check for TypeScript errors

**Common fixes**:
```bash
# Locally test the build
npm run build

# If it fails, fix errors and push again
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct in Vercel dashboard
- Ensure it includes `?sslmode=require`
- Check Neon database is active and accessible
- Verify database migrations have been run

### Environment Variables Not Working

- Ensure variables are set for **Production** environment
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)
- Public variables must start with `NEXT_PUBLIC_`

### 404 Errors on Routes

- Verify Next.js build completed successfully
- Check Vercel function logs for errors
- Ensure middleware.ts is working correctly

### API Routes Timing Out

- Check function logs in Vercel dashboard
- Verify database queries are optimized
- Increase `maxDuration` in `vercel.json` if needed (max 60s on Pro plan)

---

## Monitoring

### View Logs

1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click on a deployment
5. View **"Build Logs"** or **"Function Logs"**

### Analytics

Vercel provides built-in analytics:
- Page views
- Top pages
- Visitor insights
- Performance metrics

Access via: **Project** → **Analytics**

---

## Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ `.env.local` in `.gitignore`
- ✅ Database uses SSL (`?sslmode=require`)
- ✅ Session secret is random and secure
- ✅ API keys are valid and have appropriate permissions
- ✅ Security headers configured in `vercel.json`

---

## Performance Optimization

Already configured in `vercel.json`:
- ✅ Static asset caching (1 year)
- ✅ Security headers
- ✅ API route cache prevention
- ✅ Function timeout settings

---

## Database Migrations

**IMPORTANT**: Ensure database migrations are applied before deploying:

```bash
# Run these locally before first deployment
node scripts/fix-final-missing.js
node scripts/publish-approved-drafts.js
```

Or set up a post-deploy hook in Vercel.

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] All environment variables added
- [ ] Database migrations applied
- [ ] Build completed successfully
- [ ] Site is accessible
- [ ] Admin login works
- [ ] Database queries work
- [ ] Custom domain configured (optional)

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js on Vercel**: [vercel.com/docs/frameworks/nextjs](https://vercel.com/docs/frameworks/nextjs)
- **Neon Database**: [neon.tech/docs](https://neon.tech/docs)

---

## Your WealthPath Platform is Ready to Deploy! 🚀

Follow the steps above to get your platform live on Vercel.
