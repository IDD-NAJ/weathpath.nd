# Complete Clerk Authentication Setup Guide

## Overview

This project uses **Clerk.com** for authentication. Clerk handles login, signup, password management, and user sessions. The app database syncs with Clerk and stores user data in a PostgreSQL `users` table.

---

## Phase 1: Prerequisites

### What You Need
- A Clerk account (free tier is fine): https://clerk.com
- A Neon PostgreSQL database: https://neon.tech
- Vercel project deployed: https://vercel.com

### Check Your Current State
1. Database exists and is running
2. You have Clerk API keys ready (or will create them next)

---

## Phase 2: Clerk Account Setup (5 minutes)

### Step 1: Create Clerk Application
1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Click **"Create Application"**
4. Choose your sign-in methods:
   - ✅ **Email** (required - uses verification codes or links)
   - ✅ **Password** (recommended)
   - ❌ Leave other OAuth methods disabled for now
5. Click **"Create Application"**

### Step 2: Copy Your API Keys
1. In Clerk Dashboard, go to **"API Keys"** section (left sidebar → API Keys)
2. Copy these two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`) → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** (starts with `sk_test_` or `sk_live_`) → `CLERK_SECRET_KEY`

### Step 3: Configure Clerk URLs (Important!)
1. Still in Clerk Dashboard, go to **"Instances & Settings"** → **"Settings"** tab
2. Scroll to **"URLs"** section
3. Set **Allowed redirect URLs** to include:
   - `http://localhost:3000` (for local development)
   - `https://your-domain.vercel.app` (your deployed URL)
4. Click **Save**

---

## Phase 3: Database Migration (10 minutes)

### Critical Step: Add clerk_id Column

The database needs a `clerk_id` column to link Clerk users to your app's database. If you created the app recently, the schema might not have this yet.

#### Option A: Using Neon SQL Editor (Easiest)
1. Go to Neon Dashboard: https://console.neon.tech
2. Select your project and database
3. Click **"SQL Editor"** tab
4. Run this script:

```sql
-- Add clerk_id and profile columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Make password_hash nullable (not needed with Clerk)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Create index for fast clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Verify the migration worked
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

5. Click **"Execute"**
6. Verify you see these columns in the results:
   - `clerk_id` (yes, nullable)
   - `profile_photo_url` (yes, nullable)
   - `bio` (yes, nullable)
   - `password_hash` (yes, nullable)

#### Option B: Using Migration Script
1. Connect to your Neon database via CLI:
```bash
psql "postgresql://user:password@host.neon.tech/database?sslmode=require" < scripts/004-add-clerk-columns.sql
```

#### Troubleshooting Migration
- **Error: "column clerk_id already exists"** → Good! Migration is already applied
- **Error: "no such table: users"** → Run `scripts/002-create-users.sql` first
- **Error: "ALTER TABLE ... ALTER COLUMN"** → Already nullable, that's fine

---

## Phase 4: Vercel Environment Variables (5 minutes)

### Add Variables to Your Vercel Project

1. Go to: https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables

2. Add each variable (click **"Add New"** for each):

| Variable Name | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard (pk_test_...) | Production, Preview, Development |
| `CLERK_SECRET_KEY` | From Clerk Dashboard (sk_test_...) | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/signup` | Production, Preview, Preview, Development |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | Production, Preview, Development |

3. Make sure `DATABASE_URL` is also set (it should already be there from Neon)

### Using Vercel CLI Instead
```bash
# From project directory
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Paste your key, select all environments

vercel env add CLERK_SECRET_KEY
# Paste your key, select all environments

vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL
# Type: /login, select all environments

# ... repeat for other variables
```

---

## Phase 5: Test Locally (10 minutes)

### 1. Update Local .env.local

Create/update `/vercel/share/v0-project/.env.local`:

```env
# Clerk Keys (copy from https://dashboard.clerk.com/api-keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (from Neon)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Optional: OpenAI and Pixabay
OPENAI_API_KEY=sk-proj-...
PIXABAY_API_KEY=...
```

### 2. Start Dev Server

```bash
cd /vercel/share/v0-project
npm run dev
```

### 3. Test Auth Flow

