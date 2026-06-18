import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WelcomeHero from "./components/WelcomeHero";
import ChatAssistant from "./components/ChatAssistant";
import ToolsDirectory from "./components/ToolsDirectory";
import InternshipsPortal from "./components/InternshipsPortal";
import HackathonsPortal from "./components/HackathonsPortal";
import UserDashboard from "./components/UserDashboard";
import AdminPanel from "./components/AdminPanel";
import BlogView from "./components/blog/BlogView";
import AuthCallback from "./pages/AuthCallback";
import { AITool, Internship, Hackathon } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Inner app (uses auth context)
// ──────────────────────────────────────────────────────────────────────────────

function AppInner() {
  const { profile, user, initialized, refreshProfile } = useAuth();

  // Detect /auth/callback route for OAuth redirect handling
  const isCallback = window.location.pathname === "/auth/callback";
  if (isCallback) return <AuthCallback />;

  const [activeTab, setActiveTab]         = useState<string>("home");
  const [allTools, setAllTools]           = useState<AITool[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);
  const [savedItemIds, setSavedItemIds]   = useState<string[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  // ── Load public directory data ──────────────────────────────────────────────
  useEffect(() => {
    loadDirectoryData();
  }, []);

  // ── Sync saved items whenever profile changes ───────────────────────────────
  useEffect(() => {
    if (profile?.saved_items) setSavedItemIds(profile.saved_items);
    else setSavedItemIds([]);
  }, [profile]);

  // ── Guard admin tab ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "admin" && profile?.role !== "admin") {
      setActiveTab("home");
    }
    if (activeTab === "dashboard" && !user) {
      setActiveTab("home");
    }
  }, [activeTab, profile, user]);

  const loadDirectoryData = async () => {
    try {
      const [toolsRes, internRes, hackRes] = await Promise.all([
        fetch("/api/tools"),
        fetch("/api/internships"),
        fetch("/api/hackathons"),
      ]);
      const [tData, iData, hData] = await Promise.all([
        toolsRes.json(),
        internRes.json(),
        hackRes.json(),
      ]);
      if (tData.tools)           setAllTools(tData.tools);
      if (iData.internships)     setAllInternships(iData.internships);
      if (hData.hackathons)      setAllHackathons(hData.hackathons);
    } catch (err) {
      console.error("Directory load error:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // ── Toggle save / bookmark ──────────────────────────────────────────────────
  const handleToggleSaveItem = async (
    itemType: "tool" | "internship" | "hackathon",
    itemId: string
  ) => {
    if (!profile) return;
    try {
      const res = await fetch("/api/auth/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, itemId, itemType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved_items) setSavedItemIds(data.saved_items);
        await refreshProfile();
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  // ── Show login modal helper ─────────────────────────────────────────────────
  const triggerLoginModal = () => {
    const btn = document.getElementById("signin-navbar-btn");
    if (btn) (btn as HTMLButtonElement).click();
  };

  // ── Full-page loading skeleton ──────────────────────────────────────────────
  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Initializing session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100" id="student-hub-root-app">
      {/* ── Navigation ── */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Main content ── */}
      <main className="flex-grow pb-16 md:pb-0">
        {globalLoading ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4" id="applet-initializer-screen">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs text-slate-400 font-mono">Loading platform data…</span>
          </div>
        ) : (
          <div id="tab-viewport-view">
            {activeTab === "home" && (
              <WelcomeHero
                setActiveTab={setActiveTab}
                featuredTools={allTools}
                featuredInternships={allInternships}
                featuredHackathons={allHackathons}
                dailyPromptsRemaining={profile?.daily_prompt_count ?? 20}
              />
            )}

            {activeTab === "assistant" && (
              <ChatAssistant
                currentUser={profile}
                onOpenLogin={triggerLoginModal}
                triggerProfileSync={refreshProfile}
              />
            )}

            {activeTab === "tools" && (
              <ToolsDirectory
                currentUser={profile}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={triggerLoginModal}
              />
            )}

            {activeTab === "internships" && (
              <InternshipsPortal
                currentUser={profile}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={triggerLoginModal}
              />
            )}

            {activeTab === "hackathons" && (
              <HackathonsPortal
                currentUser={profile}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={triggerLoginModal}
              />
            )}

            {activeTab === "blog" && (
              <BlogView currentUser={profile} onOpenLogin={triggerLoginModal} />
            )}

            {activeTab === "dashboard" && user ? (
              <UserDashboard
                currentUser={profile}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={triggerLoginModal}
                allTools={allTools}
                allInternships={allInternships}
                allHackathons={allHackathons}
                setActiveTab={setActiveTab}
              />
            ) : activeTab === "dashboard" && !user ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Please sign in to access your dashboard and saved items.</p>
                <button onClick={triggerLoginModal}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition active:scale-95">
                  Sign In
                </button>
              </div>
            ) : null}

            {activeTab === "admin" && profile?.role === "admin" ? (
              <AdminPanel currentUser={profile} triggerDataReload={loadDirectoryData} />
            ) : activeTab === "admin" && profile?.role !== "admin" ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="text-5xl mb-4">⛔</div>
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-slate-400 text-sm">Admin access only.</p>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Root — wrap with AuthProvider
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
