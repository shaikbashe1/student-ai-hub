import React from "react";
import { Sparkles, Terminal, BookOpen, Briefcase, Trophy, ArrowRight, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";
import { AITool, Internship, Hackathon } from "../types";

interface WelcomeHeroProps {
  setActiveTab: (tab: string) => void;
  featuredTools: AITool[];
  featuredInternships: Internship[];
  featuredHackathons: Hackathon[];
  dailyPromptsRemaining: number;
}

export default function WelcomeHero({
  setActiveTab,
  featuredTools,
  featuredInternships,
  featuredHackathons,
  dailyPromptsRemaining,
}: WelcomeHeroProps) {
  // Take first 3 for preview
  const previewTools = featuredTools.slice(0, 3);
  const previewInternships = featuredInternships.slice(0, 3);
  const previewHackathons = featuredHackathons.slice(0, 3);

  return (
    <div className="space-y-16 py-8" id="welcome-hero-page">
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>The Next-Generation Student Co-Pilot</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-2xl leading-[1.1]">
              Your AI-Powered <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Student Companion
              </span>
            </h1>

            <p className="font-sans text-base text-slate-300 md:text-lg max-w-xl leading-relaxed">
              Code smarter with real-time AI assistance, discover curated developer directories, and land career opportunities at major internships and global hackathons.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setActiveTab("assistant")}
                className="flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20 dynamic-cta-btn active:scale-95 text-white text-sm font-semibold px-6 py-3.5 hover:shadow-lg transition-all duration-150"
              >
                <Terminal className="h-4.5 w-4.5" />
                <span>Start Coding Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={() => setActiveTab("tools")}
                className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 active:scale-95 text-slate-200 hover:text-white text-sm font-semibold px-6 py-3.5 transition-all duration-150"
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span>Explore AI Tools</span>
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="pt-8 border-t border-slate-900/60 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">10,000+</p>
                <p className="text-xs text-slate-500 font-medium uppercase mt-0.5 tracking-wider">Active Students</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">500+</p>
                <p className="text-xs text-slate-500 font-medium uppercase mt-0.5 tracking-wider">Indexed Tools</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">1,000+</p>
                <p className="text-xs text-slate-500 font-medium uppercase mt-0.5 tracking-wider">Internships</p>
              </div>
            </div>
          </div>

          {/* Hero Right: Tech Code Interface Display */}
          <div className="lg:col-span-5 relative" id="animated-hero-panel">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-30 blur-xl" />
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-1.5 shadow-2xl backdrop-blur-sm">
              {/* Header Editor Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 bg-slate-950/40 rounded-t-xl">
                <div className="flex space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <span className="font-mono text-xs text-slate-500">student_helper.py</span>
                <div className="h-3 w-3" />
              </div>

              {/* Code Editor Mockup screen */}
              <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-300 min-h-[220px]">
                <p className="text-purple-400">import <span className="text-slate-100">gemini</span></p>
                <p className="text-emerald-400"># Analyze homework assignment requirements</p>
                <p className="text-blue-400">def <span className="text-cyan-300">optimize_algorithm</span><span className="text-slate-100">(code)</span>:</p>
                <p className="pl-4 text-slate-400">suggestions = gemini.analyze(code)</p>
                <p className="pl-4 text-purple-400">if <span className="text-slate-100">suggestions.time_complexity &gt; </span><span className="text-amber-400">&quot;O(N)&quot;</span>:</p>
                <p className="pl-8 text-slate-100">result = rewrite_nested_loops(code)</p>
                <p className="pl-8 text-pink-400">return <span className="text-slate-300">result</span></p>
                <p className="text-emerald-400"># AI suggestions active</p>
                <div className="mt-4 p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 flex items-start space-x-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 mt-0.5">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">STUDENT AI NOTE</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">Nested loops can be optimized with a Hash Map to run in O(N) time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN BENTO GRID ROOT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl mb-8">
          The Hub At A Glance
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Bento Card 1: Chat Assistant Shortcut (Span 2) */}
          <div className="md:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">20 Prompts Free Daily</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mt-4 group-hover:text-indigo-400 duration-150">AI Coding Assistant</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Stuck with code glitches or algorithm design? Type in Python, Java, C++, TypeScript, or SQL, and get clean, explained remedies.
              </p>

              {/* Languages selective chip mock */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {["Python", "Java", "C++", "TypeScript", "JavaScript", "SQL", "C"].map((lng) => (
                  <span key={lng} className="px-2.5 py-0.5 rounded-md border border-slate-800 text-[10px] font-medium text-slate-400 bg-slate-950/40">
                    {lng}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Daily Limit Status: {dailyPromptsRemaining}/20 prompts remaining</span>
              <button
                onClick={() => setActiveTab("assistant")}
                className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                <span>Open Terminal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bento Card 2: Personal limits Progress circle */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between hover:shadow-xl group">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-md text-white mt-4 group-hover:text-purple-400 duration-150">Your Student Statistics</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Track your bookmarks, saved opportunity applications, and daily assistant quota.
              </p>

              {/* Progress gauge visual */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="relative flex items-center justify-center h-14 w-14 rounded-full border border-slate-800 bg-slate-950">
                  <span className="text-xs font-bold text-white text-center">
                    {Math.round((dailyPromptsRemaining / 20) * 100)}%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Daily Quota Status</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{dailyPromptsRemaining} free prompts left</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center justify-between text-xs font-bold text-purple-400 hover:text-purple-300 mt-4"
            >
              <span>View Saved Items</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. LANDING PAGE TRENDING PREVIEWS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Trending AI Tools Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-teal-500/10 text-teal-400">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-200">Featured AI Tools</h3>
            </div>
            <button
              onClick={() => setActiveTab("tools")}
              className="text-xs text-indigo-400 font-semibold hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-3">
            {previewTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setActiveTab("tools")}
                className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition duration-150 cursor-pointer flex items-start justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">{tool.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tool.description}</p>
                  <span className="inline-block mt-2 text-[9px] font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-indigo-400 uppercase">
                    {tool.category}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{tool.pricing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Internships Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/10 text-amber-400">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-200">Open Internships</h3>
            </div>
            <button
              onClick={() => setActiveTab("internships")}
              className="text-xs text-indigo-400 font-semibold hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-3">
            {previewInternships.map((job) => (
              <div
                key={job.id}
                onClick={() => setActiveTab("internships")}
                className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition duration-150 cursor-pointer flex justify-between items-start group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-4 w-4 rounded-full bg-slate-800 text-[9px] flex items-center justify-center font-bold text-white border border-slate-700">
                      {job.company[0]}
                    </span>
                    <h4 className="text-xs font-bold text-indigo-400 group-hover:underline">{job.company}</h4>
                  </div>
                  <h5 className="text-[11px] font-semibold text-slate-200">{job.role}</h5>
                  <p className="text-[10px] text-slate-500">{job.location} · {job.is_remote ? "Remote" : "Onsite"}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 block">{job.stipend}</span>
                  <span className="text-[9px] text-slate-500 block mt-1">Due: {job.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlighted Hackathons Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/10 text-purple-400">
                <Trophy className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-200">High-Stake Hackathons</h3>
            </div>
            <button
              onClick={() => setActiveTab("hackathons")}
              className="text-xs text-indigo-400 font-semibold hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-3">
            {previewHackathons.map((hack) => (
              <div
                key={hack.id}
                onClick={() => setActiveTab("hackathons")}
                className="p-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition duration-150 cursor-pointer flex justify-between items-start group"
              >
                <div>
                  <h4 className="text-xs font-bold text-indigo-400 group-hover:underline ">{hack.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">By {hack.organizer}</p>
                  <span className="inline-block mt-2 text-[9px] font-semibold text-amber-400 border border-amber-400/20 bg-amber-450/5 px-2 py-0.5 rounded">
                    Pool: {hack.prize_pool}
                  </span>
                </div>
                <span className="text-[9px] font-medium text-slate-500">Deadline: {hack.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