1. Open http://localhost:3000/signup
2. Sign up with an email address
3. Verify email (check inbox or use Clerk's test mode)
4. Should redirect to `/dashboard`
5. Open browser console (F12) and look for `[v0] Clerk session found: { userId: 'user_...' }`
6. Check database: query `SELECT email, clerk_id FROM users` - your new user should appear

---

## Phase 6: Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: Add Clerk authentication with database migration"
git push origin clerk-authentication-flow
```

### 2. Redeploy
1. Go to https://vercel.com/idd-najs-projects/weathpath-nd
2. Click **Deployments** tab
3. Find the latest commit from your branch
4. Click **Redeploy**
5. Wait for deployment to complete

### 3. Test Live URL
1. Go to `https://weathpath-nd-[vercel-id].vercel.app/signup`
2. Sign up with a test email
3. Verify email
4. Should redirect to `/dashboard`

---

## Phase 7: Troubleshooting

### Issue: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"

**Cause:** Environment variable not added to Vercel

**Fix:**
1. Go to Vercel Settings → Environment Variables
2. Verify the variable is there with correct value
3. Redeploy the app
4. Wait 30 seconds for new deployment

### Issue: "Cannot POST /auth/callback/clerk"

**Cause:** Clerk redirect URL not configured properly

**Fix:**
1. In Clerk Dashboard → Settings → URLs
2. Add your Vercel domain to **"Allowed redirect URLs"**
3. Wait 1-2 minutes for Clerk to sync
4. Try signing in again

### Issue: Sign up works but user doesn't appear in `/dashboard`

**Cause:** User not being created in database

**Fix:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs starting with `[v0]`
4. Check for errors like "Failed to create user" or "Error resolving Clerk user"
5. If you see "INSERT INTO users failed", the migration might not be applied
6. Verify `clerk_id` column exists by running: `SELECT column_name FROM information_schema.columns WHERE table_name='users'`

### Issue: "Error: CLERK_SECRET_KEY not found"

**Cause:** Secret key not in environment

**Fix:**
1. This is expected for public pages
2. But if it happens on `/dashboard` or other protected routes, the env var wasn't deployed
3. Verify in Vercel settings it says "Production" and "Development"
4. Redeploy with `vercel --prod`

### Issue: Users created multiple times with different clerk_id

**Cause:** Database not getting `clerk_id` when user is created

**Fix:**
1. Check `lib/auth.ts` is using `clerk_id = ${clerkId}` in INSERT
2. Verify Clerk SDK is working: `npm list @clerk/nextjs`
3. Clear browser cookies and try again

---

## Success Checklist

After completing all steps, verify:

- [ ] Clerk application created and API keys copied
- [ ] Clerk redirect URLs configured for your domain
- [ ] Database migration applied (clerk_id column added)
- [ ] Vercel environment variables set (all 6 Clerk vars)
- [ ] Local `.env.local` has test keys
- [ ] Dev server starts without errors
- [ ] Can sign up on `/signup` page
- [ ] Email verification works
- [ ] Redirected to `/dashboard` after signup
- [ ] New user appears in database with `clerk_id` set
- [ ] Dashboard shows logged-in user info
- [ ] Deployed to Vercel
- [ ] Live signup works end-to-end

---

## Key Files Reference

- **Auth logic:** `lib/auth.ts` - Handles Clerk → DB sync
- **Middleware:** `proxy.ts` - Protects routes, syncs user
- **User schema:** `scripts/002-create-users.sql` - Database structure
- **Migration:** `scripts/004-add-clerk-columns.sql` - Adds clerk_id
- **Login page:** `app/login/page.tsx` - `<SignIn />` component
- **Signup page:** `app/signup/page.tsx` - `<SignUp />` component
- **Dashboard:** `app/dashboard/page.tsx` - Protected route
- **Clerk provider:** `app/layout.tsx` - ClerkProvider wrapper

---

## Support & Resources

- **Clerk Docs:** https://clerk.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Next.js Auth:** https://nextjs.org/docs/authentication
- **This project's auth:** See `lib/auth.ts` for implementation details

---

## Next Steps After Setup

1. ✅ Authentication working? 
2. Customize sign-in/sign-up pages:
   - Edit `app/login/page.tsx` and `app/signup/page.tsx`
   - Customize Clerk's appearance and behavior
3. Add role-based features:
   - Use `requireAdmin()` in server components
   - Check `user.role` for UI changes
4. Set up account settings page:
   - Use `<UserButton />` component from Clerk
   - Let users manage profile, email, password

---

**Version:** 1.0  
**Last Updated:** 2025-07-27  
**Status:** Complete setup guide for weathpath.nd with Clerk auth
