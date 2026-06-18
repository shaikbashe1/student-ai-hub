import React, { useState, useEffect } from "react";
import { Code2, Play, Loader2, CheckCircle, XCircle, Terminal, ChevronDown, RotateCcw, Copy, Check } from "lucide-react";

interface TestCase { input: string; expected_output: string; }
interface Challenge { id: string; title: string; description: string; difficulty: "Easy" | "Medium" | "Hard"; test_cases: TestCase[]; starter_code: Record<string, string>; hints: string[]; }
interface ExecutionResult { status: string; output: string; time: string; memory: string; passed: boolean; test_results: { input: string; expected: string; actual: string; passed: boolean }[]; }

const LANGUAGES = [
  { id: "python3",    label: "Python 3",    judge0_id: 71 },
  { id: "javascript", label: "JavaScript",  judge0_id: 63 },
  { id: "java",       label: "Java",        judge0_id: 62 },
  { id: "cpp",        label: "C++",         judge0_id: 54 },
  { id: "c",          label: "C",           judge0_id: 50 },
];

const DIFFICULTY_STYLES = {
  Easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

const DEFAULT_CODE: Record<string, string> = {
  python3:    "# Write your solution here\ndef solution():\n    pass\n\nprint(solution())",
  javascript: "// Write your solution here\nfunction solution() {\n  \n}\n\nconsole.log(solution());",
  java:       "public class Main {\n  public static void main(String[] args) {\n    // Write solution here\n  }\n}",
  cpp:        "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Write solution here\n  return 0;\n}",
  c:          "#include <stdio.h>\n\nint main() {\n  // Write solution here\n  return 0;\n}",
};

export default function OnlineCompiler({ currentUser }: { currentUser: any }) {
  const [language, setLanguage]     = useState("python3");
  const [code, setCode]             = useState(DEFAULT_CODE.python3);
  const [input, setInput]           = useState("");
  const [executing, setExecuting]   = useState(false);
  const [result, setResult]         = useState<{ output?: string; error?: string; time?: string } | null>(null);
  const [challenge, setChallenge]   = useState<Challenge | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [showHint, setShowHint]     = useState(false);
  const [hintIdx, setHintIdx]       = useState(0);
  const [copied, setCopied]         = useState(false);
  const [mode, setMode]             = useState<"free" | "challenge">("free");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (!challenge) setCode(DEFAULT_CODE[lang] || "");
    else setCode(challenge.starter_code[lang] || DEFAULT_CODE[lang] || "");
  };

  const execute = async () => {
    if (!code.trim()) return;
    setExecuting(true); setResult(null);
    try {
      const res = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language_id: LANGUAGES.find(l => l.id === language)?.judge0_id, stdin: input }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message || "Execution failed" });
    } finally {
      setExecuting(false);
    }
  };

  const fetchChallenge = async () => {
    setLoadingChallenge(true);
    try {
      const res = await fetch("/api/ai/challenge?language=" + language);
      const data = await res.json();
      if (data.challenge) {
        setChallenge(data.challenge);
        setCode(data.challenge.starter_code[language] || DEFAULT_CODE[language]);
        setMode("challenge");
        setShowHint(false);
        setHintIdx(0);
        setResult(null);
      }
    } catch {
    } finally {
      setLoadingChallenge(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode(challenge?.starter_code[language] || DEFAULT_CODE[language]);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6" id="online-compiler">
      {/* Header + mode tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
            <Terminal className="h-3.5 w-3.5" /><span>Online Compiler</span>
          </div>
          <h2 className="font-display text-xl font-extrabold text-white">Code Execution Engine</h2>
        </div>
        <div className="flex items-center space-x-2">
          {(["free", "challenge"] as const).map(m => (
            <button key={m}
              onClick={() => { setMode(m); if (m === "free") { setChallenge(null); setCode(DEFAULT_CODE[language]); } else fetchChallenge(); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${mode === m ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30" : "text-slate-400 hover:text-slate-200 border border-slate-800"}`}
            >
              {m === "free" ? "Free Coding" : "AI Challenge"}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge description */}
      {challenge && mode === "challenge" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">{challenge.title}</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[challenge.difficulty]}`}>{challenge.difficulty}</span>
            </div>
            <button onClick={fetchChallenge} disabled={loadingChallenge} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition">
              {loadingChallenge ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              <span>New Challenge</span>
            </button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{challenge.description}</p>
          {challenge.hints.length > 0 && (
            <div>
              <button onClick={() => { setShowHint(true); setHintIdx(prev => Math.min(prev + 1, challenge.hints.length - 1)); }}
                className="text-xs text-amber-400 hover:underline">
                {showHint ? `Hint ${hintIdx + 1}/${challenge.hints.length}` : "Show Hint 💡"}
              </button>
              {showHint && <p className="mt-1.5 text-xs text-amber-300 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2">{challenge.hints[hintIdx]}</p>}
            </div>
          )}
        </div>
      )}

      {/* Main editor area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Code editor panel */}
        <div className="lg:col-span-2 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
            <div className="flex items-center space-x-1">
              {LANGUAGES.map(l => (
                <button key={l.id}
                  onClick={() => handleLanguageChange(l.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${language === l.id ? "bg-cyan-500/15 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={copyCode} className="text-slate-500 hover:text-slate-300 transition" aria-label="Copy code">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <button onClick={resetCode} className="text-slate-500 hover:text-slate-300 transition" aria-label="Reset code">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Code textarea */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900/60 flex flex-col pt-3 items-center pointer-events-none select-none">
              {code.split("\n").map((_, i) => (
                <div key={i} className="text-[11px] text-slate-700 leading-6 w-full text-center">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-3 text-sm font-mono text-slate-200 outline-none resize-none min-h-[360px] leading-6"
              spellCheck={false}
              id="code-editor-textarea"
            />
          </div>

          {/* Run button */}
          <button
            onClick={execute}
            disabled={executing || !code.trim()}
            className="flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 transition active:scale-95"
            id="run-code-btn"
          >
            {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>{executing ? "Running..." : "Run Code"}</span>
          </button>
        </div>

        {/* Right panel — stdin + output */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Standard Input (stdin)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Program input (optional)..."
              rows={5}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-mono text-slate-300 placeholder-slate-600 outline-none resize-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Output</label>
            <div className={`rounded-xl border min-h-[180px] p-4 font-mono text-xs leading-relaxed ${
              result?.error ? "border-red-500/20 bg-red-500/5 text-red-300" :
              executing ? "border-slate-800 bg-slate-950 text-slate-500" :
              "border-emerald-500/20 bg-slate-950 text-emerald-300"
            }`}>
              {executing ? (
                <div className="flex items-center space-x-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /><span>Executing...</span>
                </div>
              ) : result ? (
                <>
                  {result.error && <p className="text-red-400">{result.error}</p>}
                  {result.output && <pre className="whitespace-pre-wrap">{result.output}</pre>}
                  {result.time && <p className="text-slate-600 mt-2 text-[10px]">⏱ {result.time} ms</p>}
                </>
              ) : (
                <p className="text-slate-600">Click "Run Code" to see output here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
