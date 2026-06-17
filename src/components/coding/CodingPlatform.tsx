import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { runCode, LANGUAGE_IDS } from '../../lib/judge0';
import type { RunResult } from '../../lib/judge0';

type Language = keyof typeof LANGUAGE_IDS;

const STARTERS: Record<Language, string> = {
  python: 'n = int(input())\nprint(n)',
  javascript: 'process.stdin.resume();\nprocess.stdin.on("data",d=>console.log(d.toString().trim()));',
  java: 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(new Scanner(System.in).nextLine());\n  }\n}',
  cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }',
  c: '#include<stdio.h>\nint main(){ return 0; }',
};

const PROBLEMS = [
  { title: 'Echo Input', diff: 'Easy', desc: 'Read a line and print it back.', input: 'Hello World', output: 'Hello World' },
  { title: 'Sum Two', diff: 'Easy', desc: 'Read two numbers and print their sum.', input: '3 5', output: '8' },
  { title: 'Fibonacci', diff: 'Easy', desc: 'Print the Nth Fibonacci number (0-indexed).', input: '10', output: '55' },
];

const STATUS_COLOR: Record<string, string> = {
  accepted: 'text-emerald-400', wrong_answer: 'text-red-400',
  error: 'text-red-400', runtime_error: 'text-red-400',
  compilation_error: 'text-amber-400', time_limit: 'text-amber-400', running: 'text-indigo-400',
};

export default function CodingPlatform() {
  const [lang, setLang] = useState<Language>('python');
  const [code, setCode] = useState(STARTERS.python);
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [prob, setProb] = useState(PROBLEMS[0]);

  const run = async () => {
    if (!code.trim() || loading) return;
    setLoading(true); setResult(null);
    try {
      setResult(await runCode(code, lang, stdin || prob.input));
    } catch {
      setResult({ status: 'error', statusLabel: 'Error', output: 'Network error.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Coding Platform</h1>
        <p className="text-sm text-slate-400 mt-0.5">Run code in 5 languages via Judge0</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PROBLEMS.map((p) => (
          <button key={p.title} onClick={() => { setProb(p); setStdin(p.input); }}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${prob.title === p.title ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {p.title}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
          <h2 className="text-sm font-bold text-white">{prob.title}</h2>
          <p className="text-sm text-slate-400">{prob.desc}</p>
          <div className="rounded-xl bg-slate-950 p-3 text-xs font-mono space-y-1">
            <div><span className="text-slate-500">Input: </span><span className="text-slate-300">{prob.input}</span></div>
            <div><span className="text-slate-500">Output: </span><span className="text-emerald-400">{prob.output}</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
            <div className="flex gap-1">
              {(Object.keys(LANGUAGE_IDS) as Language[]).map((l) => (
                <button key={l} onClick={() => { setLang(l); setCode(STARTERS[l]); }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => void run()} disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition">
              {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Play className="h-3.5 w-3.5" />}
              Run
            </button>
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={14} spellCheck={false}
            className="w-full bg-slate-950 px-4 py-3 text-xs font-mono text-slate-200 focus:outline-none resize-none" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <label className="block text-xs font-semibold text-slate-400 mb-2">Standard Input</label>
          <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={3} placeholder={prob.input}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-300 focus:border-indigo-500 focus:outline-none resize-none" />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400">Output</label>
            {result && (
              <span className={`flex items-center gap-1 text-xs font-semibold ${STATUS_COLOR[result.status] ?? 'text-slate-400'}`}>
                {result.status === 'accepted' ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {result.statusLabel}
                {result.runtime_ms != null && (
                  <span className="text-slate-500 ml-1 flex items-center gap-0.5"><Clock className="h-3 w-3" />{result.runtime_ms}ms</span>
                )}
              </span>
            )}
          </div>
          <div className="h-[72px] overflow-auto rounded-xl bg-slate-950 px-3 py-2">
            {result
              ? <pre className={`text-xs font-mono ${result.status !== 'accepted' ? 'text-red-400' : 'text-emerald-400'}`}>{result.output || '(no output)'}</pre>
              : <p className="text-xs text-slate-600">Run code to see output...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
