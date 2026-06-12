import React, { useState, useEffect } from "react";
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
import { Profile, AITool, Internship, Hackathon } from "./types";
import { ShieldAlert, LogIn, Sparkles, BookOpen } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  
  // Master lists for home grid previews
  const [allTools, setAllTools] = useState<AITool[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  
  const [globalLoading, setGlobalLoading] = useState(true);

  // 1. On Mount: Auto-authenticate student@example.com to make sandbox zero-friction
  useEffect(() => {
    const cachedEmail = localStorage.getItem("student_hub_user_email") || "student@example.com";
    handleAuthenticate(cachedEmail, localStorage.getItem("student_hub_user_name") || "Student Alpha");
    loadDirectoryData();
  }, []);

  const loadDirectoryData = async () => {
    try {
      const [toolsRes, internRes, hackRes] = await Promise.all([
        fetch("/api/tools"),
        fetch("/api/internships"),
        fetch("/api/hackathons")
      ]);
      const [tData, iData, hData] = await Promise.all([
        toolsRes.json(),
        internRes.json(),
        hackRes.json()
      ]);
      if (tData.tools) setAllTools(tData.tools);
      if (iData.internships) setAllInternships(iData.internships);
      if (hData.hackathons) setAllHackathons(hData.hackathons);
    } catch (err) {
      console.error("Error loading directories:", err);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Sync profile details (such as prompt quotas) from Express backend
  const syncProfileDetails = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setCurrentUser(data.profile);
          setSavedItemIds(data.profile.saved_items || []);
        }
      }
    } catch (err) {
      console.error("Error syncing profile:", err);
    }
  };

  const handleAuthenticate = async (email: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || "Developer Student" }),
      });
      const data = await res.json();
      if (data.profile) {
        setCurrentUser(data.profile);
        setSavedItemIds(data.profile.saved_items || []);
        localStorage.setItem("student_hub_user_email", email);
        if (name) localStorage.setItem("student_hub_user_name", name);
      }
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedItemIds([]);
    localStorage.removeItem("student_hub_user_email");
    localStorage.removeItem("student_hub_user_name");
  };

  // Toggling bookmarks/saves for tools, internships, and hackathons
  const handleToggleSaveItem = async (
    itemType: 'tool' | 'internship' | 'hackathon', 
    itemId: string
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          itemId,
          itemType
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.saved_items) {
          setSavedItemIds(data.saved_items);
          // Sync current profile variables
          syncProfileDetails(currentUser.email);
        }
      }
    } catch (err) {
      console.error("Error saving resource item:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100" id="student-hub-root-app">
      {/* 1. Header Navigation elements */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogin={handleAuthenticate}
        onLogout={handleLogout}
      />

      {/* Developer switcher reminder bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <p className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-pulse text-amber-400" />
            <span>Interactive Student Sandbox mode</span>
          </p>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-slate-400 font-medium">Currently testing as: <strong className="text-white">{currentUser?.role === 'admin' ? 'Administrator' : 'Student'}</strong></span>
            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  handleAuthenticate("student@example.com", "Student Alpha");
                } else {
                  handleAuthenticate("shaikbashe1111@gmail.com", "Shaik Basheer");
                }
              }}
              className="text-amber-400 font-extrabold hover:underline cursor-pointer"
            >
              [Switch Role]
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main routers selection */}
      <main className="flex-grow">
        {globalLoading ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4" id="applet-initializer-screen">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs text-slate-400 font-mono">Formulating database tables...</span>
          </div>
        ) : (
          <div id="tab-viewport-view">
            {activeTab === "home" && (
              <WelcomeHero
                setActiveTab={setActiveTab}
                featuredTools={allTools}
                featuredInternships={allInternships}
                featuredHackathons={allHackathons}
                dailyPromptsRemaining={currentUser?.daily_prompt_count ?? 20}
              />
            )}

            {activeTab === "assistant" && (
              <ChatAssistant
                currentUser={currentUser}
                onOpenLogin={() => {
                  // Simply clicking login in assistant raises standard modal
                  const btn = document.getElementById("signin-navbar-btn");
                  if (btn) btn.click();
                }}
                triggerProfileSync={() => {
                  if (currentUser) syncProfileDetails(currentUser.email);
                }}
              />
            )}

            {activeTab === "tools" && (
              <ToolsDirectory
                currentUser={currentUser}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={() => {
                  const btn = document.getElementById("signin-navbar-btn");
                  if (btn) btn.click();
                }}
              />
            )}

            {activeTab === "internships" && (
              <InternshipsPortal
                currentUser={currentUser}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={() => {
                  const btn = document.getElementById("signin-navbar-btn");
                  if (btn) btn.click();
                }}
              />
            )}

            {activeTab === "hackathons" && (
              <HackathonsPortal
                currentUser={currentUser}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={() => {
                  const btn = document.getElementById("signin-navbar-btn");
                  if (btn) btn.click();
                }}
              />
            )}

            {activeTab === "blog" && (
              <BlogView
                currentUser={currentUser}
                onOpenLogin={() => {
                  const btn = document.getElementById("signin-navbar-btn");
                  if (btn) btn.click();
                }}
              />
            )}

            {activeTab === "dashboard" && (
              <UserDashboard
                currentUser={currentUser}
                savedItemIds={savedItemIds}
                onToggleSave={handleToggleSaveItem}
                onOpenLogin={() => {
                  const btn = document.getElementById("signin-navbar-btn");
                  if (btn) btn.click();
                }}
                allTools={allTools}
                allInternships={allInternships}
                allHackathons={allHackathons}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "admin" && (
              <AdminPanel
                currentUser={currentUser}
                triggerDataReload={loadDirectoryData}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Global custom footer */}
      <Footer />
    </div>
  );
}
