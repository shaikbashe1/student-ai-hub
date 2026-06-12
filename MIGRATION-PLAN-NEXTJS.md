# Student AI Hub Migration & Integration Master Plan
### Decoupling Vite to Next.js 15 with Clerk Authentication & Supabase RLS

This guide details the complete production-grade architectural plan to transition from the current single-page React-Vite SPA to **Next.js 15 App Router** using **Clerk Authentication**, a relational **Supabase PostgreSQL database**, and robust **PostgreSQL Row-Level Security (RLS)**.

---

## 🚀 1. Required Packages (Dependencies)
Run this command in the root folder of your newly initialized Next.js 15 project:

```bash
npm install @clerk/nextjs @supabase/supabase-js svix lucide-react motion react-markdown
npm install -D typescript @types/node tailwindcss @tailwindcss/postcss postcss
```

* **`@clerk/nextjs`**: Next.js 15 SDK for server-side auth assertions, layouts, session middleware, and account UI.
* **`@supabase/supabase-js`**: Unified database/auth controller client.
* **`svix`**: Official cryptographic library to securely verify SVIX signatures originating from Clerk webhooks.

---

## 📂 2. Next.js 15 App Router Directory Map
The following illustrates the recommended folder structure following the Next.js 15 guidelines:

```text
student-ai-hub/
├── .env.local                    # Secrets & Key Config (Clerk + Supabase)
├── vercel.json                   # Custom deployment headers and security settings
├── supabase-schema.sql           # Database schema containing all tables & RLS
├── public/                       # Image assets and icons
└── src/
    ├── middleware.ts             # Clerk auth + role checker routing gateway (CREATED)
    ├── app/
    │   ├── layout.tsx            # Global html, fonts, and <ClerkProvider> wrapper
    │   ├── page.tsx              # Public Welcome Landing Hero
    │   ├── sign-in/[[...sign-in]]/page.tsx # Protected auth routing screen
    │   ├── sign-up/[[...sign-up]]/page.tsx # Protected auth routing screen
    │   ├── dashboard/            # Student Private Workspace (Protected)
    │   │   └── page.tsx
    │   ├── chats/                # Student Interactive AI Chat Canvas (Protected)
    │   │   └── page.tsx
    │   ├── admin/                # Administrator Panel workspace (Strictly Protected)
    │   │   └── page.tsx
    │   ├── blog/                 # Public Strategic Hub publication roll
    │   │   ├── page.tsx
    │   │   └── [slug]/page.tsx
    │   └── api/
    │       ├── webhooks/
    │       │   └── clerk/route.ts # Direct Clerk SVIX Profile Syncer (CREATED)
    │       └── ai/chat/route.ts  # Protected server-side Gemini streaming endpoint
    ├── components/               # Pure React functional UI view widgets
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   └── ui/                   # Reusable atomic elements
    ├── hooks/
    │   └── useSupabase.ts        # Client-side dynamic token authorization hook (CREATED)
    ├── lib/
    │   ├── supabaseClient.ts     # Client instantiater with dynamic Clerk token (CREATED)
    │   └── supabaseServer.ts     # Server component + admin service credentials (CREATED)
    └── types.ts                  # Shared TypeScript models (UPDATED)
```

---

## 🛠️ 3. Integration & Configuration Code Blueprints

### A. Core Next 15 Layout (`src/app/layout.tsx`)
Initialize the Clerk context wrapper at the absolute root of your runtime hierarchy:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "@/app/globals.css"; // Your Tailwind output imports

export const metadata = {
  title: "Student AI Hub",
  description: "Accelerate your academic and professional path with verified AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark, // Configures Clerk elements with dark theme match
        variables: {
          colorPrimary: "#4f46e5", // Indigo accent match to theme palette
        },
      }}
    >
      <html lang="en" className="dark scroll-smooth">
        <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

### B. Clerk-to-Supabase Secure Session Bridge
To ensure Supabase knows which Clerk user is executing queries, you must configure Clerk to mint a custom JWT containing Clerk's user identity format.

#### Step 1: Add a JWT template in the Clerk Dashboard
1. Go to your **Clerk Dashboard** -> Menu -> **JWT Templates**.
2. Click **New Template** and choose **Supabase** from the wizard.
3. Keep the default template properties (it inserts the user's Clerk ID into the standard JWT `sub` claim).
4. Save the template under the required name: `supabase` (this name must match your code `getToken({ template: 'supabase' })`).

#### Step 2: Configure Client-Side Components with `useSupabase()`
When your Client Components need to execute reads and writes (e.g. adding bookmarks or fetching current chat tables), use the constructed custom hook:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useUser } from "@clerk/nextjs";

