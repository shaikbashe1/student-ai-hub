import React, { useState } from "react";
import { Sparkles, User, LogIn, ChevronDown, Check, ShieldAlert, Award } from "lucide-react";
import { Profile } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Profile | null;
  onLogin: (email: string, name?: string) => void;
  onLogout: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogin,
  onLogout,
}: NavbarProps) {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      onLogin(emailInput.trim(), nameInput.trim());
      setShowLoginModal(false);
      setEmailInput("");
      setNameInput("");
    }
  };

  const navItems = [
    { id: "home", label: "Overview" },
    { id: "assistant", label: "AI Coder" },
    { id: "tools", label: "AI Tools" },
    { id: "internships", label: "Internships" },
    { id: "hackathons", label: "Hackathons" },
    { id: "blog", label: "Strategic Blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div 
          onClick={() => setActiveTab("home")} 
          className="flex cursor-pointer items-center space-x-2.5 group"
          id="navbar-logo"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/20 duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
            Student <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Hub</span>
          </span>
        </div>

        {/* Navigation Middle */}
        <nav className="hidden md:flex space-x-1" id="navbar-middle-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
          {currentUser && (
            <button
              onClick={() => setActiveTab("dashboard")}
              id="nav-tab-dashboard-lnk"
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              My Hub
            </button>
          )}
          {currentUser?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              id="nav-tab-admin-lnk"
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                activeTab === "admin"
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20"
                  : "text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-400"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Right Nav Options */}
        <div className="flex items-center space-x-3" id="navbar-actions-panel">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition duration-150"
                id="user-profile-menu-btn"
              >
                {currentUser.role === "admin" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <Award className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                    <User className="h-3 w-3" />
                  </div>
                )}
                <span className="font-medium max-w-[100px] truncate">{currentUser.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {/* Account Dropdown Switcher */}
              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Currently Logged In</p>
                    <p className="font-semibold text-white mt-1 text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-1.5 ${
                      currentUser.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                    }`}>
                      {currentUser.role === "admin" ? "System Admin" : "Active Student"}
                    </span>
                  </div>

                  <div className="py-1">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Sandbox Toggles</p>
                    
                    {/* Switch to Admin */}
                    <button
                      onClick={() => {
                        onLogin("shaikbashe1111@gmail.com", "Shaik Basheer");
                        setShowSwitchMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800/60 duration-150"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                        <span>Admin Account</span>
                      </div>
                      {currentUser.role === "admin" && <Check className="h-3 w-3 text-indigo-400" />}
                    </button>

                    {/* Switch to Regular Student */}
                    <button
                      onClick={() => {
                        onLogin("student@example.com", "Student Alpha");
                        setShowSwitchMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800/60 duration-150"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                        <span>Student Account</span>
                      </div>
                      {currentUser.role !== "admin" && <Check className="h-3 w-3 text-indigo-400" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowSwitchMenu(false);
                        setActiveTab("home");
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 duration-150"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-95 text-white text-xs font-semibold px-4 py-2 hover:shadow-lg transition-all duration-150"
              id="signin-navbar-btn"
            >
              <LogIn className="h-4 w-4" />
              <span>Student Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Login Dialog Modal Sheet */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Sign In to Student AI Hub</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-100 font-bold px-2 py-1 hover:bg-slate-800 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              Entering <strong className="text-white">shaikbashe1111@gmail.com</strong> will automatically grant you full <strong className="text-amber-400">System Admin</strong> powers to access the Admin Panel!
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. shaikbashe1111@gmail.com / name@school.edu"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Shaik Basheer"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all duration-150 hover:shadow-indigo-500/20"
              >
                Authenticate Now
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
