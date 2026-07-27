# Deployment Checklist: Clerk Authentication

## Pre-Deployment (Do This First!)

### 1. Database Migration Applied ✓
```sql
-- Run in Neon SQL Editor
ALTER TABLE users
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Verify columns exist:
SELECT column_name FROM information_schema.columns WHERE table_name='users';
```

**Expected columns:**
- ✅ clerk_id (TEXT, nullable)
- ✅ profile_photo_url (TEXT, nullable)
- ✅ bio (TEXT, nullable)
- ✅ password_hash (TEXT, nullable) ← Must be nullable now

**Status:** [ ] Done / [ ] Not Done / [ ] Already Done

---

### 2. Clerk Application Created ✓

1. Go to https://dashboard.clerk.com
2. Create app or select existing one
3. Note the app name: ___________________
4. **Copy API Keys:**
   - Publishable Key: `pk_test_` _______________
   - Secret Key: `sk_test_` _______________

**Status:** [ ] Done / [ ] Not Done / [ ] Already Done

---

### 3. Clerk Redirect URLs Configured ✓

In Clerk Dashboard → Settings → URLs, add:
- [ ] `http://localhost:3000` (for testing)
- [ ] `https://weathpath-nd.vercel.app` (live)

**Status:** [ ] Done / [ ] Not Done / [ ] Already Done

---

### 4. Local .env.local Set Up ✓

Create `/vercel/share/v0-project/.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL=postgresql://...
```

**Status:** [ ] Done / [ ] Not Done / [ ] Already Done

---

### 5. Test Locally ✓

```bash
npm run dev
```

- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3000/signup
- [ ] Can sign up with email
- [ ] Email verification works
- [ ] Redirected to /dashboard
- [ ] Dashboard shows user info
- [ ] Browser console shows `[v0] Clerk session found`
- [ ] Database query shows new user with clerk_id set

**Status:** [ ] Passed / [ ] Failed → Go back to troubleshooting

---

## Vercel Deployment

### 6. Vercel Environment Variables ✓

Go to: https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables

Add all 6 variables (select ALL environments: Production, Preview, Development):

| Variable | Value |
|---|---|
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | pk_test_... |
| CLERK_SECRET_KEY | sk_test_... |
| NEXT_PUBLIC_CLERK_SIGN_IN_URL | /login |
| NEXT_PUBLIC_CLERK_SIGN_UP_URL | /signup |
| NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL | /dashboard |
| NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL | /dashboard |

**Verify:**
- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists
- [ ] CLERK_SECRET_KEY exists
- [ ] DATABASE_URL exists (from Neon)
- [ ] All are set for "Production", "Preview", "Development"

**Status:** [ ] Done / [ ] Not Done / [ ] Already Done

---

### 7. Commit & Push Code ✓

```bash
cd /vercel/share/v0-project

git add -A
git commit -m "feat: Clerk authentication with database migration

- Added clerk_id column to users table
- Updated user schema to support Clerk auth
- Added profile_photo_url and bio columns
- Created migration script for existing databases
- Added complete setup and troubleshooting guides"

git push origin clerk-authentication-flow
```

**Status:** [ ] Done / [ ] Not Done / [ ] Already Done

---

### 8. Redeploy on Vercel ✓

Option A: Automatic (if GitHub connected)
- Just wait for auto-deployment after git push

Option B: Manual
```bash
vercel --prod
```

Or via dashboard:
1. Go to https://vercel.com/idd-najs-projects/weathpath-nd
2. Click "Deployments" tab
3. Find your commit
4. Click "Redeploy"

**Wait for:**
- ✅ "✓ Built successfully"
- ✅ Status = "Ready"
- ✅ Visit deployment URL

**Status:** [ ] Deployed / [ ] Deploying / [ ] Failed

---

## Post-Deployment Testing

### 9. Test Live Signup ✓

1. Go to `https://weathpath-nd.vercel.app/signup`
2. Sign up with test email
3. Verify email (check inbox)
4. Should redirect to `/dashboard`
5. Dashboard should show your user info

**Status:** [ ] Passed / [ ] Failed

---

### 10. Verify Database ✓

In Neon Dashboard SQL Editor:
```sql
SELECT email, clerk_id, role, is_active, created_at 
FROM users 
WHERE email = 'your@test.email'
LIMIT 1;
```

Should show:
- ✅ email: `your@test.email`
- ✅ clerk_id: `user_...` (NOT NULL)
- ✅ role: `user`
- ✅ is_active: `true`
- ✅ created_at: recent timestamp

**Status:** [ ] Verified / [ ] Not Visible / [ ] Error

---

### 11. Check Clerk Dashboard ✓

In https://dashboard.clerk.com → Users tab:
- [ ] Your test user appears
- [ ] Email is verified ✓
- [ ] Last sign-in is recent

**Status:** [ ] Verified / [ ] Not Visible

---

### 12. Monitor for Errors ✓

Check deployment logs for next 24 hours:

```bash
vercel logs --follow
```

Watch for errors like:
- ❌ "CLERK_SECRET_KEY is undefined"
- ❌ "column clerk_id does not exist"
- ❌ "Cannot connect to database"

If any errors, check troubleshooting guide.

**Status:** [ ] No errors / [ ] Errors found → See CLERK_AUTH_TROUBLESHOOTING.md

---

## Success Criteria

All of the following must be ✅:

- [ ] Local signup works and creates user with clerk_id
- [ ] All 6 Clerk environment variables set in Vercel
- [ ] Code pushed and deployed to Vercel
- [ ] Live signup creates user in database
- [ ] User appears in Clerk Dashboard
- [ ] User can access /dashboard after login
- [ ] New user has non-NULL clerk_id in database
- [ ] No console errors in browser
- [ ] No deployment errors in Vercel logs

---

## If Deployment Failed

**Rollback (go back to previous version):**
```bash
git revert HEAD
git push origin clerk-authentication-flow
# Vercel will auto-redeploy previous version
```

**Or debug:**
1. Check `vercel logs --follow` for exact error
2. Go to CLERK_AUTH_TROUBLESHOOTING.md
3. Find matching symptom
4. Fix issue
5. Re-deploy

---

## Post-Success

Now that auth is working:

1. **Customize login/signup pages:**
   - Edit `app/login/page.tsx`
   - Edit `app/signup/page.tsx`
   - Customize Clerk's appearance

2. **Add user dashboard features:**
   - User profile page
   - Settings page
   - Account management

3. **Set up role-based features:**
   - Admin panel
   - Protected routes
   - Content authorship

4. **Monitor production:**
   - Check error logs weekly
   - Monitor signup conversion rate
   - Track user growth

---

## Contacts & Resources

- **Clerk Support:** https://clerk.com/contact/support
- **Neon Support:** https://neon.tech/contact
- **Vercel Support:** https://vercel.com/help
- **Project Repo:** https://github.com/IDD-NAJ/weathpath.nd
- **This Guide:** DEPLOYMENT_CHECKLIST.md

---

**Version:** 1.0  
**Last Updated:** 2025-07-27  
**Status:** Ready for deployment
