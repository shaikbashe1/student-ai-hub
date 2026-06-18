import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Sparkles, LogIn, ChevronDown, ShieldAlert, Award,
  Menu, X, Home, Terminal, BookOpen, Briefcase, Trophy,
  FileText, LayoutDashboard, LogOut, Bell, Settings, User
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "home",        label: "Overview",    icon: Home },
  { id: "assistant",   label: "AI Coder",    icon: Terminal },
  { id: "tools",       label: "AI Tools",    icon: BookOpen },
  { id: "internships", label: "Internships", icon: Briefcase },
  { id: "hackathons",  label: "Hackathons",  icon: Trophy },
  { id: "blog",        label: "Blog",        icon: FileText },
];

const MOBILE_BOTTOM = [
  { id: "home",        label: "Home",  icon: Home },
  { id: "assistant",   label: "AI",    icon: Terminal },
  { id: "internships", label: "Jobs",  icon: Briefcase },
  { id: "hackathons",  label: "Hacks", icon: Trophy },
  { id: "dashboard",   label: "Me",    icon: User },
];

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, profile, loading, initialized, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth();

  const [mobileOpen, setMobileOpen]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode]         = useState<"login" | "signup">("login");
  const [showForgot, setShowForgot]     = useState(false);

  // Form fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotSent, setForgotSent]   = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navigate = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const openAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setAuthError("");
    setEmail(""); setPassword(""); setName("");
    setShowForgot(false); setForgotSent(false);
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      // Page will redirect — no need to close modal
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed.");
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        if (!name.trim()) { setAuthError("Name is required."); setAuthLoading(false); return; }
        await registerWithEmail(email.trim(), password, name.trim());
      } else {
        await loginWithEmail(email.trim(), password);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      // Map Supabase error messages to user-friendly text
      const msg: string = err.message || "";
      if (msg.includes("Invalid login")) setAuthError("Incorrect email or password.");
      else if (msg.includes("Email not confirmed")) setAuthError("Please verify your email first. Check your inbox.");
      else if (msg.includes("User already registered")) setAuthError("An account with this email already exists. Try signing in.");
      else setAuthError(msg || "Authentication failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setAuthError("Enter your email address."); return; }
    setAuthLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setForgotSent(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset email.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    setActiveTab("home");
  };

  const avatarLetter = (profile?.name || user?.email || "U")[0].toUpperCase();
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <>
      {/* ─────────────── TOP NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center space-x-2.5 group focus:outline-none"
            aria-label="Student AI Hub home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Student <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Hub</span>
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center space-x-0.5" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={() => navigate("dashboard")}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === "dashboard"
                    ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Notification bell (desktop, logged in) */}
            {user && (
              <button
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
              </button>
            )}

            {/* ── USER MENU (desktop) ── */}
            {initialized && user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 hover:border-slate-700 transition"
                  aria-haspopup="true"
                  aria-expanded={showUserMenu}
                  id="user-menu-btn"
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={profile?.name || "User"} className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white text-[10px] font-bold">
                      {avatarLetter}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                    {profile?.name || user.email?.split("@")[0]}
                  </span>
                  {profile?.role === "admin" && <Award className="h-3.5 w-3.5 text-amber-400" />}
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/40 p-1.5 z-50">
                    {/* Profile header */}
                    <div className="flex items-center space-x-3 px-3 py-3 mb-1 border-b border-slate-900">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white text-sm font-bold">
                          {avatarLetter}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{profile?.name || "Student"}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          profile?.role === "admin"   ? "bg-amber-500/10 text-amber-400" :
                          profile?.role === "mentor"  ? "bg-purple-500/10 text-purple-400" :
                          "bg-indigo-500/10 text-indigo-400"
                        }`}>
                          {profile?.role || "student"}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => { navigate("dashboard"); setShowUserMenu(false); }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition">
                      <LayoutDashboard className="h-3.5 w-3.5 shrink-0" /><span>Dashboard</span>
                    </button>

                    {profile?.role === "admin" && (
                      <button onClick={() => { navigate("admin"); setShowUserMenu(false); }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-amber-400 hover:bg-amber-500/10 transition">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" /><span>Admin Panel</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-900" />

                    <button onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition">
                      <LogOut className="h-3.5 w-3.5 shrink-0" /><span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : initialized && !user ? (
              <button
                onClick={() => openAuth("login")}
                className="hidden md:flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold px-4 py-2 transition"
                id="signin-navbar-btn"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-900 transition"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────── MOBILE DRAWER ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-display text-base font-bold text-white">Student AI Hub</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center space-x-3 px-5 py-4 border-b border-slate-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-700 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold">
                    {avatarLetter}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profile?.name || "Student"}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => navigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      activeTab === item.id ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}>
                    <Icon className="h-4.5 w-4.5 shrink-0" /><span>{item.label}</span>
                  </button>
                );
              })}

              {user && (
                <>
                  <div className="my-2 border-t border-slate-800" />
                  <button onClick={() => navigate("dashboard")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      activeTab === "dashboard" ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/20" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}>
                    <LayoutDashboard className="h-4.5 w-4.5 shrink-0" /><span>Dashboard</span>
                  </button>
                  {profile?.role === "admin" && (
                    <button onClick={() => navigate("admin")}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition">
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0" /><span>Admin Panel</span>
                    </button>
                  )}
                </>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              {user ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition">
                  <LogOut className="h-4 w-4" /><span>Sign Out</span>
                </button>
              ) : (
                <>
                  <button onClick={() => openAuth("login")}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
                    <LogIn className="h-4 w-4" /><span>Sign In</span>
                  </button>
                  <button onClick={() => openAuth("signup")}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-sm font-medium transition">
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── MOBILE BOTTOM NAV ──────────────────────────────────── */}
      {!mobileOpen && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800" aria-label="Mobile navigation">
          <div className="flex items-center justify-around px-2 py-2">
            {MOBILE_BOTTOM.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              // Hide "Me" tab if not logged in
              if (item.id === "dashboard" && !user) return null;
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`flex flex-col items-center min-w-[52px] py-1.5 rounded-xl transition-all ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                  aria-label={item.label} aria-current={isActive ? "page" : undefined}>
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                  <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
                  {isActive && <div className="h-1 w-1 rounded-full bg-indigo-400 mt-0.5" />}
                </button>
              );
            })}
            {!user && (
              <button onClick={() => openAuth("login")}
                className="flex flex-col items-center min-w-[52px] py-1.5 rounded-xl text-indigo-400">
                <LogIn className="h-5 w-5" />
                <span className="text-[9px] font-medium mt-0.5">Sign In</span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* ─────────────── AUTH MODAL ─────────────────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />

          <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 id="auth-modal-title" className="text-sm font-bold text-white">
                    {showForgot ? "Reset Password" : authMode === "login" ? "Welcome Back" : "Create Account"}
                  </h3>
                  <p className="text-[10px] text-slate-400">Student AI Hub</p>
                </div>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-500 hover:text-white transition" aria-label="Close">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* ── Forgot Password ── */}
              {showForgot ? (
                forgotSent ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="text-3xl">📬</div>
                    <p className="text-sm font-semibold text-white">Check your email</p>
                    <p className="text-xs text-slate-400">We sent a password reset link to <strong className="text-slate-200">{email}</strong></p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-xs text-indigo-400 hover:underline">Back to Sign In</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-xs text-slate-400">Enter your email and we'll send you a reset link.</p>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    {authError && <p className="text-xs text-red-400">{authError}</p>}
                    <button type="submit" disabled={authLoading}
                      className="w-full flex items-center justify-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
                      {authLoading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : "Send Reset Link"}
                    </button>
                    <button type="button" onClick={() => setShowForgot(false)} className="w-full text-xs text-slate-500 hover:text-slate-300 transition">← Back to Sign In</button>
                  </form>
                )
              ) : (
                <>
                  {/* ── Mode tabs ── */}
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                    {(["login", "signup"] as const).map(m => (
                      <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${authMode === m ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                        {m === "login" ? "Sign In" : "Sign Up"}
                      </button>
                    ))}
                  </div>

                  {/* ── Google OAuth button ── */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center space-x-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800/60 disabled:opacity-50 transition active:scale-95"
                    id="google-signin-btn"
                  >
                    {authLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-400/30 border-t-slate-400 animate-spin" />
                    ) : GOOGLE_ICON}
                    <span className="text-sm font-semibold text-slate-200">Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  {/* ── Email / password form ── */}
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    {authMode === "signup" && (
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@university.edu" id="auth-email-input" autoComplete="email"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                        {authMode === "login" && (
                          <button type="button" onClick={() => { setShowForgot(true); setAuthError(""); }} className="text-[10px] text-indigo-400 hover:underline">Forgot?</button>
                        )}
                      </div>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={8} id="auth-password-input"
                        autoComplete={authMode === "login" ? "current-password" : "new-password"}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      {authMode === "signup" && <p className="text-[10px] text-slate-600 mt-1">Minimum 8 characters</p>}
                    </div>

                    {authError && (
                      <div className="flex items-start space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                        <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400">{authError}</p>
                      </div>
                    )}

                    <button type="submit" disabled={authLoading}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 active:scale-95 text-white text-sm font-semibold py-2.5 transition"
                      id="auth-submit-btn">
                      {authLoading
                        ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <span>{authMode === "login" ? "Sign In" : "Create Account"}</span>
                      }
                    </button>
                  </form>

                  <p className="text-center text-[11px] text-slate-500">
                    {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
                    <button onClick={() => { setAuthMode(m => m === "login" ? "signup" : "login"); setAuthError(""); }}
                      className="text-indigo-400 font-semibold hover:underline">
                      {authMode === "login" ? "Create Account" : "Sign In"}
                    </button>
                  </p>

                  <p className="text-center text-[10px] text-slate-600">
                    By continuing you agree to our Terms & Privacy Policy.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