export default function SavedItemsWidget() {
  const { user } = useUser();
  const supabase = useSupabase();
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Secure auth.user_id() check occurs within postgres automatically using Clerk's JWT header
    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*");
      
      if (!error && data) {
        setBookmarks(data);
      }
    };

    fetchBookmarks();
  }, [user, supabase]);

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <h3 className="text-sm font-bold text-slate-100">Saved Items ({bookmarks.length})</h3>
    </div>
  );
}
```

---

### C. Clerk User Profile Synchronization (Server Webhook)
The system requires that whenever a student signs up, their profiles list is synchronized securely. We have pre-built the SVIX secure receiver file for this:
👉 **File Location**: `src/app/api/webhooks/clerk/route.ts`

**How to activate User Synchronization:**
1. Navigate to **Clerk Dashboard** -> **Webhooks**.
2. Click **Add Endpoint**.
3. Set your production/staging endpoint URL: `https://your-domain.vercel.app/api/webhooks/clerk`.
4. Subscribe to these events:
   * `user.created`
   * `user.updated`
   * `user.deleted`
5. Copy your **Signing Secret** (it begins with `whsec_...`).
6. Insert this secret into your Vercel Environment Variables or `.env.local` as `CLERK_WEBHOOK_SECRET`.

---

## 🛡️ 4. Role-Based Access Control (RBAC)
We enforce security at **three separate layers** of the application logic:

1. **Routing Layer (Middleware)**:
   Our pre-configured `/src/middleware.ts` interceptor matches administrative folders (`/admin(.*)` or `/api/admin(.*)`). It retrieves JWT session claims and terminates access for non-administrators, returning standard HTTP responses or secure landing redirects.
2. **Database Layer (RLS Policies)**:
   The postgres schema restricts standard read/write logic using the helper rule: `auth.is_admin()`. Admins have unrestricted CRUD privileges across AI Tools, Internships, Hackathons, and Blog datasets.
3. **Internal API Verification Layer (Route Handlers)**:
   When developing custom protected API routes (e.g. `/api/admin/rebuild-index`), assert role authorization server-side immediately:

```ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  
  // Double Guard: Verify authorization identity
  if (!session.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userEmail = session.sessionClaims?.email as string || "";
  const ADMIN_EMAIL = "shaikbashe1111@gmail.com";

  if (userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return new NextResponse("Forbidden resources. Admins only.", { status: 403 });
  }

  // Safe to proceed with admin tasks...
  return NextResponse.json({ success: true });
}
```

---

## 📁 5. Complete Database Migration Commands
Execute this migration SQL directly to prepare your Supabase instance:

1. Log in to your **Supabase Dashboard** (https://supabase.com).
2. Choose your project **Student AI Hub**.
3. Under the navigation sidebar, click on **SQL Editor**.
4. Click **New query**.
5. Open the file `/supabase-schema.sql` from your Workspace and copy its complete contents.
6. Paste the contents into the query box and click **Run**.
7. Validate that all tables (`profiles`, `ai_tools`, `internships`, `hackathons`, `blog_posts`, `bookmarks`, `chats`, `chat_messages`, `notifications`) are generated, alongside target indices and triggers.

---

## ☁️ 6. Vercel Deployment Checklist

Follow these exact steps to launch **Student AI Hub** in production with zero friction:

### Step 1: Put Code on GitHub
Push this optimized Next.js 15 repository onto your connected GitHub account.

### Step 2: Initialize Vercel Project
1. Open **Vercel Dashboard** (https://vercel.com) and click **Add New** -> **Project**.
2. Connect your GitHub account and import your repository.
3. Verify that Vercel auto-recognizes **Next.js** as the deployment framework.

### Step 3: Configure Environment Variables
Expand the **Environment Variables** panel in Vercel and input these exact keys:

| Environment Variable | Source / Value | Exposure |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk -> API Keys -> Publishable Key | 🌐 Public |
| `CLERK_SECRET_KEY` | Clerk -> API Keys -> Secret Key | 🔒 Server-Only |
| `CLERK_WEBHOOK_SECRET` | Clerk -> Webhooks -> Endpoint Signing Secret | 🔒 Server-Only |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase -> Settings -> API -> Project URL | 🌐 Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase -> Settings -> API -> Anon public key | 🌐 Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase -> Settings -> API -> service_role key | 🔒 Server-Only |
| `GEMINI_API_KEY` | Google AI Studio -> API Keys | 🔒 Server-Only |

### Step 4: Click Deploy 🚀
Vercel will stream your build, compile the server entry paths, bundle routes statically, and output the production deployment URL!
