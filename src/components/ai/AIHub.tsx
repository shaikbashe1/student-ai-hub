import React, { useState } from 'react';
import { MessageSquare, FileText, Mic, Map, Calendar, Search, Lightbulb } from 'lucide-react';
import ChatAssistant from './ChatAssistant';
import ResumeAnalyzer from './ResumeAnalyzer';
import InterviewSimulator from './InterviewSimulator';
import RoadmapGenerator from './RoadmapGenerator';
import StudyPlanner from './StudyPlanner';
import ResearchAssistant from './ResearchAssistant';
import ProjectGenerator from './ProjectGenerator';

const TOOLS = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, desc: 'Code help, career advice, Q&A', color: 'from-indigo-500 to-purple-500' },
  { id: 'resume', label: 'Resume Analyzer', icon: FileText, desc: 'ATS score + skill gap analysis', color: 'from-emerald-500 to-teal-500' },
  { id: 'interview', label: 'Interview Sim', icon: Mic, desc: 'Practice with instant feedback', color: 'from-purple-500 to-pink-500' },
  { id: 'roadmap', label: 'Roadmap', icon: Map, desc: 'Personalized learning paths', color: 'from-blue-500 to-indigo-500' },
  { id: 'study', label: 'Study Planner', icon: Calendar, desc: 'Structured study schedules', color: 'from-teal-500 to-emerald-500' },
  { id: 'research', label: 'Research', icon: Search, desc: 'Deep-dive topic research', color: 'from-violet-500 to-purple-500' },
  { id: 'projects', label: 'Project Ideas', icon: Lightbulb, desc: 'Portfolio project inspiration', color: 'from-amber-500 to-orange-500' },
] as const;

type ToolId = typeof TOOLS[number]['id'];

const COMPONENTS: Record<ToolId, React.ComponentType> = {
  chat: ChatAssistant,
  resume: ResumeAnalyzer,
  interview: InterviewSimulator,
  roadmap: RoadmapGenerator,
  study: StudyPlanner,
  research: ResearchAssistant,
  projects: ProjectGenerator,
};

export default function AIHub() {
  const [active, setActive] = useState<ToolId>('chat');
  const ActiveComp = COMPONENTS[active];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Tools</h1>
        <p className="mt-1 text-sm text-slate-400">7 AI-powered tools to accelerate your learning and career.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = active === tool.id;
          return (
            <button key={tool.id} onClick={() => setActive(tool.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition ${isActive ? 'bg-slate-800 ring-1 ring-slate-600' : 'bg-slate-900 hover:bg-slate-800/50'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${tool.color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[11px] font-medium leading-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{tool.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <ActiveComp />
      </div>
    </div>
  );
}
