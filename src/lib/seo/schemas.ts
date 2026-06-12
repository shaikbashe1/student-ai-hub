import { BlogPost } from "../../types";

/**
 * Built-in builders for JSON-LD structural elements based on Schema.org
 */

export function buildBlogPostJsonLd(post: BlogPost, origin: string = "https://studentaihub.org"): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.cover_image || `${origin}/api/og?title=${encodeURIComponent(post.title)}`,
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Student AI Hub",
      "logo": {
        "@type": "ImageObject",
        "url": `${origin}/logo-pill.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${origin}/blog/${post.slug}`
    },
    "keywords": post.seo_keywords.join(", ")
  };
}

export function buildOrganizationJsonLd(origin: string = "https://studentaihub.org"): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Student AI Hub",
    "url": origin,
    "logo": `${origin}/logo-pill.png`,
    "sameAs": [
      "https://github.com/student-ai-hub",
      "https://twitter.com/student_ai_hub"
    ]
  };
}
