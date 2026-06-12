import React from "react";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 pb-8 pt-12 text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-display text-sm font-semibold text-slate-300">Student AI Hub</span>
            </div>
            <p className="mt-2 text-xs max-w-sm text-slate-400 leading-relaxed">
              Accelerating student success through artificial intelligence, directories of tools, first-class internships, and major hackathons.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-2.5">Resources</p>
              <ul className="space-y-1.5">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 duration-150">Open Source code</a></li>
                <li><a href="https://careers.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 duration-150">University programs</a></li>
                <li><a href="https://mlh.io" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 duration-150">Major League Hacking</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-2.5">API Stack</p>
              <ul className="space-y-1.5">
                <li><a href="https://ai.google.dev/gemini" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 duration-150">Google Gemini-3.5</a></li>
                <li><a href="https://vite.dev" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 duration-150">Vite React</a></li>
                <li><a href="https://expressjs.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 duration-150">Node.js Express</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Student AI Hub. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Designed in the spirit of code craft for students</span>
            <Heart className="h-3 w-3 text-indigo-500 fill-indigo-500/30" />
          </p>
        </div>
      </div>
    </footer>
  );
}
