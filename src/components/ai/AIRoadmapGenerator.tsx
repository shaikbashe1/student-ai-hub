import React, { useState } from "react";
import { Map, Loader2, Sparkles, CheckCircle, Circle, ChevronRight, Clock, BookOpen, Code2, Target, Download } from "lucide-react";

interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  resources: { title: string; url: string; type: "video" | "article" | "course" | "practice" }[];
  milestone: string;
}

interface Roadmap {
  goal: string;
  duration_weeks: number;
  difficulty: string;
  weeks: RoadmapWeek[];
  skills_gained: string[];
  final_outcome: string;
}

const GOALS = [
  "Get into FAANG as SWE", "Become a Full Stack Developer", "Land ML Engineer role",
  "Learn Python from scratch", "Master React & Frontend", "Get into Cloud Engineering",
  "Crack competitive programming", "Become a DevOps Engineer", "Data Scientist career switch",
  "Master System Design", "Ace DSA interviews", "Start freelancing",
];

const RESOURCE_ICONS = { video: "🎬", article: "📄", course: "📚", practice: "🏋️" };
const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced:     "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AIRoadmapGenerator({ currentUser, onOpenLogin }: { currentUser: any; onOpenLogin: () => void }) {
  const [goal, setGoal]         = useState("");
  const [timeline, setTimeline] = useState(12);
  const [background, setBackground] = useState("");
  const [loading, setLoading]   = useState(false);
  const [roadmap, setRoadmap]   = useState<Roadmap | null>(null);
  const [error, setError]       = useState("");
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());

  const generate = async () => {
    if (!currentUser) { onOpenLogin(); return; }
    const goalText = goal.trim();
    if (!goalText) { setError("Please enter or select a goal."); return; }
    setLoading(true); setError(""); setRoadmap(null);
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, goal: goalText, timeline_weeks: timeline, background: background.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setRoadmap(data.roadmap);
      setCompletedWeeks(new Set());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (week: number) => {
    setCompletedWeeks(prev => {
      const next = new Set(prev);
      next.has(week) ? next.delete(week) : next.add(week);
      return next;
    });
  };

  const progress = roadmap ? Math.round((completedWeeks.size / roadmap.weeks.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8" id="ai-roadmap-generator">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
          <Map className="h-3.5 w-3.5" /><span>AI Career Roadmap</span>
        </div>
        <h2 className="font-display text-2xl font-extrabold text-white">Learning Roadmap Generator</h2>
        <p className="text-sm text-slate-400 mt-1">Tell us your goal — get a personalized week-by-week plan with resources.</p>
      </div>

      {/* Setup form */}
      {!roadmap && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          {/* Goal presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select a Common Goal</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    goal === g
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Custom goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Or Describe Your Custom Goal</label>
            <input
              type="text"
              placeholder="e.g. Become a Blockchain developer in 6 months"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Timeline slider */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Timeline: {timeline} weeks ({Math.round(timeline / 4)} months)
            </label>
            <input
              type="range" min={4} max={52} value={timeline}
              onChange={(e) => setTimeline(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>4 weeks</span><span>52 weeks</span>
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Current Background (optional)</label>
            <input
              type="text"
              placeholder="e.g. CS freshman, know basic Python, no prior web experience"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-6 py-3 transition active:scale-95"
            id="generate-roadmap-btn"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{loading ? "Generating your roadmap..." : "Generate Roadmap"}</span>
          </button>
        </div>
      )}

      {/* Roadmap display */}
      {roadmap && (
        <div className="space-y-6">
          {/* Summary header */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLES[roadmap.difficulty] ?? DIFFICULTY_STYLES.Intermediate}`}>
                    {roadmap.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5" /><span>{roadmap.duration_weeks} weeks</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{roadmap.goal}</h3>
                <p className="text-sm text-slate-400 mt-1">{roadmap.final_outcome}</p>
              </div>

              {/* Progress */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="rgb(30,41,59)" strokeWidth="5" />
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#10b981" strokeWidth="5"
                      strokeDasharray={`${(progress / 100) * 150.8} 150.8`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400">{progress}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Progress</p>
              </div>
            </div>

            {/* Skills to gain */}
            <div className="mt-4 flex flex-wrap gap-2">
              {roadmap.skills_gained.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">{skill}</span>
              ))}
            </div>
          </div>

          {/* Week-by-week timeline */}
          <div className="space-y-4">
            {roadmap.weeks.map((week) => {
              const done = completedWeeks.has(week.week);
              return (
                <div key={week.week} className={`rounded-2xl border transition-all ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-800 bg-slate-900/20"}`}>
                  <button
                    onClick={() => toggleWeek(week.week)}
                    className="w-full flex items-center space-x-4 p-5 text-left"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-slate-700 text-slate-600"}`}>
                      {done ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-bold">{week.week}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-white"}`}>
                        Week {week.week}: {week.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{week.milestone}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                  </button>

                  <div className="px-5 pb-5 space-y-4 border-t border-slate-800/50">
                    <div className="flex flex-wrap gap-1.5 pt-4">
                      {week.topics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">{t}</span>
                      ))}
                    </div>
                    {week.resources.length > 0 && (
                      <ul className="space-y-1.5">
                        {week.resources.map((r, i) => (
                          <li key={i}>
                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition">
                              <span>{RESOURCE_ICONS[r.type]}</span>
                              <span>{r.title}</span>
                              <ChevronRight className="h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { setRoadmap(null); setGoal(""); }}
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <Loader2 className="h-4 w-4" /><span>Generate New Roadmap</span>
          </button>
        </div>
      )}
    </div>
  );
}
