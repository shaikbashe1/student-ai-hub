import React, { Suspense, lazy, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { Profile, AITool, Internship, Hackathon } from './types';

const WelcomeHero = lazy(() => import('./components/WelcomeHero'));
const ChatAssistant = lazy(() => import('./components/ChatAssistant'));
const ToolsDirectory = lazy(() => import('./components/ToolsDirectory'));
const InternshipsPortal = lazy(() => import('./components/InternshipsPortal'));
const HackathonsPortal = lazy(() => import('./components/HackathonsPortal'));
const BlogView = lazy(() => import('./components/blog/BlogView'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

const PageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [allTools, setAllTools] = useState<AITool[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('hub_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        handleLogin(parsed.email, parsed.name);
      } catch (e) {
        console.error(e);
      }
    }
    fetchDirectories();
  }, []);

  const fetchDirectories = async () => {
    try {
      const [toolsRes, jobsRes, hackRes] = await Promise.all([
        fetch('/api/tools'),
        fetch('/api/internships'),
        fetch('/api/hackathons')
      ]);
      const toolsData = await toolsRes.json();
      const jobsData = await jobsRes.json();
      const hackData = await hackRes.json();

      if (toolsData.tools) setAllTools(toolsData.tools);
      if (jobsData.internships) setAllInternships(jobsData.internships);
      if (hackData.hackathons) setAllHackathons(hackData.hackathons);
    } catch (e) {
      console.error("Error loading directory collections:", e);
    }
  };

  const handleLogin = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setCurrentUser(data.profile);
          setSavedItemIds(data.profile.saved_items || []);
          localStorage.setItem('hub_user', JSON.stringify({ email: data.profile.email, name: data.profile.name }));
        }
      }
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedItemIds([]);
    localStorage.removeItem('hub_user');
  };

  const triggerProfileSync = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/profile?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setCurrentUser(data.profile);
          setSavedItemIds(data.profile.saved_items || []);
        }
      }
    } catch (e) {
      console.error("Profile sync failed:", e);
    }
  };

  const handleToggleSave = async (itemType: 'tool' | 'internship' | 'hackathon', itemId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, itemId, itemType })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved_items) {
          setSavedItemIds(data.saved_items);
        }
      }
    } catch (e) {
      console.error("Failed to toggle save:", e);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <WelcomeHero
            setActiveTab={setActiveTab}
            featuredTools={allTools}
            featuredInternships={allInternships}
            featuredHackathons={allHackathons}
            dailyPromptsRemaining={currentUser ? currentUser.daily_prompt_count : 20}
          />
        );
      case 'assistant':
        return (
          <ChatAssistant
            currentUser={currentUser}
            onOpenLogin={() => {
              const loginBtn = document.getElementById('signin-navbar-btn');
              if (loginBtn) loginBtn.click();
            }}
            triggerProfileSync={triggerProfileSync}
          />
        );
      case 'tools':
        return (
          <ToolsDirectory
            currentUser={currentUser}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onOpenLogin={() => {
              const loginBtn = document.getElementById('signin-navbar-btn');
              if (loginBtn) loginBtn.click();
            }}
          />
        );
      case 'internships':
        return (
          <InternshipsPortal
            currentUser={currentUser}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onOpenLogin={() => {
              const loginBtn = document.getElementById('signin-navbar-btn');
              if (loginBtn) loginBtn.click();
            }}
          />
        );
      case 'hackathons':
        return (
          <HackathonsPortal
            currentUser={currentUser}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onOpenLogin={() => {
              const loginBtn = document.getElementById('signin-navbar-btn');
              if (loginBtn) loginBtn.click();
            }}
          />
        );
      case 'blog':
        return (
          <BlogView
            currentUser={currentUser}
            onOpenLogin={() => {
              const loginBtn = document.getElementById('signin-navbar-btn');
              if (loginBtn) loginBtn.click();
            }}
          />
        );
      case 'dashboard':
        return (
          <UserDashboard
            currentUser={currentUser}
            savedItemIds={savedItemIds}
            onToggleSave={handleToggleSave}
            onOpenLogin={() => {
              const loginBtn = document.getElementById('signin-navbar-btn');
              if (loginBtn) loginBtn.click();
            }}
            allTools={allTools}
            allInternships={allInternships}
            allHackathons={allHackathons}
            setActiveTab={setActiveTab}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            currentUser={currentUser}
            triggerDataReload={fetchDirectories}
          />
        );
      default:
        return (
          <WelcomeHero
            setActiveTab={setActiveTab}
            featuredTools={allTools}
            featuredInternships={allInternships}
            featuredHackathons={allHackathons}
            dailyPromptsRemaining={currentUser ? currentUser.daily_prompt_count : 20}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 md:pb-8">
        <Suspense fallback={<PageLoader />}>
          {renderTab()}
        </Suspense>
      </main>
    </div>
  );
}
