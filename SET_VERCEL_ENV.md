# Set Vercel Environment Variables

## Option 1: Via Vercel Dashboard (EASIEST - RECOMMENDED)

1. Go to: https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables

2. Click **"Add New"** and add each variable:

### DATABASE_URL
```
[Get from your .env.local file or Neon dashboard]
Format: postgresql://user:password@host.neon.tech/database?sslmode=require
```
✅ Select: Production, Preview, Development

### SESSION_SECRET
```
[Get from your .env.local file or generate with: openssl rand -base64 32]
```
✅ Select: Production, Preview, Development

### OPENAI_API_KEY
```
[Get from your .env.local file or https://platform.openai.com/api-keys]
Format: sk-proj-...
```
✅ Select: Production, Preview, Development

### PIXABAY_API_KEY
```
[Get from your .env.local file or https://pixabay.com/api/docs/]
```
✅ Select: Production, Preview, Development

---

## Option 2: Via Vercel CLI (PowerShell)

**Note**: Replace the placeholder values with your actual values from `.env.local`

Run these commands one by one in PowerShell:

```powershell
# DATABASE_URL
echo "YOUR_DATABASE_URL_HERE" | vercel env add DATABASE_URL production
echo "YOUR_DATABASE_URL_HERE" | vercel env add DATABASE_URL preview

# SESSION_SECRET
echo "YOUR_SESSION_SECRET_HERE" | vercel env add SESSION_SECRET production
echo "YOUR_SESSION_SECRET_HERE" | vercel env add SESSION_SECRET preview

# OPENAI_API_KEY
echo "YOUR_OPENAI_API_KEY_HERE" | vercel env add OPENAI_API_KEY production
echo "YOUR_OPENAI_API_KEY_HERE" | vercel env add OPENAI_API_KEY preview

# PIXABAY_API_KEY
echo "YOUR_PIXABAY_API_KEY_HERE" | vercel env add PIXABAY_API_KEY production
echo "YOUR_PIXABAY_API_KEY_HERE" | vercel env add PIXABAY_API_KEY preview
```

---

## After Adding Environment Variables

Once all variables are added, redeploy:

```powershell
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

---

## Quick Link

Direct link to environment variables page:
https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables
