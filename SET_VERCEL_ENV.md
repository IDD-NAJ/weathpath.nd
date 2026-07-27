# Set Vercel Environment Variables

## ⚠️ IMPORTANT: Clerk Authentication Required

**This app requires Clerk for authentication.** Before setting any environment variables, you must:

1. **Create a Clerk account** at https://dashboard.clerk.com
2. **Create an application** in Clerk dashboard
3. **Copy your API keys** from Clerk dashboard (Publishable Key and Secret Key)

---

## Option 1: Via Vercel Dashboard (EASIEST - RECOMMENDED)

1. Go to: https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables

2. Click **"Add New"** and add each variable:

### NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (REQUIRED)
```
Get from: https://dashboard.clerk.com → [Your Application] → API Keys
Format: pk_test_... or pk_live_...
```
✅ Select: Production, Preview, Development

### CLERK_SECRET_KEY (REQUIRED)
```
Get from: https://dashboard.clerk.com → [Your Application] → API Keys
Format: sk_test_... or sk_live_...
```
✅ Select: Production, Preview, Development

### NEXT_PUBLIC_CLERK_SIGN_IN_URL
```
Value: /login
```
✅ Select: Production, Preview, Development

### NEXT_PUBLIC_CLERK_SIGN_UP_URL
```
Value: /signup
```
✅ Select: Production, Preview, Development

### NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
```
Value: /dashboard
```
✅ Select: Production, Preview, Development

### NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
```
Value: /dashboard
```
✅ Select: Production, Preview, Development

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

**Note**: Replace the placeholder values with your actual values

### Step 1: Add Clerk Keys (REQUIRED - Do this first!)

```powershell
# Get your keys from https://dashboard.clerk.com → API Keys

# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo "pk_test_YOUR_PUBLISHABLE_KEY_HERE" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "pk_test_YOUR_PUBLISHABLE_KEY_HERE" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
echo "pk_test_YOUR_PUBLISHABLE_KEY_HERE" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development

# CLERK_SECRET_KEY
echo "sk_test_YOUR_SECRET_KEY_HERE" | vercel env add CLERK_SECRET_KEY production
echo "sk_test_YOUR_SECRET_KEY_HERE" | vercel env add CLERK_SECRET_KEY preview
echo "sk_test_YOUR_SECRET_KEY_HERE" | vercel env add CLERK_SECRET_KEY development

# Clerk URL Configuration
echo "/login" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
echo "/login" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL preview
echo "/login" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL development

echo "/signup" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
echo "/signup" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL preview
echo "/signup" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL development

echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL preview
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL development

echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL preview
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL development
```

### Step 2: Add Other Required Variables

```powershell
# DATABASE_URL
echo "YOUR_DATABASE_URL_HERE" | vercel env add DATABASE_URL production
echo "YOUR_DATABASE_URL_HERE" | vercel env add DATABASE_URL preview
echo "YOUR_DATABASE_URL_HERE" | vercel env add DATABASE_URL development

# SESSION_SECRET
echo "YOUR_SESSION_SECRET_HERE" | vercel env add SESSION_SECRET production
echo "YOUR_SESSION_SECRET_HERE" | vercel env add SESSION_SECRET preview
echo "YOUR_SESSION_SECRET_HERE" | vercel env add SESSION_SECRET development

# OPENAI_API_KEY
echo "YOUR_OPENAI_API_KEY_HERE" | vercel env add OPENAI_API_KEY production
echo "YOUR_OPENAI_API_KEY_HERE" | vercel env add OPENAI_API_KEY preview
echo "YOUR_OPENAI_API_KEY_HERE" | vercel env add OPENAI_API_KEY development

# PIXABAY_API_KEY
echo "YOUR_PIXABAY_API_KEY_HERE" | vercel env add PIXABAY_API_KEY production
echo "YOUR_PIXABAY_API_KEY_HERE" | vercel env add PIXABAY_API_KEY preview
echo "YOUR_PIXABAY_API_KEY_HERE" | vercel env add PIXABAY_API_KEY development
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
