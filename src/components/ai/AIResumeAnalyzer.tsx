import React, { useState } from "react";
import {
  FileText, Upload, Loader2, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Sparkles, Target, BookOpen, Code2, Award
} from "lucide-react";

interface AnalysisResult {
  ats_score: number;
  overall_grade: string;
  sections: {
    name: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  skill_gaps: string[];
  strengths: string[];
  improvements: string[];
  keywords_missing: string[];
}

export default function AIResumeAnalyzer({ currentUser, onOpenLogin }: { currentUser: any; onOpenLogin: () => void }) {
  const [resumeText, setResumeText]   = useState("");
  const [targetRole, setTargetRole]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<AnalysisResult | null>(null);
  const [error, setError]             = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const analyze = async () => {
    if (!currentUser) { onOpenLogin(); return; }
    if (!resumeText.trim()) { setError("Please paste your resume content."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          resumeText: resumeText.trim(),
          targetRole: targetRole.trim() || "Software Engineer",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const scoreBg = (score: number) =>
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8" id="ai-resume-analyzer">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Analysis</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Resume Analyzer</h2>
          <p className="text-sm text-slate-400 mt-1">Get your ATS score, skill gaps, and actionable improvements in seconds.</p>
        </div>
      </div>

      {/* Input form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Role (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Software Engineer at Google, ML Engineer, Product Manager"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Paste Your Resume Content *
          </label>
          <textarea
            placeholder="Paste the full text content of your resume here — work experience, education, skills, projects..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none font-mono"
          />
          <p className="text-[11px] text-slate-600 mt-1.5">{resumeText.length} characters</p>
        </div>
        {error && (
          <div className="flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white text-sm font-semibold px-6 py-3 transition"
          id="analyze-resume-btn"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? "Analyzing..." : "Analyze Resume"}</span>
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* ATS Score hero card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Score ring */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(30,41,59)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={result.ats_score >= 80 ? "#10b981" : result.ats_score >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      strokeDasharray={`${(result.ats_score / 100) * 263.9} 263.9`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-black ${scoreColor(result.ats_score)}`}>{result.ats_score}</span>
                    <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">ATS Score</span>
                  </div>
                </div>
                <span className={`mt-2 text-sm font-bold ${scoreColor(result.ats_score)}`}>{result.overall_grade}</span>
              </div>

              {/* Quick stats */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
                  <p className="text-xs text-slate-500 mb-1">Strengths Found</p>
                  <p className="text-xl font-bold text-emerald-400">{result.strengths.length}</p>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
                  <p className="text-xs text-slate-500 mb-1">Skill Gaps</p>
                  <p className="text-xl font-bold text-amber-400">{result.skill_gaps.length}</p>
                </div>
                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">
                  <p className="text-xs text-slate-500 mb-1">Missing Keywords</p>
                  <p className="text-xl font-bold text-red-400">{result.keywords_missing.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section scores */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-base font-bold text-white mb-4">Section Analysis</h3>
            <div className="space-y-3">
              {result.sections.map((section) => (
                <div key={section.name} className="border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-900/40 transition"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className={`text-sm font-semibold ${scoreColor(section.score)}`}>{section.score}%</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 max-w-24">
                        <div
                          className={`h-1.5 rounded-full ${scoreBg(section.score)}`}
                          style={{ width: `${section.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300 font-medium truncate">{section.name}</span>
                    </div>
                    {expandedSection === section.name ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
                  </button>
                  {expandedSection === section.name && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-800 bg-slate-950/30">
                      <p className="text-sm text-slate-300 pt-3">{section.feedback}</p>
                      {section.suggestions.length > 0 && (
                        <ul className="space-y-1.5">
                          {section.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start space-x-2 text-xs text-slate-400">
                              <CheckCircle className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skill gaps + Missing keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4" /><span>Skill Gaps to Address</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skill_gaps.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">{skill}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" /><span>Missing ATS Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keywords_missing.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Top improvements */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
            <h3 className="text-sm font-bold text-indigo-400 mb-4 flex items-center space-x-2">
              <Sparkles className="h-4 w-4" /><span>Top Improvements</span>
            </h3>
            <ol className="space-y-3">
              {result.improvements.map((imp, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-300">{imp}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
