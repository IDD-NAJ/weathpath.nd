# Clerk Authentication Troubleshooting Guide

## Quick Diagnosis Flowchart

```
Error on signup? 
├─ No error, just nothing happens?
│  └─ → Go to "User not created in database"
├─ Error about CLERK_PUBLISHABLE_KEY?
│  └─ → Go to "Missing environment variables"
├─ Error about database connection?
│  └─ → Go to "Database migration not applied"
├─ Redirect loop (signup → login → signup)?
│  └─ → Go to "Session not persisting"
└─ User created but can't access dashboard?
   └─ → Go to "User authenticated but dashboard blocked"
```

---

## 1. Missing Environment Variables

### Symptoms
- On signup page: `Cannot read properties of undefined (reading 'frontend')`
- Console error: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set`
- Page won't load past the ClerkProvider wrapper

### Diagnosis
```bash
# Check local env
cat .env.local | grep CLERK

# Check Vercel deployment
vercel env list
```

### Solution

**For local development:**
1. Create `.env.local` in project root:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL=postgresql://...
```

2. Restart dev server:
```bash
npm run dev
```

**For Vercel deployment:**
1. Go to https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables
2. Add all 6 Clerk variables (ensure "Production" and "Preview" are selected)
3. Redeploy:
```bash
vercel --prod
```

### Verify
```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
// Should NOT be undefined
```

---

## 2. Database Migration Not Applied

### Symptoms
- Signup completes, but no error
- User should redirect to `/dashboard` but doesn't
- Browser console shows `[v0] Failed to create user in DB`
- Error: `column "clerk_id" does not exist`

### Diagnosis
```sql
-- Run in Neon SQL Editor
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

Look for these columns:
- ✅ `clerk_id` - must exist
- ✅ `profile_photo_url` - must exist
- ✅ `bio` - must exist
- ✅ `password_hash` - must be nullable (is_nullable = YES)

### Solution

**Run the migration:**
```sql
-- In Neon SQL Editor, run this entire block:

ALTER TABLE users
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

**Or use the migration script:**
```bash
psql "postgresql://user:password@host.neon.tech/db?sslmode=require" \
  < scripts/004-add-clerk-columns.sql
```

### Verify
After migration, sign up again. You should see in browser console:
```
[v0] Clerk session found: { userId: 'user_...' }
[v0] First-time sign-in: creating/linking user { email: '...', clerkId: 'user_...' }
[v0] New user created: { userId: '...', email: '...' }
```

---

## 3. User Not Created in Database

### Symptoms
- Signup completes successfully
- Redirects to dashboard
- But then page shows "Not authenticated" error
- Query database: `SELECT COUNT(*) FROM users;` returns 0 or old count

### Root Causes & Fixes

#### A. Clerk user ID not being sent to app
**Check:**
```javascript
// In browser console, after signing up:
fetch('/api/auth/verify', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log(data))
```

**Fix:** This is handled automatically by Clerk. If failing:
1. Verify Clerk redirect URLs in Dashboard → Settings
2. Should include your domain (localhost:3000 for local)

#### B. Database connection error in lib/auth.ts
**Check:**
```javascript
// In browser console:
console.log(process.env.DATABASE_URL)
// Should show the Neon connection string (censored password is ok)
```

**Fix:**
```bash
# Verify Neon connection
psql "postgresql://user:password@host.neon.tech/db?sslmode=require" \
  -c "SELECT version();"

# If connection fails, copy DATABASE_URL from Neon Dashboard
vercel env add DATABASE_URL
# Paste the full connection string
```

#### C. SQL INSERT failing silently
**Check server logs:**
```bash
# SSH into Vercel or check deployment logs
vercel logs --follow
```

**Look for errors like:**
- `duplicate key value violates unique constraint`
  - → Someone else created account with same email
  - → Delete that row and try again
- `permission denied for table users`
  - → Database user lacks INSERT permission
  - → Contact Neon support
- `INSERT failed: ...`
  - → Log the full error: edit `lib/auth.ts` line ~85

