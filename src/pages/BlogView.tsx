import React, { useState } from 'react';
import { BookOpen, Clock, Tag, User } from 'lucide-react';
import type { BlogPost } from '../types';

const SAMPLE_POSTS: BlogPost[] = [
  { id: '1', title: 'How I Landed a Google Internship as a Sophomore', slug: 'google-internship', content: '', excerpt: 'The complete roadmap I followed to crack Google SWE internship.', cover_image: undefined, author_id: 'a1', author_name: 'Priya Sharma', author_avatar: undefined, tags: ['Interview', 'Google', 'Career'], category: 'Career', is_published: true, created_at: '2025-01-15', updated_at: '2025-01-15', published_at: '2025-01-15', views: 4823, likes: 312, seo_keywords: [], reading_time_minutes: 8 },
  { id: '2', title: 'Top 10 Open Source Projects to Contribute to in 2025', slug: 'open-source-2025', content: '', excerpt: 'Contributing to open source is the fastest way to build skills and get noticed.', cover_image: undefined, author_id: 'a2', author_name: 'Rohan Verma', author_avatar: undefined, tags: ['Open Source', 'GitHub', 'Projects'], category: 'Development', is_published: true, created_at: '2025-02-03', updated_at: '2025-02-03', published_at: '2025-02-03', views: 2157, likes: 98, seo_keywords: [], reading_time_minutes: 6 },
  { id: '3', title: 'System Design for Beginners: A Complete Guide', slug: 'system-design-beginners', content: '', excerpt: 'Everything you need to know about system design interviews.', cover_image: undefined, author_id: 'a3', author_name: 'Aisha Patel', author_avatar: undefined, tags: ['System Design', 'Interview', 'Architecture'], category: 'Interview', is_published: true, created_at: '2025-02-20', updated_at: '2025-02-20', published_at: '2025-02-20', views: 7341, likes: 589, seo_keywords: [], reading_time_minutes: 12 },
];

export default function BlogView() {
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(SAMPLE_POSTS.flatMap((p) => p.tags)));
  const filtered = activeTag ? SAMPLE_POSTS.filter((p) => p.tags.includes(activeTag)) : SAMPLE_POSTS;

  const timeAgo = (dateStr: string) => {
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
  };

  if (selected) return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={() => setSelected(null)} className="text-sm text-slate-500 hover:text-slate-300 transition">Back to Blog</button>
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.tags.map((t) => <span key={t} className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-400">{t}</span>)}
        </div>
        <h1 className="text-3xl font-bold text-white leading-tight">{selected.title}</h1>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{selected.author_name}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(selected.created_at)}</span>
          <span>{selected.views.toLocaleString()} views</span>
          <span>{selected.reading_time_minutes} min read</span>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-slate-300 text-base leading-relaxed">{selected.excerpt}</p>
        <p className="mt-4 text-slate-500 text-sm">Full content loaded from Firestore in production.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className="h-6 w-6 text-purple-400" /> Blog</h1>
        <p className="text-sm text-slate-400 mt-0.5">Career tips, interview guides, and student stories</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTag(null)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${!activeTag ? 'bg-slate-700 text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>All</button>
        {allTags.map((t) => (
          <button key={t} onClick={() => setActiveTag(t === activeTag ? null : t)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${activeTag === t ? 'bg-indigo-600 text-white' : 'border border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
            <Tag className="h-3 w-3" />{t}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.filter((p) => p.is_published).map((post) => (
          <button key={post.id} onClick={() => setSelected(post)}
            className="text-left rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition group flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{t}</span>)}
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition leading-snug">{post.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2">{post.excerpt}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-600 mt-auto pt-1">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author_name}</span>
              <div className="flex items-center gap-3">
                <span>{timeAgo(post.created_at)}</span>
                <span>{post.views.toLocaleString()} views</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
