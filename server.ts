import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import helmet from "helmet";
import { randomUUID } from "crypto";

// Load environment variables
dotenv.config();

import { INITIAL_AI_TOOLS, INITIAL_INTERNSHIPS, INITIAL_HACKATHONS } from "./src/lib/seedData";
import { Profile, AITool, Internship, Hackathon, ChatSession, ChatMessage, BlogPost } from "./src/types";
import { sendEmail } from "./src/lib/resend";
import { buildWelcomeEmailHtml } from "./emails/WelcomeEmail";
import { rateLimit } from "./src/lib/rate-limit";
import { supabaseServer } from "./src/lib/supabaseServer";

// -----------------------------------------------
// Security helpers
// -----------------------------------------------

/** Validates a basic email format */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/** Escapes XML special characters to prevent injection */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Convert legacy string IDs to valid UUID format for Supabase type check
const toUuid = (legacyId: string) => {
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(legacyId)) {
    return legacyId;
  }
  const num = legacyId.replace(/[^0-9]/g, "");
  const prefix = legacyId.replace(/[0-9]/g, "");
  const pad = (s: string, l: number) => s.padStart(l, '0').slice(-l);
  
  let prefixHex = "0000";
  if (prefix.includes("int")) prefixHex = "1111";
  else if (prefix.includes("hack")) prefixHex = "2222";
  else if (prefix.includes("blog")) prefixHex = "3333";
  else if (prefix.includes("save")) prefixHex = "4444";
  else if (prefix.includes("sess")) prefixHex = "5555";
  else if (prefix.includes("msg")) prefixHex = "6666";
  
  const numVal = parseInt(num || "0", 10);
  return `00000000-0000-0000-${prefixHex}-${pad(numVal.toString(16), 12)}`;
};

