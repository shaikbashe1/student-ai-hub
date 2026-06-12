import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Declare Protected user paths
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/saved(.*)",
  "/api/user(.*)"
]);

// Declare protected administrator paths
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)"
]);

// The Admin Email provided by user
const ADMIN_EMAIL = "shaikbashe1111@gmail.com";

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // 1. Enforce Standard Authentication for Protected Student Routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // 2. Enforce Role-Based Access Control for Administrative Routes
  if (isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Retrieve active session claims to parse verified emails
    const session = await auth();
    
    // Clerk matches standard JWT session claims that contain user details. 
    // To ensure the primary email can be read safely here, ensure that custom session mapping 
    // is set in Clerk Dashboard -> Sessions -> User Claims: "email": "{{user.primary_email_address}}"
    const userEmail = session.sessionClaims?.email as string || "";

    // Fallback: If user claim is not configured, we fetch from their details if available or verify role 
    if (userEmail !== ADMIN_EMAIL) {
      // User is authenticated but NOT an administrator. Redirect safely to custom unauthorized page.
      const unauthorizedUrl = new URL("/", req.url);
      unauthorizedUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Next.js recommended matcher to audit routes while skipping internal framework files and static asset folders
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|webp|jw_auth|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
