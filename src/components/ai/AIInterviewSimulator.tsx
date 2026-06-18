import React, { useState } from "react";
import {
  Mic, MicOff, Send, RotateCcw, Loader2, Sparkles, CheckCircle,
  AlertTriangle, MessageSquare, ChevronRight, Award, Clock
} from "lucide-react";

interface Question { id: string; question: string; category: "technical" | "behavioral" | "situational"; difficulty: "easy" | "medium" | "hard"; }
interface Answer   { questionId: string; answer: string; }
interface Feedback { questionId: string; score: number; feedback: string; model_answer: string; }

interface Session {
  questions: Question[];
  answers: Answer[];
  feedbacks: Feedback[];
  overallScore: number;
  summary: string;
}

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "ML Engineer", "Data Scientist", "Product Manager", "DevOps Engineer",
  "iOS Developer", "Android Developer", "Cybersecurity Analyst",
];

const DIFFICULTY_COLORS = {
  easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

const CATEGORY_ICONS = {
  technical:    "💻",
  behavioral:   "🤝",
  situational:  "🔍",
};

export default function AIInterviewSimulator({ currentUser, onOpenLogin }: { currentUser: any; onOpenLogin: () => void }) {
  const [role, setRole]         = useState("Software Engineer");
  const [numQ, setNumQ]         = useState(5);
  const [session, setSession]   = useState<Session | null>(null);
  const [step, setStep]         = useState<"setup" | "interview" | "results">("setup");
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [timer, setTimer]       = useState(0);
  const timerRef                = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = async () => {
    if (!currentUser) { onOpenLogin(); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/ai/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, role, numQuestions: numQ }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview");
      setSession({ questions: data.questions, answers: [], feedbacks: [], overallScore: 0, summary: "" });
      setStep("interview");
      setCurrentQ(0);
      setCurrentAnswer("");
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;
    const q = session.questions[currentQ];
    const updatedAnswers = [...session.answers, { questionId: q.id, answer: currentAnswer.trim() }];

    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          question: q.question,
          answer: currentAnswer.trim(),
          role,
          category: q.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedFeedbacks = [...session.feedbacks, { questionId: q.id, ...data.evaluation }];
      const isLast = currentQ >= session.questions.length - 1;

      if (isLast) {
        if (timerRef.current) clearInterval(timerRef.current);
        const overallScore = Math.round(updatedFeedbacks.reduce((s, f) => s + f.score, 0) / updatedFeedbacks.length);
        const summaryRes = await fetch("/api/ai/interview/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser?.id, role, feedbacks: updatedFeedbacks, overallScore }),
        });
        const summaryData = await summaryRes.json();
        setSession({ ...session, answers: updatedAnswers, feedbacks: updatedFeedbacks, overallScore, summary: summaryData.summary || "" });
        setStep("results");
      } else {
        setSession({ ...session, answers: updatedAnswers, feedbacks: updatedFeedbacks });
        setCurrentQ(q => q + 1);
        setCurrentAnswer("");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(null); setStep("setup"); setCurrentQ(0);
    setCurrentAnswer(""); setError(""); setTimer(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const scoreColor = (n: number) => n >= 8 ? "text-emerald-400" : n >= 6 ? "text-amber-400" : "text-red-400";

  // ── SETUP SCREEN ──────────────────────────────────────────────────
  if (step === "setup") return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-8" id="ai-interview-simulator">
      <div>
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 mb-3">
          <Mic className="h-3.5 w-3.5" /><span>AI Interview Simulator</span>
        </div>
        <h2 className="font-display text-2xl font-extrabold text-white">Mock Interview</h2>
        <p className="text-sm text-slate-400 mt-1">Practice with AI, get instant feedback, and ace your next interview.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Number of Questions: {numQ}
          </label>
          <input
            type="range" min={3} max={10} value={numQ}
            onChange={(e) => setNumQ(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>3 (Quick ~10 min)</span><span>10 (Full ~35 min)</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["technical", "behavioral", "situational"] as const).map(cat => (
            <div key={cat} className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-center">
              <div className="text-xl mb-1">{CATEGORY_ICONS[cat]}</div>
              <p className="text-[10px] font-semibold text-slate-400 capitalize">{cat}</p>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={startSession}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-3 transition active:scale-95"
          id="start-interview-btn"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          <span>{loading ? "Preparing questions..." : "Start Interview"}</span>
        </button>
      </div>
    </div>
  );

  // ── INTERVIEW SCREEN ──────────────────────────────────────────────
  if (step === "interview" && session) {
    const q = session.questions[currentQ];
    const progress = ((currentQ) / session.questions.length) * 100;
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Question {currentQ + 1} of {session.questions.length}</span>
          <span className="flex items-center space-x-1.5"><Clock className="h-3.5 w-3.5" /><span>{formatTime(timer)}</span></span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800">
          <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[q.difficulty]}`}>{q.difficulty}</span>
            <span className="text-xs text-slate-500">{CATEGORY_ICONS[q.category]} {q.category}</span>
          </div>
          <p className="text-base font-semibold text-white leading-relaxed">{q.question}</p>
        </div>

        {/* Answer area */}
        <div className="space-y-3">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here... Be specific, use the STAR method for behavioral questions."
            rows={8}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-600">{currentAnswer.length} characters</p>
            <button
              onClick={submitAnswer}
              disabled={loading || !currentAnswer.trim()}
              className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 transition active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{loading ? "Evaluating..." : currentQ < session.questions.length - 1 ? "Next Question" : "Finish Interview"}</span>
            </button>
          </div>
        </div>

        <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 flex items-center space-x-1 transition">
          <RotateCcw className="h-3.5 w-3.5" /><span>Start Over</span>
        </button>
      </div>
    );
  }

  // ── RESULTS SCREEN ────────────────────────────────────────────────
  if (step === "results" && session) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
          <Award className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h2 className="font-display text-2xl font-extrabold text-white">Interview Complete!</h2>
          <p className="text-slate-400 text-sm mt-1">Role: {role}</p>
          <div className={`text-5xl font-black mt-4 ${scoreColor(session.overallScore)}`}>
            {session.overallScore}<span className="text-xl text-slate-500">/10</span>
          </div>
          {session.summary && <p className="text-sm text-slate-300 mt-4 max-w-lg mx-auto leading-relaxed">{session.summary}</p>}
        </div>

        <div className="space-y-4">
          {session.questions.map((q, i) => {
            const fb = session.feedbacks.find(f => f.questionId === q.id);
            const ans = session.answers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-200 flex-1">{i + 1}. {q.question}</p>
                  {fb && <span className={`text-lg font-black shrink-0 ${scoreColor(fb.score)}`}>{fb.score}/10</span>}
                </div>
                {ans && <p className="text-xs text-slate-400 bg-slate-950/60 rounded-xl p-3 border border-slate-800">{ans.answer}</p>}
                {fb && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-300">{fb.feedback}</p>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-indigo-300"><strong>Model Answer:</strong> {fb.model_answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={reset} className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 transition">
          <RotateCcw className="h-4 w-4" /><span>Practice Again</span>
        </button>
      </div>
    );
  }
  return null;
}
