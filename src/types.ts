// Student AI Hub — Production Type Definitions

export type UserRole = 'student' | 'mentor' | 'recruiter' | 'admin';
export type SubscriptionPlan = 'free' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  plan: SubscriptionPlan;
  email_verified: boolean;
  daily_ai_requests: number;
  daily_ai_limit: number;
  last_quota_reset: string;
  skills: string[];
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  college?: string;
  graduation_year?: number;
  saved_items: string[];
  created_at: string;
  updated_at: string;
  daily_prompt_count: number;
  last_prompt_date: string;
}

export type AIToolCategory =
  | 'Chatbots' | 'Image Gen' | 'Video Gen' | 'Coding Assistants'
  | 'Productivity' | 'Research' | 'Resume Builders' | 'Study Aids';

export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: AIToolCategory;
  pricing: string;
  pros: string[];
  cons: string[];
  website_url: string;
  logo_url?: string;
  is_featured: boolean;
  is_sponsored: boolean;
  views: number;
  saves: number;
  created_at: string;
  updated_at: string;
}

export interface Internship {
  id: string;
  company: string;
  company_logo?: string;
  slug: string;
  role: string;
  location: string;
  is_remote: boolean;
  stipend: string;
  eligibility: string;
  deadline: string;
  apply_url: string;
  source: 'manual' | 'adzuna' | 'remotive' | 'arbeitnow';
  tags: string[];
  is_sponsored: boolean;
  views: number;
  saves: number;
  created_at: string;
  updated_at: string;
}

export interface Hackathon {
  id: string;
  name: string;
  slug: string;
  organizer: string;
  banner_url?: string;
  prize_pool: string;
  deadline: string;
  eligibility: string;
  registration_url: string;
  tags: string[];
  mode: 'online' | 'offline' | 'hybrid';
  is_featured: boolean;
  views: number;
  saves: number;
  created_at: string;
  updated_at: string;
}

export type AIToolType =
  | 'chat' | 'resume_analyzer' | 'interview_simulator'
  | 'roadmap_generator' | 'study_planner' | 'research_assistant' | 'project_generator';

export interface AIConversation {
  id: string;
  user_id: string;
  tool_type: AIToolType;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  created_at: string;
}

export interface ResumeSuggestion {
  type: 'critical' | 'warning' | 'tip';
  section: string;
  message: string;
}

export interface ResumeAnalysis {
  ats_score: number;
  skills_detected: string[];
  skill_gaps: string[];
  suggestions: ResumeSuggestion[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  user_answer?: string;
  ai_feedback?: string;
  score?: number;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  resources: string[];
  estimated_hours: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface LearningRoadmap {
  estimated_weeks?: number;
  final_project?: string;
  phases?: LearningRoadmapPhase[];
  title: string;
  milestones: RoadmapMilestone[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  views: number;
  likes: number;
  category: string;
  tags: string[];
  seo_keywords: string[];
  is_published: boolean;
  reading_time_minutes: number;
  author?: string;
}

export type ProgrammingLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c';

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starter_code: Record<ProgrammingLanguage, string>;
  test_cases: TestCase[];
  constraints: string[];
  examples: ChallengeExample[];
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribed_to_digest: boolean;
  created_at: string;
  unsubscribed_at?: string;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, {
  daily_ai_requests: number;
  label: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}> = {
  free: {
    daily_ai_requests: 5,
    label: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      '5 AI requests/day',
      'Basic chat assistant',
      'Browse internships & hackathons',
      'Community blog access',
      '1 resume analysis/month',
    ],
  },
  pro: {
    daily_ai_requests: 50,
    label: 'Pro',
    price_monthly: 9,
    price_yearly: 79,
    features: [
      '50 AI requests/day',
      'All 7 AI tools unlocked',
      'AI Interview Simulator',
      'Resume Analyzer (10/month)',
      'Coding platform access',
      'Learning roadmaps',
      'Priority support',
    ],
  },
  premium: {
    daily_ai_requests: -1,
    label: 'Premium',
    price_monthly: 19,
    price_yearly: 149,
    features: [
      'Unlimited AI requests',
      'All Pro features',
      'AI Research Assistant',
      'Advanced project generator',
      'Recruiter visibility badge',
      'Premium certificates',
      'Early access to new features',
    ],
  },
};

export interface LearningRoadmapPhase {
  title: string;
  duration: string;
  description: string;
  topics: string[];
  resources: { name: string; type?: string; url?: string }[];
  projects: string[];
}

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  is_remote: boolean;
  description: string;
  url: string;
  salary?: string;
  type?: string;
  tags: string[];
  source: 'adzuna' | 'remotive' | 'arbeitnow';
  posted_at: string;
};

// Simplified Hackathon for portal display (superset of Firestore Hackathon)
export interface HackathonDisplay {
  id: string;
  title: string;
  organizer: string;
  description: string;
  deadline: string;
  start_date?: string;
  end_date?: string;
  prize?: string;
  tags: string[];
  url: string;
  is_online: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}
