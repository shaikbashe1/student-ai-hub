import React from 'react';
import { Zap, Award, BookOpen, Briefcase, MessageSquare, TrendingUp, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PLAN_LIMITS } from '../../types';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  if (!user || !profile) return null;

  const quota = profile.daily_ai_limit === -1 ? 100
    : Math.round((profile.daily_ai_requests / profile.daily_ai_limit) * 100);

  const PLAN_BADGE: Record<string, string> = {
    free: 'bg-slate-700 text-slate-300',
    pro: 'bg-indigo-500/20 text-indigo-400',
    premium: 'bg-amber-500/20 text-amber-400',
  };

  const planInfo = PLAN_LIMITS[profile.plan];

  const STATS = [
    { label: 'AI Requests Today', value: profile.daily_ai_requests, total: profile.daily_ai_limit === -1 ? '∞' : profile.daily_ai_limit, icon: Zap, color: 'text-indigo-400' },
    { label: 'Saved Items', value: profile.saved_items.length, icon: BookOpen, color: 'text-emerald-400' },
    { label: 'Plan', value: planInfo?.label ?? profile.plan, icon: Award, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-start gap-4">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-2xl font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_BADGE[profile.plan]}`}>{planInfo?.label} Plan</span>
              <span className="rounded-full border border-slate-700 px-2.5 py-0.5 text-xs text-slate-400 capitalize">{profile.role}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-400">{profile.email}</p>
            {profile.college && <p className="mt-0.5 text-xs text-slate-500">{profile.college}</p>}
            {profile.bio && <p className="mt-2 text-sm text-slate-400 line-clamp-2">{profile.bio}</p>}
            <div className="mt-3 flex gap-2">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-700 transition">
                  <Github className="h-3 w-3" /> GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-700 transition">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
            <div className="text-xl font-bold text-white">
              {s.value}{'total' in s && <span className="text-sm font-normal text-slate-500">/{s.total}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Usage */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Daily AI Quota</h3>
          </div>
          <span className="text-xs text-slate-400">
            {profile.daily_ai_limit === -1 ? 'Unlimited' : `${profile.daily_ai_requests} / ${profile.daily_ai_limit} used`}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${quota > 80 ? 'bg-red-500' : quota > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
            style={{ width: `${Math.min(quota, 100)}%` }} />
        </div>
        {profile.plan !== 'premium' && (
          <p className="mt-2 text-xs text-slate-500">
            Resets daily. <span className="text-indigo-400 cursor-pointer">Upgrade for more requests</span>
          </p>
        )}
      </div>

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Use AI Chat', icon: MessageSquare, color: 'text-indigo-400' },
            { label: 'Browse Jobs', icon: Briefcase, color: 'text-emerald-400' },
            { label: 'Study Planner', icon: BookOpen, color: 'text-purple-400' },
            { label: 'Code Challenge', icon: Zap, color: 'text-amber-400' },
          ].map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-center cursor-pointer hover:bg-slate-800 transition">
              <a.icon className={`h-5 w-5 ${a.color}`} />
              <span className="text-xs text-slate-400">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
