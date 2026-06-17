import React from 'react';
import { Sparkles, ArrowRight, Zap, Shield, BookOpen, Briefcase } from 'lucide-react';

interface WelcomeHeroProps { onGetStarted: () => void; onShowAI: () => void }

export default function WelcomeHero({ onGetStarted, onShowAI }: WelcomeHeroProps) {
  const FEATURES = [
    { icon: Zap, title: '7 AI Tools', desc: 'Chat, Resume, Interview Sim, Roadmap, Study Plan, Research & Projects', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: Briefcase, title: 'Live Job Feed', desc: 'Aggregated from Adzuna, Remotive & Arbeitnow with AI matching', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: BookOpen, title: 'Coding Platform', desc: 'Run code in Python, JavaScript, Java, C++ and C via Judge0', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Shield, title: 'Secure & Private', desc: 'Firebase Auth, RBAC, rate-limited AI, no data selling', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-medium text-indigo-400 mb-8">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini 2.0 Flash
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Your AI-Powered<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Student Career Hub
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
          7 AI tools, live job feed, interactive coding platform — everything a CS student needs to land their dream internship.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={onGetStarted}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 shadow-lg shadow-indigo-500/25">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={onShowAI}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
            Explore AI Tools
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-600">Free plan · No credit card required</p>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.bg} mb-3`}>
              <f.icon className={`h-5 w-5 ${f.color}`} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '7', label: 'AI Tools' },
            { value: '5', label: 'Languages' },
            { value: '3', label: 'Job APIs' },
            { value: '$0', label: 'To Start' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
