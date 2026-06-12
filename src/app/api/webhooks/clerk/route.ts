import { Webhook } from "svix";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabaseServer";

// Type definitions for the anticipated Clerk webhook payload structure
interface ClerkWebhookEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkWebhookUserCreated {
  id: string; // The Clerk User ID
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkWebhookEmailAddress[];
  primary_email_address_id: string | null;
}

// Global configuration constant for the administrator
const ADMIN_EMAIL = "shaikbashe1111@gmail.com";

/**
 * Next.js 15 POST API handler for the `/api/webhooks/clerk` endpoint
 */
export async function POST(req: Request) {
  // Retrieve the custom Clerk Webhook Secret Key from environment variables
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable.");
    return new Response("Webhook secret misconfigured.", { status: 500 });
  }

  // Grab the signature headers supplied by modern SVIX delivery
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // Validate presence of SVIX webhooks security headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix security signatures.", { status: 400 });
  }

  // Parse raw text body to preserve signature spacing integrity
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Initialize SVIX Webhook instance
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: any;

  // Verifying the integrity and origin of the payload
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
  } catch (err) {
    console.error("Signature verification failed:", err);
    return new Response("Invalid webhook signature.", { status: 400 });
  }

  // Destructure event details
  const { type } = evt;
  const data = evt.data as ClerkWebhookUserCreated;

  if (type === "user.created" || type === "user.updated") {
    const clerkUserId = data.id;
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const name = `${firstName} ${lastName}`.trim() || "Student Scholar";

    // Retrieve user's primary email address
    const primaryId = data.primary_email_address_id;
    const emailObject = data.email_addresses.find(
      (email) => email.id === primaryId
    );
    const email = emailObject ? emailObject.email_address : "";

    if (!email) {
      console.warn(`User creation event received for user ${clerkUserId} without primary email.`);
      return new Response("No verified email on payload.", { status: 400 });
    }

    // Determine user role (Automated Administrator assignment)
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "student";

    // Prepare profile dataset matching PostgreSQL database schema
    const profileRecord = {
      id: clerkUserId,
      name,
      email: email.toLowerCase(),
      role,
      daily_prompt_count: 0,
      last_prompt_date: null,
      updated_at: new Date().toISOString()
    };

    try {
      // Connect to Supabase using Admin service privileges to bypass RLS for initial provisioning
      const supabaseAdmin = createSupabaseAdminClient();

      const { error } = await supabaseAdmin
        .from("profiles")
        .upsert(profileRecord, { onConflict: "id" });

      if (error) {
        console.error("Database sync error syncing user to Supabase profiles:", error);
        return new Response("Failed to synchronize user profiles in db.", { status: 500 });
      }

      console.log(`Success: Clerk user ${clerkUserId} synchronized successfully to db as role: ${role}`);
      return new Response(JSON.stringify({ success: true, role }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (dbErr) {
      console.error("Database connectivity error inside webhook context:", dbErr);
      return new Response("Internal server database connectivity error.", { status: 500 });
    }
  }

  // Deletion logic for Clerk user account deleted events
  if (type === "user.deleted") {
    const clerkUserId = data.id;
    try {
      const supabaseAdmin = createSupabaseAdminClient();
      const { error } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", clerkUserId);

      if (error) {
        console.error("Database deletion sync error:", error);
        return new Response("Failed to process account deletion in db.", { status: 500 });
      }

      console.log(`Success: User ${clerkUserId} deleted records successfully purged.`);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (dbErr) {
      console.error("Database connectivity error on user deletion webhook:", dbErr);
      return new Response("Database connectivity error.", { status: 500 });
    }
  }

  return new Response("Processed unhandled event.", { status: 200 });
}
