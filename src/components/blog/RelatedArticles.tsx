import React from "react";
import { BlogPost } from "../../types";

interface RelatedArticlesProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
}

export default function RelatedArticles({ currentPost, allPosts, onSelectPost }: RelatedArticlesProps) {
  // Filter out current post and find those sharing same category or keywords
  const related = allPosts
    .filter(p => p.id !== currentPost.id && p.is_published)
    .filter(p => p.category === currentPost.category || p.seo_keywords.some(k => currentPost.seo_keywords.includes(k)))
    .slice(0, 3);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-900 pt-6 space-y-4" id="related-articles-section">
      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">
        Suggested Reading & Articles
      </h3>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map(post => (
          <div 
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group cursor-pointer rounded-xl border border-slate-900 bg-slate-950 p-4 transition hover:border-indigo-500/20 hover:bg-slate-900/10"
            id={`related-card-${post.id}`}
          >
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{post.category}</span>
            <h4 className="font-display font-bold text-xs text-slate-200 group-hover:text-indigo-300 transition duration-150 mt-1 line-clamp-1">
              {post.title}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-1.5 truncate">{post.excerpt}</p>
            <span className="text-[10px] text-indigo-400 group-hover:underline font-semibold block mt-3">Read post &rarr;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
