import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, User, LogIn, ChevronDown, ShieldAlert, Award, Menu, X,
  BookOpen, Briefcase, Trophy, Wrench, MessageSquare, LayoutDashboard,
  CreditCard, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import { PLAN_LIMITS } from '../../types';

interface NavbarProps { activeTab: string; setActiveTab: (tab: string) => void }

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'assistant', label: 'AI Tools', icon: MessageSquare },
  { id: 'internships', label: 'Internships', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'coding', label: 'Code', icon: Wrench },
  { id: 'blog', label: 'Blog', icon: BookOpen },
];

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-slate-700 text-slate-300',
  pro: 'bg-indigo-500/20 text-indigo-400',
  premium: 'bg-amber-500/20 text-amber-400',
};

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const go = (tab: string) => { setActiveTab(tab); setMobileOpen(false); };

  const quotaPercent = profile
    ? profile.daily_ai_limit === -1 ? 100
      : Math.round((profile.daily_ai_requests / profile.daily_ai_limit) * 100)
    : 0;

  const planLabel = profile ? PLAN_LIMITS[profile.plan]?.label ?? profile.plan : '';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Student <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Hub</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => go(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
                {item.label}
              </button>
            ))}
            {user && (
              <button onClick={() => go('dashboard')}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </button>
            )}
            {profile?.role === 'admin' && (
              <button onClick={() => go('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'admin' ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20' : 'text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-400'}`}>
                <ShieldAlert className="h-3.5 w-3.5" /> Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user && profile ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                    : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        {profile.role === 'admin' ? <Award className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      </div>
                    )}
                  <span className="hidden sm:block max-w-[100px] truncate font-medium">{profile.name.split(' ')[0]}</span>
                  <span className={`hidden sm:inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${PLAN_BADGE[profile.plan]}`}>
                    {planLabel}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md z-50">
                    <div className="px-3 py-3 border-b border-slate-800 mb-1">
                      <div className="flex items-center gap-2.5">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                          : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white text-sm font-bold">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                          <p className="text-xs text-slate-400 truncate">{profile.email}</p>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5 ${PLAN_BADGE[profile.plan]}`}>
                            {planLabel} Plan
                          </span>
                        </div>
                      </div>
                      {profile.daily_ai_limit !== -1 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Daily AI requests</span>
                            <span>{profile.daily_ai_requests} / {profile.daily_ai_limit}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${quotaPercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.min(quotaPercent, 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    {[
                      { label: 'My Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
                      { label: 'Pricing & Plans', icon: CreditCard, tab: 'pricing' },
                    ].map((item) => (
                      <button key={item.tab} onClick={() => { go(item.tab); setShowMenu(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition">
                        <item.icon className="h-4 w-4 text-slate-500" />{item.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button onClick={() => { void signOut(); setShowMenu(false); go('home'); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition active:scale-95">
                <LogIn className="h-4 w-4" /><span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            <button onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => go(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === item.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                <item.icon className="h-4 w-4" />{item.label}
              </button>
            ))}
            {user && (
              <button onClick={() => go('dashboard')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
            )}
          </div>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <button key={item.id} onClick={() => go(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`}>
              <item.icon className="h-5 w-5" />{item.label}
            </button>
          ))}
          {user ? (
            <button onClick={() => go('dashboard')}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
              <LayoutDashboard className="h-5 w-5" />Me
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium text-slate-500">
              <LogIn className="h-5 w-5" />Sign In
            </button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
