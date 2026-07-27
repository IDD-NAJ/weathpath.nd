# Quick Start: Clerk Authentication (TL;DR)

## The Issue
Database was missing `clerk_id` column → users couldn't be created → signup appeared to work but nothing happened.

## The Fix
✅ Added `clerk_id` column to database  
✅ Made `password_hash` nullable  
✅ Added profile fields  
✅ Created migration script  
✅ Created complete setup & troubleshooting guides

---

## Deploy in 15 Minutes

### 1. Apply Database Migration (3 min)
Go to https://console.neon.tech → SQL Editor → Paste & Execute:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
```

### 2. Create Clerk App (3 min)
1. Go to https://dashboard.clerk.com
2. Create application → Email + Password
3. Go to API Keys → Copy:
   - Publishable Key: `pk_test_...`
   - Secret Key: `sk_test_...`
4. Go to Settings → URLs → Add your domain

### 3. Set Vercel Variables (5 min)
Go to https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables

Add (all environments):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_YOUR_KEY
CLERK_SECRET_KEY = sk_test_YOUR_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /login
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
```

### 4. Deploy (2 min)
```bash
cd /vercel/share/v0-project
git add -A && git commit -m "Apply Clerk auth fix" && git push origin clerk-authentication-flow
```

Wait for Vercel deployment.

### 5. Test (2 min)
Go to `https://weathpath-nd.vercel.app/signup`
- Sign up ✓
- Verify email ✓
- Should reach `/dashboard` ✓

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Column clerk_id not found" | Migration not applied → Run SQL above |
| "CLERK_PUBLISHABLE_KEY not set" | Not in Vercel env vars → Add it |
| Signup works but no redirect | Env vars not deployed → Redeploy |
| Can't verify email | Clerk URLs not configured → Add domain to Clerk Dashboard |

For more issues, see **CLERK_AUTH_TROUBLESHOOTING.md**

---

## Complete Guides

- **Setup:** CLERK_AUTH_COMPLETE_SETUP.md
- **Debug:** CLERK_AUTH_TROUBLESHOOTING.md
- **Deploy:** DEPLOYMENT_CHECKLIST.md
- **Overview:** README_AUTH_FIX.md

---

**Done!** Your Clerk auth is now working. 🎉
