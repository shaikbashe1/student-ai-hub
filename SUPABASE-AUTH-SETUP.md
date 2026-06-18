# Student AI Hub — Google Authentication with Supabase
## Complete Setup Guide

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Name it `student-ai-hub` — choose a region close to your users
4. Set a strong database password (save it securely)
5. Wait ~2 minutes for the project to provision

---

## 2. Enable Google OAuth in Supabase

1. In your Supabase project, go to **Authentication → Providers**
2. Find **Google** and toggle it **Enabled**
3. You'll need a **Google OAuth Client ID** and **Secret**:

### Get Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Go to **APIs & Services → OAuth consent screen**
   - Set app name: `Student AI Hub`
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in development
4. Go to **APIs & Services → Credentials**
5. Click **"+ Create Credentials" → OAuth Client ID**
6. Application type: **Web application**
7. Add **Authorized redirect URIs**:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   *(Replace YOUR-PROJECT-ID with your actual Supabase project ID)*
8. Copy the **Client ID** and **Client Secret**

### Back in Supabase:
- Paste the Client ID and Client Secret into the Google provider settings
- Click **Save**

---

## 3. Configure Supabase Auth Settings

In **Supabase → Authentication → Settings (URL Configuration)**:

1. Set **Site URL** to your production URL:
   ```
   https://your-domain.vercel.app
   ```
   Or for local dev: `http://localhost:3000`

2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/auth/callback
   ```

---

## 4. Set Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=your_gemini_key
```

Get your keys from: **Supabase Dashboard → Settings → API**

---

## 5. Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Sign In"** → **"Continue with Google"**

---

## How Authentication Works

```
User clicks "Continue with Google"
    ↓
supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Browser redirects to Google OAuth consent
    ↓
User approves → Google redirects to Supabase
    ↓
Supabase exchanges code → issues JWT session
    ↓
Redirects to: /auth/callback
    ↓
AuthCallback.tsx detects session → replaces URL to /
    ↓
supabase.onAuthStateChange fires SIGNED_IN event
    ↓
AuthContext.fetchOrCreateProfile() called
    ↓
POST /api/auth/supabase-login (Express backend)
    ↓
Profile created/updated in Firestore with:
  - Supabase UID (used as Firestore document ID)
  - Full Name (from Google)
  - Email
  - Profile Picture URL (from Google)
  - Role (student by default)
  - Plan (free by default)
    ↓
Profile returned to frontend → user sees their name + avatar in navbar
```

---

## Session Persistence

- Supabase stores the session in **localStorage** under the key `student_ai_hub_auth`
- On page refresh, `supabase.auth.getSession()` restores the session automatically
- Token refresh happens automatically via `autoRefreshToken: true`
- Session expires after ~1 hour but silently refreshes in the background

---

## Protected Routes

| Route | Access |
|-------|--------|
| `/` (home) | Public |
| `/assistant` (AI Chat) | Public but prompts to login for quota |
| `/tools`, `/internships`, `/hackathons`, `/blog` | Public |
| `/dashboard` | Requires auth — shows 🔒 page if not logged in |
| `/admin` | Requires auth + `role === 'admin'` |

---

## Firestore Security Rules

The `firestore.rules` file now enforces:
- **profiles**: owners can read/update their own; no self-promotion to admin
- **saved_items**: only owners can read/create/delete their bookmarks
- **chat_sessions + messages**: owner only
- **ai_tools, internships, hackathons**: public read, admin write
- **blog_posts**: published posts public, drafts admin only
- **newsletter_subscribers**: create-only (anonymous write allowed)

---

## Testing Checklist

- [ ] Click "Sign In" → "Continue with Google" → signs in successfully
- [ ] User name and profile picture appear in navbar after login
- [ ] Refresh page → user remains logged in (session persisted)
- [ ] Click logout → session cleared, redirected to home
- [ ] Navigate to `/dashboard` without login → shows "Sign In Required" screen
- [ ] Admin email (`shaikbashe1111@gmail.com`) sees "Admin Panel" link
- [ ] Email/password signup creates account and profile
- [ ] Forgot password sends reset email
- [ ] Mobile hamburger menu opens and closes correctly
- [ ] Mobile bottom navigation works on small screens

---

## Troubleshooting

**Google OAuth redirect fails:**
- Check that your Supabase redirect URL matches exactly: `/auth/callback` (no trailing slash)
- Ensure Google Cloud Console authorized redirect URI is `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

**"VITE_SUPABASE_URL not set" warning:**
- Make sure your `.env` file uses `VITE_` prefix (not `NEXT_PUBLIC_`)
- Restart the dev server after editing `.env`

**Profile not created after login:**
- Check the Express server console for `[Auth] supabase-login error:` messages
- Ensure Firebase/Firestore is accessible and the server is running
