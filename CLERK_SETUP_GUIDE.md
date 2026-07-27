# Clerk Authentication Setup Guide

This project uses **Clerk** for authentication. If login/signup isn't creating accounts or verifying users to the dashboard, follow this troubleshooting guide.

---

## 🚀 Quick Setup

### 1. Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Click **"+ Create application"**
4. Choose your sign-up methods (Email is recommended)
5. Click **"Create"**

### 2. Get Your API Keys

1. In Clerk Dashboard, go to **API Keys** (left sidebar)
2. Copy:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Set Environment Variables

Add these to your Vercel project at https://vercel.com/idd-najs-projects/weathpath-nd/settings/environment-variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_xxx
CLERK_SECRET_KEY = sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /login
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
```

### 4. Redeploy

Redeploy your app for the environment variables to take effect.

---

## ❌ Troubleshooting

### Issue: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"

**Solution:**
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is added to **all three environments** (Production, Preview, Development)
- Redeploy after adding the variable
- If developing locally, ensure `.env.development.local` has the key

### Issue: Login page shows but sign-in fails silently

**Possible causes:**
1. **Missing database connection** - Check `DATABASE_URL` is set
2. **Clerk API keys incorrect** - Verify keys in Clerk Dashboard match your env vars
3. **Wrong Clerk instance** - Ensure you're using keys from the correct application

**Debug:**
- Open browser DevTools → Console to see error messages
- Check Clerk Dashboard → Activity for sign-in attempts
- Verify database is accessible: `DATABASE_URL` should work with `psql` command

### Issue: Users created in Clerk but don't appear in dashboard

**Possible causes:**
1. **Database not linked** - The app tries to sync Clerk users to the internal `users` table
2. **Users table missing** - Run database migrations

**Debug:**
1. Check Clerk Dashboard → Users to see if the user was created
2. Run this query in Neon:
   ```sql
   SELECT id, email, clerk_id, name FROM users ORDER BY created_at DESC LIMIT 10;
   ```
3. Verify `clerk_id` column matches the Clerk User ID

### Issue: Sign-up completes but doesn't redirect to dashboard

**Possible causes:**
1. **Finalize error** - Clerk session not being created
2. **Wrong redirect URLs** - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` not set
3. **Database sync failed** - User created in Clerk but not in internal database

**Debug:**
1. Check browser console for errors after email verification
2. In Clerk Dashboard, verify user's status is "Complete"
3. Check that `/dashboard` layout calls `getCurrentUser()` and user exists in DB

---

## 📋 How Authentication Works

1. **User signs up** → Enters email on `/signup` page
2. **Clerk creates account** → Stores in Clerk's system
3. **Email verification** → User enters OTP code
4. **Session created** → Clerk session established
5. **Finalize & redirect** → App redirects to `/dashboard`
6. **Dashboard loads** → `getCurrentUser()` syncs Clerk user to internal DB
7. **User data persists** → Clerk ID linked to internal user record

---

## 🔍 Key Files

- **Authentication Flow:**
  - `/app/login/page.tsx` - Login component (Clerk v7 API)
  - `/app/signup/page.tsx` - Signup component (Clerk v7 API)
  - `/lib/auth.ts` - `getCurrentUser()` function (syncs Clerk to DB)
  - `/proxy.ts` - Middleware (attaches Clerk context)

- **Configuration:**
  - `/app/layout.tsx` - ClerkProvider setup
  - `.env.example` - Environment variable template
  - `SET_VERCEL_ENV.md` - Vercel env setup instructions

---

## 📞 Need Help?

- **Clerk Docs:** https://clerk.com/docs
- **Clerk Support:** https://dashboard.clerk.com → Help & Support
- **This Project Docs:** Check `README.md` and other markdown files in repo root

---

## ✅ Verification Checklist

Before deploying to production, verify:

- [ ] Clerk application created at https://dashboard.clerk.com
- [ ] API keys copied to Vercel environment variables
- [ ] All 6 Clerk env vars set in Production, Preview, AND Development
- [ ] Database URL set and accessible
- [ ] Redeploy completed after adding env vars
- [ ] Can create account on `/signup`
- [ ] Email verification code received
- [ ] Redirected to `/dashboard` after signup
- [ ] User appears in database: `SELECT * FROM users WHERE email = 'test@example.com'`
- [ ] `clerk_id` column is filled (not NULL)
