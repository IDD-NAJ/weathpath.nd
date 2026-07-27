# Debugging Clerk Authentication Issues

If users are signing up but not creating accounts or aren't being verified to dashboard pages, follow these debugging steps.

---

## 🔍 Step 1: Check Environment Variables

**Local Development:**
```bash
# Check .env.development.local contains:
cat .env.development.local | grep CLERK
```

Should show:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

**Production (Vercel):**
1. Go to: https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables
2. Verify these 6 variables exist in **ALL environments** (Production, Preview, Development):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

---

## 🔍 Step 2: Check Browser Console

1. Open your app's login/signup page
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Try signing up and watch for errors

**Common errors:**
- `401 Unauthorized` → Clerk keys are invalid
- `Network error` → Check Clerk API is accessible
- `ClerkProvider not initialized` → ClerkProvider missing from layout

---

## 🔍 Step 3: Check Clerk Dashboard Activity

1. Go to https://dashboard.clerk.com
2. Select your application
3. Click **Activity** (or **Users**)
4. Look for the test account you just created

**If you see the user:**
- ✅ Clerk is receiving the sign-up
- ❌ Problem is in app's database sync or redirect

**If you don't see the user:**
- ❌ Clerk is not receiving the sign-up
- Check browser console for errors (Step 2)

---

## 🔍 Step 4: Check Server Logs

When running locally (`npm run dev`), look for `[v0]` debug messages:

```
[v0] Clerk session found: { userId: 'user_xxx' }
[v0] First-time sign-in: creating/linking user { email: 'test@example.com', ... }
[v0] New user created: { userId: 'uuid', email: 'test@example.com' }
```

**If you see these messages:**
- ✅ User was created in database
- Check Step 5 (Database)

**If you DON'T see these messages:**
- ❌ Dashboard page wasn't accessed after signup
- Check redirect (Step 3)

---

## 🔍 Step 5: Check Database

Run this query in your Neon dashboard (https://console.neon.tech):

```sql
-- Check if test user exists
SELECT id, email, name, clerk_id, role, is_active, created_at 
FROM users 
WHERE email = 'test@example.com' 
LIMIT 5;
```

**If you see a row:**
- ✅ User was successfully created/linked
- Check dashboard page is rendering (Step 6)

**If you see nothing:**
- ❌ Database connection or upsert failed
- Check database logs in Neon dashboard

---

## 🔍 Step 6: Check Dashboard Page

1. After signing up successfully, you should be on `/dashboard`
2. Check if layout is showing:
   - User avatar with initials
   - User name
   - Dashboard content

**If all visible:**
- ✅ Everything is working!

**If page is blank or redirects to login:**
- Check browser console (Step 2)
- Check server logs for errors
- Run database query from Step 5

---

## 📋 Full Troubleshooting Checklist

Follow this checklist in order:

### Environment Setup
- [ ] Clerk application created at https://dashboard.clerk.com
- [ ] API keys copied correctly (no extra spaces)
- [ ] All 6 Clerk env vars set in Vercel
- [ ] Redeploy after env var changes

### Sign-Up Flow
- [ ] Can access `/signup` page
- [ ] Form submits without errors
- [ ] Verification code received in email
- [ ] Can enter code and verify
- [ ] After verification, redirected to `/dashboard`

### Account Creation
- [ ] User appears in Clerk Dashboard → Users
- [ ] User appears in database query from Step 5
- [ ] `clerk_id` column is populated (not NULL)
- [ ] `is_active` is true

### Dashboard Access
- [ ] Can see dashboard page
- [ ] User info displays correctly
- [ ] Navigation items visible
- [ ] Can click profile/settings
- [ ] Can log out

---

## 🆘 If Still Not Working

1. **Collect debug info:**
   ```
   - Clerk Application ID (from dashboard)
   - User email you tested with
   - Error message from Step 2 (browser console)
   - Server log from Step 4
   - Database query result from Step 5
   ```

2. **Check Clerk Support:**
   - https://dashboard.clerk.com → Help & Support
   - Provide your Application ID and User ID

3. **Check Neon Support:**
   - https://console.neon.tech → Support
   - Database connection issue?

---

## 🔧 Quick Fixes

### "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"
```bash
# Redeploy after adding env var
vercel --prod
```

### Sign-up succeeds but user not in database
1. Check Clerk Dashboard for the user
2. If user exists in Clerk:
   - Database connection might be failing
   - Run: `echo $DATABASE_URL | psql` to test

### Can't log back in after sign-up
1. Check `is_active` field in database
2. Query: `SELECT * FROM users WHERE email = 'xxx@example.com'`
3. If `is_active = false`, update: `UPDATE users SET is_active = true WHERE email = 'xxx@example.com'`

### Getting stuck on verification page
1. Check email for code
2. Check code hasn't expired (usually valid for 24 hours)
3. Click "Resend code" to get a new one
4. Check browser console for errors

---

## 📞 Support Resources

- **Clerk Docs:** https://clerk.com/docs
- **Clerk Support:** https://dashboard.clerk.com
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
