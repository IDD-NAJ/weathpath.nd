# WealthPath - Netlify Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Neon Database**: Your PostgreSQL database should be set up and migrated
4. **API Keys**: Have your OpenAI and Pixabay API keys ready

## Step 1: Prepare Your Repository

Ensure all files are committed:
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## Step 2: Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your **wealthpath** repository

## Step 3: Configure Build Settings

Netlify should auto-detect Next.js settings, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20`

These are already configured in `netlify.toml`.

## Step 4: Set Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

### Required Variables

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
SESSION_SECRET=your-random-secret-here
OPENAI_API_KEY=sk-...
PIXABAY_API_KEY=...
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### How to Get These Values

1. **DATABASE_URL**: 
   - Get from your Neon dashboard
   - Format: `postgresql://user:password@host/database?sslmode=require`

2. **SESSION_SECRET**: 
   - Generate a random string (32+ characters)
   - Use: `openssl rand -base64 32` or any password generator

3. **OPENAI_API_KEY**: 
   - Get from [platform.openai.com](https://platform.openai.com/api-keys)

4. **PIXABAY_API_KEY**: 
   - Get from [pixabay.com/api/docs](https://pixabay.com/api/docs/)

5. **NEXT_PUBLIC_APP_URL**: 
   - Your Netlify site URL (e.g., `https://wealthpath.netlify.app`)

## Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (3-5 minutes)
3. Your site will be live at `https://[random-name].netlify.app`

## Step 6: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure DNS

## Step 7: Verify Deployment

After deployment, test these pages:

- ✅ Homepage: `https://your-site.netlify.app`
- ✅ Articles: `https://your-site.netlify.app/articles`
- ✅ Stories: `https://your-site.netlify.app/stories`
- ✅ Admin Login: `https://your-site.netlify.app/login`
- ✅ Admin Dashboard: `https://your-site.netlify.app/admin`

## Troubleshooting

### Build Fails

**Check build logs** in Netlify dashboard:
- Look for missing dependencies
- Verify Node version compatibility
- Check for TypeScript errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure Neon database allows connections from Netlify IPs
- Check if database migrations have been run

### Environment Variables Not Working

- Ensure variables are set in Netlify dashboard (not just `.env.local`)
- Redeploy after adding new variables
- Public variables must start with `NEXT_PUBLIC_`

### 404 Errors

- Check `netlify.toml` redirects configuration
- Verify Next.js build completed successfully
- Check Netlify function logs for API route errors

## Continuous Deployment

Netlify automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Netlify will automatically:
1. Detect the push
2. Run the build
3. Deploy the new version
4. Keep the old version as a rollback option

## Database Migrations

**Important**: Run database migrations before deploying:

```bash
# Locally, ensure migrations are applied
node scripts/fix-final-missing.js
node scripts/publish-approved-drafts.js
```

Or run them as a post-deploy script in Netlify.

## Monitoring

- **Build logs**: Netlify dashboard → Deploys → [Build]
- **Function logs**: Netlify dashboard → Functions
- **Analytics**: Netlify dashboard → Analytics

## Security Checklist

- ✅ Environment variables set in Netlify (not committed to Git)
- ✅ `.env.local` in `.gitignore`
- ✅ Database uses SSL connections
- ✅ Session secret is random and secure
- ✅ API keys are valid and have appropriate permissions

## Performance Optimization

Already configured in `netlify.toml`:
- ✅ Static asset caching (1 year)
- ✅ Security headers
- ✅ Next.js optimization plugin

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js on Netlify**: [docs.netlify.com/frameworks/next-js](https://docs.netlify.com/frameworks/next-js)
- **Neon Database**: [neon.tech/docs](https://neon.tech/docs)

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Connected repository to Netlify
- [ ] Set all environment variables
- [ ] Database migrations applied
- [ ] Build completed successfully
- [ ] Site is accessible
- [ ] Admin login works
- [ ] Database queries work
- [ ] Custom domain configured (optional)

**Your WealthPath platform is now live!** 🎉
