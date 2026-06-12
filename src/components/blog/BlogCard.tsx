import React from "react";
import { BlogPost } from "../../types";
import { Calendar, Eye, Heart, ArrowRight } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
  onClick: (post: BlogPost) => void | Promise<void>;
  key?: any;
}

export default function BlogCard({ post, onClick }: BlogCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <article 
      onClick={() => onClick(post)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-5 transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/45 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
      id={`blog-card-${post.id}`}
    >
      {/* Background neon dynamic lighting glow */}
      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:from-indigo-500/10" />

      <div className="flex flex-col h-full justify-between space-y-4">
        {/* Top bar with category and metadata */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/25 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400">
            {post.category}
          </span>
          <div className="flex items-center space-x-2.5 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </span>
          </div>
        </div>

        {/* Content body headings */}
        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-sm text-slate-100 group-hover:text-indigo-300 transition duration-150 line-clamp-2 md:text-base">
            {post.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        {/* Footer stat metrics */}
        <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">By <strong className="text-slate-300 font-bold">{post.author}</strong></span>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                <Eye className="h-3.5 w-3.5" />
                <span>{post.views}</span>
              </span>
              <span className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                <Heart className="h-3.5 w-3.5 text-rose-500/70" />
                <span>{post.likes}</span>
              </span>
            </div>

            <span className="text-indigo-400 group-hover:translate-x-1 duration-200" title="Read Article Details">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