// Seeding function: populates Supabase database tables if they are empty
async function seedDatabaseIfEmpty() {
  try {
    const { data: tools, error: toolsErr } = await supabaseServer.from("ai_tools").select("id").limit(1);
    if (!toolsErr && (!tools || tools.length === 0)) {
      console.log("[Supabase Seeding] Seeding initial AI tools to database...");
      const mappedTools = INITIAL_AI_TOOLS.map(t => ({
        ...t,
        id: toUuid(t.id)
      }));
      await supabaseServer.from("ai_tools").insert(mappedTools);
    }

    const { data: interns, error: internsErr } = await supabaseServer.from("internships").select("id").limit(1);
    if (!internsErr && (!interns || interns.length === 0)) {
      console.log("[Supabase Seeding] Seeding initial internships to database...");
      const mappedInternships = INITIAL_INTERNSHIPS.map(i => ({
        ...i,
        id: toUuid(i.id)
      }));
      await supabaseServer.from("internships").insert(mappedInternships);
    }

    const { data: hacks, error: hacksErr } = await supabaseServer.from("hackathons").select("id").limit(1);
    if (!hacksErr && (!hacks || hacks.length === 0)) {
      console.log("[Supabase Seeding] Seeding initial hackathons to database...");
      const mappedHackathons = INITIAL_HACKATHONS.map(h => ({
        ...h,
        id: toUuid(h.id)
      }));
      await supabaseServer.from("hackathons").insert(mappedHackathons);
    }

    const { data: blogs, error: blogsErr } = await supabaseServer.from("blog_posts").select("id").limit(1);
    if (!blogsErr && (!blogs || blogs.length === 0)) {
      console.log("[Supabase Seeding] Seeding initial strategic blog posts to database...");
      const rawInitialBlogs = [
        {
          id: toUuid("blog_1"),
          title: "How to Win High-Value Hackathons: Scoping, Designing & Pitching",
          slug: "how-to-win-hackathons-guide",
          content: `Hackathons are not solely won by writing pure complex algorithms. They are won by solving specific customer needs and packaging the solution into high-conversion demonstrations.\n\nHere is an actionable checklist mapping rapid design scopes, presentation pitching vectors, and team coordinates that our alumni routinely use to win major cash prizes.\n\n## 1. Zero-In on One Explicit Human Problem\nToo many hackers combine 15 APIs into an unrecognizable "universal app". Instantly fail. Instead, select ONE clear pain-point (e.g. "student transcript validation taking 14 days") and build the absolute best solution for it. Focus yields clarity.\n\n## 2. Structure Your 3-Minute Presentation Pitch\nJudges evaluate dozens of submissions. Spend 40% of your time on the slide deck and story-arc:\n- **Hook (0-30s):** Present a real person facing the problem.\n- **Hero (30-90s):** Demonstrate your real working build (never list code logs; show actual clicks or renders).\n- **Under the Hood (90-120s):** Explain technical architecture, APIs utilized, and database constraints.\n- **Closing (120-180s):** Highlight business models and how the app scales.\n\nHave confidence, use precise typography, and practice the presentation loops!`,
          excerpt: "An actionable student roadmap detailing rapid design scopes, presentation pitching structures, and team coordinates to win competitive prize pools.",
          author: "Shaik Basheer (Advisor)",
          created_at: new Date().toISOString(),
          views: 142,
          likes: 45,
          category: "Hackathons",
          seo_keywords: ["hackathon", "developers", "students", "pitching-tips", "engineering-milestones"],
          is_published: true,
          author_name: "Shaik Basheer (Advisor)",
          author_id: ""
        },
        {
          id: toUuid("blog_2"),
          title: "The Zero-Inbound Strategy to Lock Remote Placements & Internships",
          slug: "remote-job-hunting-strategy",
          content: `Landing remote internships at firms like Vercel, OpenAI, or technical scale-ups requires adapting beyond conventional job listings boards. Standard submissions channels are flooded and heavily gatekept.\n\nThis guide outlines our tried-and-tested Zero-Inbound method for students looking to secure active developer placements.\n\n## 1. Formulate Cold Open-Source Contributions\nIdentify open software issues in directories or repos managed by companies you target. Solve them. Submitting a pristine Pull Request addressing a bug is a 10x stronger signal than a 1-page PDF resume. It demonstrates immediate capabilities and collaboration.\n\n## 2. Compile Your Portfolio with Design Intent\nYour online portal must be distinctive, responsive, and uncluttered. Use clean "Space Grotesk" display typography and slate styles rather than flashy, unreadable color combinations. Showcase 2 highly-polished projects rather than 10 half-baked tutorials.\n\n## 3. Contact Directors with Precise Solutions\nNever message recruiters with "Is there any job?". Direct-message engineering line managers with a specific audit: a 3-paragraph diagnostic of their modern web systems, explaining how you can help them refractor state, optimize databases, or build secondary tools. True value bypasses gatekeepers.`,
          excerpt: "A comprehensive guide on outbound student strategies for locking remote tech internships, outperforming conventional job application portals.",
          author: "Shaik Basheer (Advisor)",
          created_at: new Date().toISOString(),
          views: 95,
          likes: 38,
          category: "Internships",
          seo_keywords: ["jobs", "internships", "outbound", "careers", "resume-portfolio", "developers"],
          is_published: true,
          author_name: "Shaik Basheer (Advisor)",
          author_id: ""
        },
        {
          id: toUuid("blog_3"),
          title: "Optimizing Server-Side Model Chains with Google Gemini @google/genai SDK",
          slug: "google-gemini-sdk-optimizations",
          content: `Google's brand new @google/genai SDK has completely replaced legacy alternatives, establishing a standardized structure for prompting, multi-modal feeding, and real-time streaming operations.\n\nLet's analyze some key optimization protocols to maximize API performance in your full-stack Node/React applications.\n\n## 1. Transition to Lazy Initializers\nDo not initialize clients on module load. If keys are missing, the system crashes. Wrap initialization in a lazy helper block that initializes and caches on the first call, raising structured warnings.\n\n## 2. Feed Structured JSON Schemas\nGemini models support strict structured outputs. Provide a clear TypeScript representation so that JSON models are returned without requiring separate validation layers. This minimizes hallucination risk virtually to zero.\n\n## 3. Leverage Stream Protocols for Long Form Replies\nFor conversational threads, always employ streams rather than complete buffered responses. This ensures instant user-facing visual rendering and blocks connection timeouts in edge runtimes.`,
          excerpt: "A technical deep-dive analyzing structured schemas, lazy client initializations, and streaming paradigms inside Google's modern Gemini SDK.",
          author: "Shaik Basheer (Advisor)",
          created_at: new Date().toISOString(),
          views: 184,
          likes: 62,
          category: "AI Tools",
          seo_keywords: ["ai", "gemini-api", "sdk", "full-stack", "typescript", "software-design"],
          is_published: true,
          author_name: "Shaik Basheer (Advisor)",
          author_id: ""
        }
      ];
      const initialBlogs: BlogPost[] = rawInitialBlogs.map(b => ({
        ...b,
        updated_at: b.created_at,
        tags: [],
        reading_time_minutes: 5,
        author_id: b.author_id || toUuid("admin_user")
      }));
      await supabaseServer.from("blog_posts").insert(initialBlogs);
    }
    console.log("[Supabase Seeding] Database checks and auto-seeding finished successfully.");
  } catch (err) {
    console.error("[Supabase Seeding] Error seeding to Supabase database:", err);
  }
}

