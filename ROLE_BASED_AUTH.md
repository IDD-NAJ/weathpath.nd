# Role-Based Authentication & Routing

WealthPath implements role-based authentication that routes users to the appropriate dashboard after login/signup based on their role in the Neon database.

## Architecture

### Authentication Flow

1. **User clicks "Sign In" or "Sign Up"**
   - Clerk component (`SignIn`/`SignUp`) handles credential verification or OAuth
   - Components use `routing="hash"` and `fallbackRedirectUrl="/auth-callback"`

2. **Clerk session established**
   - User is authenticated with Clerk
   - Redirected to `/auth-callback` page

3. **Role-based redirect**
   - `/auth-callback` page fetches user profile from `/api/user/profile`
   - Profile includes `role` field from Neon database (`'user'` or `'admin'`)
   - Based on role:
     - **`role='admin'`** → Redirects to `/admin`
     - **`role='user'`** → Redirects to `/dashboard`

4. **Dashboard loads**
   - User sees their role-specific dashboard
   - Both dashboards are protected by `requireAuth()` or `requireAdmin()` checks

## Components

### `/app/auth-callback/page.tsx`
Post-authentication callback page that:
- Waits for Clerk session to fully load
- Fetches user role from the database
- Performs the role-based redirect
- Shows a loading state ("Completing Sign In...") during the process

**Usage:** Configured as the `fallbackRedirectUrl` in Clerk `SignIn` and `SignUp` components.

### `/lib/use-role-redirect.ts`
Reusable React hook for client-side role-based redirects. Can be used in future components that need to redirect based on role without requiring a dedicated callback page.

**Not currently used** but available for extension.

## Database Schema

User role is stored in the `users` table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  clerk_id TEXT UNIQUE,      -- Links to Clerk user_xxx
  is_active BOOLEAN DEFAULT TRUE,
  ...
);
```

### Role Values
- **`'user'`** (default): Regular user with access to `/dashboard`
- **`'admin'`**: Administrator with access to `/admin`

## Redirects

### After Login/Signup

```
Clerk Auth
    ↓
/auth-callback (fetch role)
    ↓
    ├─→ role='admin' → /admin (admin dashboard)
    └─→ role='user'  → /dashboard (user dashboard)
```

### Unauthorized Access

- **Non-admin visiting `/admin`**: `admin/layout.tsx` redirects to `/dashboard`
- **Non-authenticated visiting `/dashboard`**: `dashboard/layout.tsx` redirects to `/login`
- **Non-authenticated visiting `/admin`**: `admin/layout.tsx` redirects to `/login`

## API Endpoints

### `GET /api/user/profile`
Fetches the authenticated user's profile, including role.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "is_active": true,
  "clerk_id": "user_xxx",
  "profile_photo_url": "https://...",
  "bio": "..."
}
```

**Auth:** Requires Clerk session

## Creating Admin Users

To promote a user to admin, update their role in the Neon database:

```sql
UPDATE users
SET role = 'admin'
WHERE id = '...user-id...' OR email = '...email...';
```

The change takes effect on the user's next login (new `/auth-callback` redirect).

## Testing Role-Based Routing

### Test Admin Redirect
1. Set a test user's role to `'admin'` in the database
2. Sign in as that user
3. Should see `/admin` dashboard

### Test User Redirect
1. Set a test user's role to `'user'` in the database
2. Sign in as that user
3. Should see `/dashboard`

### Test Unauthorized Access
1. Sign in as a non-admin user
2. Try to visit `/admin` directly
3. Should be redirected to `/dashboard`

## Environment & Configuration

No additional environment variables required. The system uses:
- Clerk for authentication (existing setup)
- Neon PostgreSQL for user roles (existing setup)
- Next.js server/client components for auth checks

## Future Extensions

Possible enhancements:
- Additional roles (e.g., `'moderator'`, `'analyst'`)
- Role-based API access control
- Role-based UI feature flags
- Audit logging for role changes
- Role templates with predefined permissions
