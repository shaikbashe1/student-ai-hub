export interface Profile {
  id: string;          // Supabase auth user UUID
  name: string;
  email: string;
  avatar_url?: string; // Google profile picture
  role: 'student' | 'mentor' | 'recruiter' | 'admin';
  plan: 'free' | 'pro' | 'premium';
  daily_prompt_count: number;
  last_prompt_date: string; // YYYY-MM-DD
  created_at: string;
  saved_items?: string[];
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'Chatbots' | 'Image Gen' | 'Video Gen' | 'Coding Assistants' | 'Productivity' | 'Research' | 'Resume Builders';
  pricing: string;
  pros: string[];
  cons: string[];
  website_url: string;
  created_at: string;
}

export interface Internship {
  id: string;
  company: string;
  slug: string;
  role: string;
  location: string;
  is_remote: boolean;
  stipend: string;
  eligibility: string;
  deadline: string;
  apply_url: string;
  created_at: string;
}

export interface Hackathon {
  id: string;
  name: string;
  slug: string;
  organizer: string;
  prize_pool: string;
  deadline: string;
  eligibility: string;
  registration_url: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  item_type: 'tool' | 'internship' | 'hackathon';
  item_id: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  author: string;
  created_at: string;
  views: number;
  likes: number;
  category: string;
  seo_keywords: string[];
  is_published: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
  subscribed_to_digest: boolean;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
}