**Fix: Add more logging**
```typescript
// In lib/auth.ts, around line 80:
try {
  const created = await sql`...`
  console.log("[v0] Insert result:", created)
  return created.length > 0 ? created[0] : null
} catch (err) {
  console.error("[v0] INSERT FAILED:", err)  // ← Add this
  return null
}
```

---

## 4. Session Not Persisting (Redirect Loop)

### Symptoms
- Sign up at `/signup`
- Get redirected to `/dashboard`
- Immediately redirected back to `/login`
- Infinite loop or blank page

### Diagnosis
```javascript
// In browser console:
document.cookie  // Should show _clerk_db_jwt or similar
// If empty, Clerk session wasn't created
```

### Causes & Fixes

#### A. Clerk Redirect URL not set
**Check:** Clerk Dashboard → Instances & Settings → URLs
- Should include your domain with protocol
- Examples:
  - `http://localhost:3000`
  - `https://weathpath-nd.vercel.app`
  - `https://*.vercel.app` (wildcard)

**Fix:**
1. Add your domain to "Allowed redirect URLs"
2. Wait 30 seconds for Clerk to sync
3. Clear browser cookies and try again

#### B. middleware.ts not protecting routes
**Check:** Middleware should protect `/dashboard`
```bash
cat proxy.ts  # or middleware.ts if it exists
# Should have auth() checks for protected routes
```

**Fix:** Verify `proxy.ts` has:
```typescript
export async function middleware(request: NextRequest) {
  return authMiddleware()(request)
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
}
```

#### C. ClerkProvider not in layout
**Check:** `app/layout.tsx` should have:
```tsx
import { ClerkProvider } from "@clerk/nextjs"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

**Fix:** If missing, add it to layout.tsx

---

## 5. User Authenticated But Dashboard Blocked

### Symptoms
- Signup succeeds
- Redirected to `/dashboard`
- Error: "User not authorized" or blank page

### Diagnosis

**Check 1: Is user in database?**
```sql
SELECT email, clerk_id, role, is_active FROM users;
```
Should see your test user with `clerk_id` set and `role='user'`

**Check 2: Can you manually query the user?**
```javascript
// In browser console at /dashboard:
fetch('/api/user-check', { method: 'GET' })
  .then(r => r.json())
  .then(console.log)