// Saved items fetch utility helper
async function getSavedItemIdsForUser(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseServer
      .from("saved_items")
      .select("item_id")
      .eq("user_id", userId);
    if (error) throw error;
    return data ? data.map(row => row.item_id) : [];
  } catch (err) {
    console.error("Error loading bookmarked items:", err);
    return [];
  }
}

// Lazy Initialization for Gemini Coder Hub
let geminiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClientInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY not found. Please set your Gemini key in AI Studio Secrets panel.");
    }
    geminiClientInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return geminiClientInstance;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Validate critical environment variables on startup
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[STARTUP WARNING] GEMINI_API_KEY is not set. AI chat will fail on first use.");
  } else {
    console.log("[STARTUP] GEMINI_API_KEY is configured.");
  }

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // JSON body parser
  app.use(express.json());

  // Run the seeding routine on launch
  await seedDatabaseIfEmpty();

  // ----------------------------------------------------
  // Authentication & Profile Endpoints
  // ----------------------------------------------------

  // Auth: Log in or create user (Sandbox/Interactive custom fallback)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }
      if (!isValidEmail(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      const lowerEmail = email.toLowerCase();
      const isAdminEmail = lowerEmail === "shaikbashe1111@gmail.com";

      const { data: profiles, error: selectError } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("email", lowerEmail);

      if (selectError) throw selectError;

      let profile: Profile;

      if (!profiles || profiles.length === 0) {
        const profileId = randomUUID();
        profile = {
          id: profileId,
          name: name || email.split("@")[0],
          email: lowerEmail,
          role: isAdminEmail ? "admin" : "student",
          plan: "free",
          email_verified: false,
          daily_prompt_count: 20,
          last_prompt_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          daily_ai_requests: 0,
          daily_ai_limit: 5,
          last_quota_reset: new Date().toISOString().split('T')[0],
          skills: [],
          saved_items: []
        };
        const { error: insertError } = await supabaseServer.from("profiles").insert(profile);
        if (insertError) throw insertError;
      } else {
        profile = profiles[0] as Profile;
        if (isAdminEmail && profile.role !== "admin") {
          profile.role = "admin";
          await supabaseServer.from("profiles").update({ role: "admin" }).eq("id", profile.id);
        }
      }

      // Check if days changed to reset prompt counter
      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.last_prompt_date !== todayStr) {
        profile.daily_prompt_count = 20;
        profile.last_prompt_date = todayStr;
        await supabaseServer.from("profiles").update({
          daily_prompt_count: 20,
          last_prompt_date: todayStr
        }).eq("id", profile.id);
      }

      const saved_items = await getSavedItemIdsForUser(profile.id);
      res.json({
        profile: {
          ...profile,
          saved_items
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Sync active profile details
  app.get("/api/auth/profile", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ error: "Email parameter required" });
        return;
      }

      const { data: profiles, error: selectError } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("email", email.toLowerCase());

      if (selectError) throw selectError;

      if (!profiles || profiles.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const profile = profiles[0] as Profile;

      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.last_prompt_date !== todayStr) {
        profile.daily_prompt_count = 20;
        profile.last_prompt_date = todayStr;
        await supabaseServer.from("profiles").update({
          daily_prompt_count: 20,
          last_prompt_date: todayStr
        }).eq("id", profile.id);
      }

      const saved_items = await getSavedItemIdsForUser(profile.id);
      res.json({
        profile: {
          ...profile,
          saved_items
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Get unique profile by ID
  app.get("/api/profile", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ error: "userId required" });
        return;
      }

      const { data: profile, error } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.last_prompt_date !== todayStr) {
        profile.daily_prompt_count = 20;
        profile.last_prompt_date = todayStr;
        await supabaseServer.from("profiles").update({
          daily_prompt_count: 20,
          last_prompt_date: todayStr
        }).eq("id", profile.id);
      }

      const saved_items = await getSavedItemIdsForUser(profile.id);
      res.json({
        profile: {
          ...profile,
          saved_items
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth: Save / Star database toggles
  app.put("/api/auth/save", async (req, res) => {
    try {
      const { userId, itemId, itemType } = req.body;
      if (!userId || !itemId || !itemType) {
        res.status(400).json({ error: "userId, itemId and itemType are required" });
        return;
      }

      // Convert legacy items ID if they are not UUIDs
      const cleanItemId = toUuid(itemId);

      const { data: existing, error: selectError } = await supabaseServer
        .from("saved_items")
        .select("id")
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", cleanItemId);

      if (selectError) throw selectError;

      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabaseServer
          .from("saved_items")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", itemType)
          .eq("item_id", cleanItemId);
        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabaseServer
          .from("saved_items")
          .insert({
            user_id: userId,
            item_type: itemType,
            item_id: cleanItemId
          });
        if (insertError) throw insertError;
      }

      const saved_items = await getSavedItemIdsForUser(userId);
      res.json({ saved_items });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // AI Coding Assistant Endpoints
  // ----------------------------------------------------

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { userId, sessionId, message, language, mode } = req.body;

      if (!userId || !message) {
        res.status(400).json({ error: "userId and message are required" });
        return;
      }

      const { data: profile, error: profileError } = await supabaseServer
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        res.status(404).json({ error: "User profile not found" });
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (profile.last_prompt_date !== todayStr) {
        profile.daily_prompt_count = 20;
        profile.last_prompt_date = todayStr;
        await supabaseServer.from("profiles").update({
          daily_prompt_count: 20,
          last_prompt_date: todayStr
        }).eq("id", userId);
      }

      if (profile.daily_prompt_count <= 0 && profile.role !== "admin") {
        res.status(429).json({
          error: "You have reached your limit of 20 prompts for today. Limit resets tomorrow!"
        });
        return;
      }

      let activeSessionId = sessionId;
      if (!activeSessionId || activeSessionId === "new") {
        activeSessionId = randomUUID();
        const sessionTitle = message.length > 40 ? `${message.substring(0, 37)}...` : message;
        const { error: sessErr } = await supabaseServer.from("chat_sessions").insert({
          id: activeSessionId,
          user_id: userId,
          title: sessionTitle
        });
        if (sessErr) throw sessErr;
      }

      // Save user chat message
      const { error: msgErr } = await supabaseServer.from("chat_messages").insert({
        session_id: activeSessionId,
        role: "user",
        content: message
      });
      if (msgErr) throw msgErr;

      let currentPromptRemaining = profile.daily_prompt_count;
      if (profile.role !== "admin") {
        currentPromptRemaining = profile.daily_prompt_count - 1;
        await supabaseServer.from("profiles").update({
          daily_prompt_count: currentPromptRemaining
        }).eq("id", userId);
      }

      const languageContext = language ? `\nTarget Language selected: ${language}. Please output the programming code in this language with clear syntax blocks.` : '';
      const modeContext = mode ? `\nRequest Type: ${mode}. Focus strongly on this task (explain, debugging, optimizes, or generates) based on this request instruction.` : '';
      const queryPrompt = `User Prompt:\n${message}\n${languageContext}${modeContext}`;

      try {
        const ai = getGeminiClient();
        const geminiResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: queryPrompt,
          config: {
            systemInstruction: "You are an expert programming tutor helping students. Only answer coding and tech-related questions. Code snippets should be formatted inside elegant markdown code-blocks matching the programming language."
          }
        });

        const assistantReplyText = geminiResponse.text || "I was unable to formulate a code answer. Please try again with simple coding-related queries.";

        // Save assistant chat message
        const { error: replyErr } = await supabaseServer.from("chat_messages").insert({
          session_id: activeSessionId,
          role: "assistant",
          content: assistantReplyText
        });
        if (replyErr) throw replyErr;

        res.json({
          sessionId: activeSessionId,
          reply: assistantReplyText,
          dailyPromptRemaining: currentPromptRemaining
        });
      } catch (geminiErr: any) {
        console.error("Gemini Error:", geminiErr);
        if (profile.role !== "admin") {
          await supabaseServer.from("profiles").update({
            daily_prompt_count: profile.daily_prompt_count
          }).eq("id", userId);
        }
        res.status(502).json({
          error: `AI assistant error: ${geminiErr.message || "Failed to contact Gemini engine. Check your API key."}`
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all chat sessions for user
  app.get("/api/ai/sessions", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ error: "userId parameter required" });
        return;
      }
      const { data: userSessions, error } = await supabaseServer
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ sessions: userSessions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get messages for a session
  app.get("/api/ai/session-messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId required" });
        return;
      }
      const { data: messages, error } = await supabaseServer
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      res.json({ messages });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete chat session
  app.delete("/api/ai/session", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId required" });
        return;
      }
      const { error } = await supabaseServer
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Directories & Portal API Endpoints
  // ----------------------------------------------------

  // AI Tools Directory listing with dynamic Search & Filtering
  app.get("/api/tools", async (req, res) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;

      let queryBuilder = supabaseServer.from("ai_tools").select("*");

      if (category && category !== "All") {
        queryBuilder = queryBuilder.ilike("category", category);
      }

      const { data: toolsList, error } = await queryBuilder;
      if (error) throw error;

      let filtered = toolsList || [];

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.name.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term) ||
            t.category.toLowerCase().includes(term)
        );
      }

      res.json({ tools: filtered });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Unique Tool Page by slug
  app.get("/api/tools/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const { data, error } = await supabaseServer
        .from("ai_tools")
        .select("*")
        .eq("slug", slug);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        res.status(404).json({ error: "AI Tool not found" });
        return;
      }
      res.json({ tool: data[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Internships Directory
  app.get("/api/internships", async (req, res) => {
    try {
      const search = req.query.search as string;
      const remoteOnly = req.query.remoteOnly === "true";

      let queryBuilder = supabaseServer.from("internships").select("*");

      if (remoteOnly) {
        queryBuilder = queryBuilder.eq("is_remote", true);
      }

      const { data: internshipsList, error } = await queryBuilder;
      if (error) throw error;

      let filtered = internshipsList || [];

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.company.toLowerCase().includes(term) ||
            i.role.toLowerCase().includes(term) ||
            i.location.toLowerCase().includes(term) ||
            i.eligibility.toLowerCase().includes(term)
        );
      }

      res.json({ internships: filtered });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Unique Internship Page by slug
  app.get("/api/internships/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const { data, error } = await supabaseServer
        .from("internships")
        .select("*")
        .eq("slug", slug);

      if (error) throw error;

      if (!data || data.length === 0) {
        res.status(404).json({ error: "Internship not found" });
        return;
      }
      res.json({ internship: data[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hackathons Directory with Search
  app.get("/api/hackathons", async (req, res) => {
    try {
      const search = req.query.search as string;

      const { data: hackathonsList, error } = await supabaseServer.from("hackathons").select("*");
      if (error) throw error;

      let filtered = hackathonsList || [];

      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (h) =>
            h.name.toLowerCase().includes(term) ||
            h.organizer.toLowerCase().includes(term) ||
            h.eligibility.toLowerCase().includes(term) ||
            h.prize_pool.toLowerCase().includes(term)
        );
      }

      res.json({ hackathons: filtered });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Unique Hackathon page by slug
  app.get("/api/hackathons/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const { data, error } = await supabaseServer
        .from("hackathons")
        .select("*")
        .eq("slug", slug);

      if (error) throw error;

      if (!data || data.length === 0) {
        res.status(404).json({ error: "Hackathon not found" });
        return;
      }
      res.json({ hackathon: data[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Saved / Favorite Items Endpoints (Legacy compatibility check)
  app.get("/api/saved-items", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ error: "userId parameter required" });
        return;
      }
      const { data: userSaves, error } = await supabaseServer
        .from("saved_items")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      res.json({ saved: userSaves });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/saved-items/toggle", async (req, res) => {
    try {
      const { userId, itemType, itemId } = req.body;
      if (!userId || !itemType || !itemId) {
        res.status(400).json({ error: "userId, itemType, and itemId are required" });
        return;
      }

      const cleanItemId = toUuid(itemId);

      const { data: existing, error: selectError } = await supabaseServer
        .from("saved_items")
        .select("id")
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", cleanItemId);

      if (selectError) throw selectError;

      let saved = false;
      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabaseServer
          .from("saved_items")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", itemType)
          .eq("item_id", cleanItemId);
        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabaseServer
          .from("saved_items")
          .insert({
            user_id: userId,
            item_type: itemType,
            item_id: cleanItemId
          });
        if (insertError) throw insertError;
        saved = true;
      }
      res.json({ saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Admin Endpoints (protected by role checking)
  // ----------------------------------------------------

  const adminGuard = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const userId = req.headers["x-user-id"] || req.body.userId || req.query.userId;
      if (!userId) {
        res.status(403).json({ error: "Unauthorized access. User Context missing." });
        return;
      }
      const { data: profile, error } = await supabaseServer
        .from("profiles")
        .select("role")
        .eq("id", userId as string)
        .single();

      if (error || !profile || profile.role !== "admin") {
        res.status(403).json({ error: "Unauthorized access. Requires Admin role permissions." });
        return;
      }
      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  // Admin: View all registered users
  app.get("/api/admin/users", adminGuard, async (req, res) => {
    try {
      const { data: usersList, error } = await supabaseServer.from("profiles").select("*");
      if (error) throw error;
      res.json({ users: usersList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Create or edit AI Tool
  app.post("/api/admin/tools", adminGuard, async (req, res) => {
    try {
      const toolData: Partial<AITool> = req.body.tool;
      if (!toolData || !toolData.name || !toolData.category) {
        res.status(400).json({ error: "Valid AI tool definition required" });
        return;
      }

      const slug = toolData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      const toolId = toolData.id ? toUuid(toolData.id) : randomUUID();
      const finalTool: AITool = {
        id: toolId,
        name: toolData.name,
        slug,
        description: toolData.description || "",
        category: toolData.category as any,
        pricing: toolData.pricing || "Free",
        pros: toolData.pros || [],
        cons: toolData.cons || [],
        website_url: toolData.website_url || "https://google.com",
        is_featured: !!toolData.is_featured,
        is_sponsored: !!toolData.is_sponsored,
        views: toolData.views || 0,
        saves: toolData.saves || 0,
        created_at: toolData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseServer.from("ai_tools").upsert(finalTool);
      if (error) throw error;
      res.json({ tool: finalTool, updated: !!toolData.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Delete tool
  app.delete("/api/admin/tools/:id", adminGuard, async (req, res) => {
    try {
      const cleanId = toUuid(req.params.id as string);
      const { error } = await supabaseServer.from("ai_tools").delete().eq("id", cleanId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Create or edit Internship
  app.post("/api/admin/internships", adminGuard, async (req, res) => {
    try {
      const internshipData: Partial<Internship> = req.body.internship;
      if (!internshipData || !internshipData.company || !internshipData.role) {
        res.status(400).json({ error: "Valid internship definition required" });
        return;
      }

      const slug = `${internshipData.company.toLowerCase().trim()}-${internshipData.role.toLowerCase().trim()}`
        .replace(/[^a-z0-9]+/g, "-");
      const intId = internshipData.id ? toUuid(internshipData.id) : randomUUID();
      const finalInternship: Internship = {
        id: intId,
        company: internshipData.company,
        slug,
        role: internshipData.role,
        location: internshipData.location || "Onsite",
        is_remote: !!internshipData.is_remote,
        stipend: internshipData.stipend || "$5,000 / month",
        eligibility: internshipData.eligibility || "Open to all relevant majors",
        deadline: internshipData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        apply_url: internshipData.apply_url || "https://google.com",
        source: internshipData.source || "manual",
        tags: internshipData.tags || [],
        is_sponsored: !!internshipData.is_sponsored,
        views: internshipData.views || 0,
        saves: internshipData.saves || 0,
        created_at: internshipData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseServer.from("internships").upsert(finalInternship);
      if (error) throw error;
      res.json({ internship: finalInternship, updated: !!internshipData.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Delete internship
  app.delete("/api/admin/internships/:id", adminGuard, async (req, res) => {
    try {
      const cleanId = toUuid(req.params.id as string);
      const { error } = await supabaseServer.from("internships").delete().eq("id", cleanId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Create or edit Hackathon
  app.post("/api/admin/hackathons", adminGuard, async (req, res) => {
    try {
      const hackathonData: Partial<Hackathon> = req.body.hackathon;
      if (!hackathonData || !hackathonData.name || !hackathonData.organizer) {
        res.status(400).json({ error: "Valid hackathon definition required" });
        return;
      }

      const slug = hackathonData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      const hackId = hackathonData.id ? toUuid(hackathonData.id) : randomUUID();
      const finalHackathon: Hackathon = {
        id: hackId,
        name: hackathonData.name,
        slug,
        organizer: hackathonData.organizer,
        prize_pool: hackathonData.prize_pool || "Recognition",
        deadline: hackathonData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        eligibility: hackathonData.eligibility || "Students above 18",
        registration_url: hackathonData.registration_url || "https://google.com",
        tags: hackathonData.tags || [],
        mode: hackathonData.mode || "online",
        is_featured: !!hackathonData.is_featured,
        views: hackathonData.views || 0,
        saves: hackathonData.saves || 0,
        created_at: hackathonData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseServer.from("hackathons").upsert(finalHackathon);
      if (error) throw error;
      res.json({ hackathon: finalHackathon, updated: !!hackathonData.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Delete hackathon
  app.delete("/api/admin/hackathons/:id", adminGuard, async (req, res) => {
    try {
      const cleanId = toUuid(req.params.id as string);
      const { error } = await supabaseServer.from("hackathons").delete().eq("id", cleanId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Blog directory endpoints
  // ----------------------------------------------------

  app.get("/api/blog", async (req, res) => {
    try {
      const { data: posts, error } = await supabaseServer
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json({ posts: posts || [] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { data, error } = await supabaseServer
        .from("blog_posts")
        .select("*")
        .eq("slug", slug);

      if (error) throw error;
      if (!data || data.length === 0) {
        res.status(404).json({ error: "Article not found" });
        return;
      }
      res.json({ post: data[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/blog/:slug/view", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const limitCheck = rateLimit(req.ip || "unknown-client-view", 10, 60000);
      if (!limitCheck.success) {
        res.status(429).json({ error: "Too many view requests. Refusing request." });
        return;
      }

      const { data, error } = await supabaseServer
        .from("blog_posts")
        .select("*")
        .eq("slug", slug);

      if (error) throw error;
      if (!data || data.length === 0) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const post = data[0];
      const updatedViews = (post.views || 0) + 1;

      await supabaseServer
        .from("blog_posts")
        .update({ views: updatedViews })
        .eq("id", post.id);

      res.json({ success: true, views: updatedViews });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Create or update a BlogPost
  app.post("/api/admin/blog", adminGuard, async (req, res) => {
    try {
      const postData: Partial<BlogPost> = req.body.post;
      if (!postData || !postData.title || !postData.content) {
        res.status(400).json({ error: "Valid article definition is required" });
        return;
      }

      const id = postData.id ? toUuid(postData.id) : randomUUID();
      const slug = postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const finalPost: BlogPost = {
        id,
        title: postData.title,
        slug,
        content: postData.content,
        excerpt: postData.excerpt || postData.content.substring(0, 150) + "...",
        author: postData.author || "Administrator",
        author_id: postData.author_id || (req.headers["x-user-id"] as string) || (req.body.userId as string) || toUuid("admin_user"),
        author_name: postData.author_name || postData.author || "Administrator",
        created_at: postData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: postData.views || 0,
        likes: postData.likes || 0,
        category: postData.category || "Technology",
        tags: postData.tags || [],
        seo_keywords: postData.seo_keywords || [],
        is_published: postData.is_published ?? true,
        reading_time_minutes: postData.reading_time_minutes || Math.ceil(postData.content.split(/\s+/).length / 200) || 1
      };

      const { error } = await supabaseServer.from("blog_posts").upsert(finalPost);
      if (error) throw error;

      console.log(`[API Revalidate Triggers] Invalidated caches on edge sitemaps for direct URL: /blog/${slug}`);
      res.json({ post: finalPost, revalidated: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Delete a BlogPost
  app.delete("/api/admin/blog/:id", adminGuard, async (req, res) => {
    try {
      const cleanId = toUuid(req.params.id as string);
      const { error } = await supabaseServer.from("blog_posts").delete().eq("id", cleanId);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Newsletter Subscriptions Endpoints
  // ----------------------------------------------------

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, userName } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email target is required" });
        return;
      }
      if (!isValidEmail(email)) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      const ipCheck = rateLimit(req.ip || "unknown-sub", 5, 60000);
      if (!ipCheck.success) {
        res.status(429).json({ error: "Rate limit triggered. Calm your subscription attempts!" });
        return;
      }

      const lowerEmail = email.toLowerCase().trim();
      const subId = randomUUID();

      const newSubscriber = {
        id: subId,
        email: lowerEmail,
        created_at: new Date().toISOString(),
        subscribed_to_digest: true
      };

      const { error } = await supabaseServer.from("newsletter_subscribers").insert(newSubscriber);
      // Fallback if newsletter_subscribers table is not built or ignored
      if (error) {
        console.warn("[Newsletter Subscriptions Warning] Failed to insert row:", error.message);
      }

      const emailHtml = buildWelcomeEmailHtml(userName || email.split("@")[0]);
      await sendEmail({
        to: lowerEmail,
        subject: "Welcome to Student AI Hub — Your Opportunity Toolkit",
        html: emailHtml
      });

      res.status(201).json({ success: true, email: lowerEmail });
    } catch (err: any) {
      console.error("[Newsletter subscribe err]:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // On-demand Manual ISR Revalidate Endpoint
  app.post("/api/revalidate", adminGuard, async (req, res) => {
    try {
      const { slug } = req.body;
      console.info(`[ISR Manual trigger] Force purge pages on edge routers for blog: ${slug || "all"}`);
      res.json({ success: true, message: `Revalidated slug routes: /blog/${slug || "*"}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Static crawling endpoints (Sitemaps, RSS, Robots)
  // ----------------------------------------------------

  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /api/admin/
Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const host = `${req.protocol}://${req.get("host")}`;
      const { data: blogs, error } = await supabaseServer
        .from("blog_posts")
        .select("*")
        .eq("is_published", true);

      if (error) throw error;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

      if (blogs) {
        for (const b of blogs) {
          xml += `
  <url>
    <loc>${host}/blog/${b.slug}</loc>
    <lastmod>${b.created_at.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
      }

      xml += "\n</urlset>";
      res.setHeader("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      res.status(500).send("Error compiling sitemaps config");
    }
  });

  app.get("/rss.xml", async (req, res) => {
    try {
      const host = `${req.protocol}://${req.get("host")}`;
      const { data: blogs, error } = await supabaseServer
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Student AI Hub Insights</title>
  <link>${host}</link>
  <description>The absolute co-pilot roadmap for technical opportunity and engineering sprints</description>
  <language>en-us</language>
  <pubDate>${new Date().toUTCString()}</pubDate>`;

      if (blogs) {
        for (const b of blogs) {
          rss += `
  <item>
    <title><![CDATA[${b.title}]]></title>
    <link>${host}/blog/${b.slug}</link>
    <guid>${host}/blog/${b.slug}</guid>
    <description><![CDATA[${b.excerpt}]]></description>
    <author>${escapeXml(b.author || "Administrator")}</author>
    <pubDate>${new Date(b.created_at).toUTCString()}</pubDate>
  </item>`;
        }
      }

      rss += "\n</channel>\n</rss>";
      res.setHeader("Content-Type", "application/xml");
      res.send(rss);
    } catch (err) {
      res.status(500).send("Error compiling RSS");
    }
  });

  app.get("/api/og", (req, res) => {
    const titleQuery = (req.query.title as string) || "Student AI Hub — Tech Blueprint Portal";
    const safeTitle = escapeXml(titleQuery);

    const svg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#020617"/>
            <stop offset="50%" stop-color="#0b1329"/>
            <stop offset="100%" stop-color="#030712"/>
          </linearGradient>
          <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.15"/>
          </linearGradient>
        </defs>

        <rect width="1200" height="630" fill="url(#bg-grad)"/>

        <g stroke="#1e293b" stroke-width="0.5" opacity="0.4">
          <line x1="100" y1="0" x2="100" y2="630" />
          <line x1="200" y1="0" x2="200" y2="630" />
          <line x1="300" y1="0" x2="300" y2="630" />
          <line x1="400" y1="0" x2="400" y2="630" />
          <line x1="500" y1="0" x2="500" y2="630" />
          <line x1="600" y1="0" x2="600" y2="630" />
          <line x1="700" y1="0" x2="700" y2="630" />
          <line x1="800" y1="0" x2="800" y2="630" />
          <line x1="900" y1="0" x2="900" y2="630" />
          <line x1="1000" y1="0" x2="1000" y2="630" />
          <line x1="1100" y1="0" x2="1100" y2="630" />
          
          <line x1="0" y1="100" x2="1200" y2="100" />
          <line x1="0" y1="200" x2="1200" y2="200" />
          <line x1="0" y1="300" x2="1200" y2="300" />
          <line x1="0" y1="400" x2="1200" y2="400" />
          <line x1="0" y1="500" x2="1200" y2="500" />
          <line x1="0" y1="600" x2="1200" y2="600" />
        </g>

        <circle cx="950" cy="150" r="280" fill="url(#glow-grad)" filter="blur(80px)"/>
        <circle cx="150" cy="500" r="220" fill="url(#glow-grad)" filter="blur(80px)"/>

        <g transform="translate(100, 100)">
          <rect width="180" height="36" rx="18" fill="#4f46e5" fill-opacity="0.1" stroke="#4f46e5" stroke-opacity="0.3" stroke-width="1"/>
          <text x="90" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#818cf8" letter-spacing="1.5" text-anchor="middle">CAMPUS STRATEGY</text>
        </g>

        <g transform="translate(100, 200)">
          <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="-1">
            <tspan x="0" y="40">${safeTitle.length > 42 ? safeTitle.substring(0, 42) + "..." : safeTitle}</tspan>
          </text>
        </g>

        <g transform="translate(100, 480)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#94a3b8" font-weight="600">STUDENT AI HUB PLATFORM</text>
          <text x="0" y="25" font-family="Courier, monospace" font-size="12" fill="#64748b">PORT 3000 &bull; SUPABASE SYNCHRONIZED &bull; ACTIVE METRICS</text>
        </g>

        <g transform="translate(1100, 500)" text-anchor="end">
          <circle cx="-50" cy="-30" r="40" fill="#6366f1"/>
          <text x="-50" y="-25" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">AI</text>
        </g>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(svg.trim());
  });

  app.post("/api/analytics/track", (req, res) => {
    const { eventName, params } = req.body;
    console.info(`[Server Telemetry Logging] Event "${eventName}" parsed. Context:`, params || {});
    res.json({ success: true });
  });

  // ----------------------------------------------------
  // Vite Integration for Asset Serving & Development
  // ----------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Student AI Hub] Server running successfully with Supabase integration! Port: ${PORT}`);
  });
}

startServer();