// If no endpoint, create one: app/api/user-check/route.ts
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  return Response.json({ user })
}
```

**Check 3: Are auth functions working?**
```bash
# Add this to dashboard/page.tsx temporarily:
const user = await getCurrentUser()
console.log("[v0] Dashboard user:", user)
if (!user) throw new Error("User fetch failed!")
```

### Fixes

#### A. User created without clerk_id
**Problem:** User exists but `clerk_id` is NULL
**SQL to check:**
```sql
SELECT email, clerk_id, clerk_id IS NULL FROM users WHERE email = 'your@email.com';
```

**Fix:**
```sql
-- Manually link the user (dangerous! only if you know what you're doing)
UPDATE users 
SET clerk_id = 'user_2abc123def...' 
WHERE email = 'your@email.com';

-- Better: delete and signup again after fixing migration
DELETE FROM users WHERE email = 'your@email.com';
```

#### B. is_active is false
**Problem:** User was disabled
**Fix:**
```sql
UPDATE users SET is_active = true WHERE email = 'your@email.com';
```

#### C. Middleware blocking access
**Check:** `proxy.ts` should NOT block `/dashboard` if user is auth'd
```typescript
// Should allow auth'd users
if (userId) {
  return NextResponse.next()
}
// Only redirect to /login if NO userId
```

---

## 6. Clerk Dashboard Shows Activity But App Doesn't

### Symptoms
- Clerk Dashboard shows user signed up
- But app doesn't recognize them
- Refresh page doesn't help

### Diagnosis
```javascript
// In browser at /dashboard:
const { userId } = await auth()
console.log("[v0] Auth userId:", userId)

// Should print something like: user_2abc123...
```

### Causes

#### A. Clerk client ID changed
**Check:** Clerk Dashboard → Applications → Your App
- Should see "Application ID"
- Code should use the right environment variable

**Verify:**
```bash
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Should match Dashboard → API Keys → Publishable Key
```

#### B. Multiple Clerk apps confused
**Check:** Do you have multiple apps in Clerk Dashboard?
- Make sure using the right one
- Should say "Clerk" in Vercel environment

**Fix:**
1. Go to Dashboard
2. Select the right application (top dropdown)
3. Copy keys from THIS app
4. Update Vercel environment variables

#### C. Development vs. Test vs. Production keys
**Check:** Are you using `pk_test_` or `pk_live_`?
- Local: use `pk_test_`
- Production: use `pk_live_` (after going live)
- Staging: use `pk_test_`

---

## 7. Console Error: "Invalid strategy"

### Symptom
```
Error: Invalid strategy. Hint: for server-side code, use auth() or clerkClient.
```

### Cause
Trying to use `useAuth()` or `useClerk()` in Server Component

### Fix
```typescript
// ❌ Wrong - Server Component
export default function Dashboard() {
  const { userId } = useAuth()  // ← Error!
  return <div>{userId}</div>
}

// ✅ Correct - Server Component
import { getCurrentUser } from "@/lib/auth"

export default async function Dashboard() {
  const user = await getCurrentUser()
  return <div>{user?.id}</div>
}

// ✅ Correct - Client Component
"use client"
import { useAuth } from "@clerk/nextjs"

export default function Dashboard() {
  const { userId } = useAuth()
  return <div>{userId}</div>
}
```

---

## 8. Email Verification Not Working

### Symptoms
- Sign up with email
- No verification email received
- Or verification link doesn't work
- Stuck at verification screen

### Causes & Fixes

**A. Email not configured in Clerk**
1. Clerk Dashboard → Email & SMS → Email
2. Should show "Email will be sent from Clerk"
3. If says "Not configured", click "Set up"

**B. Test mode email**
- In Clerk Dashboard → Development, toggle "Allow test mode emails"
- Then use +test email: `test+anything@email.com`
- Verification code appears in Clerk Dashboard

**C. Using catch-all email?**
- Some email services don't work well with Clerk
- Try signing up with Gmail instead
- Or ask Clerk support

---

## 9. Performance: Slow Sign-up / Dashboard Load

### Causes
- Database query slow (N+1 queries, missing indexes)
- Clerk API slow (usually not the case)
- Large profile images

### Fixes
```sql
-- Ensure indexes exist:
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Check query performance:
EXPLAIN ANALYZE
SELECT id, email, name, role, is_active, created_at, profile_photo_url, bio, clerk_id
FROM users
WHERE clerk_id = 'user_2abc123...';
```

If slow, ask Neon support to optimize

---

## 10. Admin Panel Access Not Working

### Symptoms
- User signed up successfully
- But `/admin` or other admin routes show error
- `requireAdmin()` redirects to home

### Fix
```sql
-- Make user an admin in database
UPDATE users 
SET role = 'admin' 
WHERE email = 'you@email.com';
```

Then refresh the page

---

## Emergency Debug Checklist

If stuck, run through this:

```bash
# 1. Check environment
echo "Clerk Key: $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "DB URL: $DATABASE_URL"

# 2. Verify database
psql "$DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='users';"

# 3. Check for users
psql "$DATABASE_URL" -c "SELECT email, clerk_id FROM users LIMIT 5;"

# 4. Restart dev server
npm run dev

# 5. Clear cache and cookies
# In browser: DevTools → Application → Clear all

# 6. Try signup again
# Check browser console for [v0] logs
```

---

## Still Stuck?

1. **Check logs:**
   - Browser Console (F12 → Console)
   - Server logs: `vercel logs --follow`
   - Neon Dashboard → Monitor → Queries

2. **Search for error:**
   - Copy exact error message
   - Search in: Clerk docs, Neon docs, Next.js docs

3. **Ask for help:**
   - Clerk Community: https://clerk.com/docs/community
   - Neon Community: https://discord.gg/neon
   - GitHub Issues: Tag `@IDD-NAJ`

---

**Version:** 1.0  
**Last Updated:** 2025-07-27
