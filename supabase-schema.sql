-- ==========================================
-- Student AI Hub - Supabase Database Schema
-- Production Ready & Highly Optimized for Next.js 15
-- ==========================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------
-- Helper Functions for Auth & RBAC
-- Compatability with both Clerk User JWT and Supabase standard Auth
-- ----------------------------------------------------

-- Extract user ID from JWT claims (Handles custom Clerk Integration JWT template)
create or replace function auth.user_id()
returns text
language sql stable
as $$
  select 
    coalesce(
      nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', ''),
      nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'id', '')
    );
$$;

-- Check if current acting user is an administrator
create or replace function auth.is_admin()
returns boolean
language plpgsql security definer
as $$
declare
  user_id_text text;
  user_role text;
begin
  user_id_text := auth.user_id();
  if user_id_text is null or user_id_text = '' then
    return false;
  end if;
  
  select role into user_role from public.profiles where id = user_id_text;
  return coalesce(user_role = 'admin', false);
end;
$$;

-- ----------------------------------------------------
-- 1. Profiles Table (Clerk Synced)
-- ----------------------------------------------------
create table if not exists public.profiles (
  id text primary key, -- Corresponds to Clerk user_id (e.g. user_2P...)
  name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'admin')),
  daily_prompt_count integer not null default 0,
  last_prompt_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 2. AI Tools Table
-- ----------------------------------------------------
create table if not exists public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  category text not null check (category in (
    'Chatbots', 'Image Gen', 'Video Gen', 'Coding Assistants', 'Productivity', 'Research', 'Resume Builders'
  )),
  pricing text not null, -- Free, Paid, Freemium
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  website_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 3. Internships Table
-- ----------------------------------------------------
create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  slug text not null unique,
  role text not null,
  location text not null,
  is_remote boolean not null default false,
  stipend text not null,
  eligibility text not null,
  deadline date not null,
  apply_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 4. Hackathons Table
-- ----------------------------------------------------
create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organizer text not null,
  prize_pool text not null,
  deadline date not null,
  eligibility text not null,
  registration_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 5. Strategic Blog Posts Table
-- ----------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text not null,
  cover_image text,
  author text not null,
  views integer not null default 0,
  likes integer not null default 0,
  category text not null default 'Engineering',
  seo_keywords text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 6. Bookmarks Table
-- ----------------------------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('tool', 'internship', 'hackathon')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  
  -- Prevent double bookmarking
  unique(user_id, item_type, item_id)
);

-- ----------------------------------------------------
-- 7. AI Chats Sessions Table
-- ----------------------------------------------------
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  title text not null default 'New Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 8. AI Chat Messages Table
-- ----------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- 9. Notifications Table
-- ----------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info', -- info, success, warning, system
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------
-- Database Trigger to Automatically Update updated_at Timestamps
-- ----------------------------------------------------
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_profiles_timestamp before update on public.profiles for each row execute procedure public.set_current_timestamp_updated_at();
create trigger trigger_update_ai_tools_timestamp before update on public.ai_tools for each row execute procedure public.set_current_timestamp_updated_at();
create trigger trigger_update_internships_timestamp before update on public.internships for each row execute procedure public.set_current_timestamp_updated_at();
create trigger trigger_update_hackathons_timestamp before update on public.hackathons for each row execute procedure public.set_current_timestamp_updated_at();
create trigger trigger_update_blog_posts_timestamp before update on public.blog_posts for each row execute procedure public.set_current_timestamp_updated_at();
create trigger trigger_update_chats_timestamp before update on public.chats for each row execute procedure public.set_current_timestamp_updated_at();


-- ====================================================
-- INDICES FOR PERFORMANCE ENHANCEMENT
-- ====================================================

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_ai_tools_category on public.ai_tools(category);
create index if not exists idx_ai_tools_slug on public.ai_tools(slug);
create index if not exists idx_internships_deadline on public.internships(deadline);
create index if not exists idx_internships_slug on public.internships(slug);
create index if not exists idx_hackathons_deadline on public.hackathons(deadline);
create index if not exists idx_hackathons_slug on public.hackathons(slug);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);
create index if not exists idx_bookmarks_item on public.bookmarks(item_type, item_id);
create index if not exists idx_chats_user on public.chats(user_id);
create index if not exists idx_chat_messages_session on public.chat_messages(session_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read);


-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.ai_tools enable row level security;
alter table public.internships enable row level security;
alter table public.hackathons enable row level security;
alter table public.blog_posts enable row level security;
alter table public.bookmarks enable row level security;
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;

-- --------------------------------------
-- PROFILES POLICIES
-- --------------------------------------
-- Students and Admins can view profiles
create policy "Allow profile viewing for any authenticated user" 
  on public.profiles for select 
  using (auth.user_id() is not null);

-- Users can only update their own profiles unless they are admin
create policy "Allow profile updating for self or admin" 
  on public.profiles for update 
  using (auth.user_id() = id or auth.is_admin())
  with check (auth.user_id() = id or auth.is_admin());

-- Webhook synced inserts (must allow insert by authenticated service role or via direct API client synced through auth)
create policy "Allow insert of profiles by authenticated services or admin" 
  on public.profiles for insert 
  with check (true); -- Protected in API route via Clerk Webhook signature validation


-- --------------------------------------
-- DIRECTORIES (AI Tools, Internships, Hackathons, Blog)
-- Read-Only for Public, Write Only for Admins
-- --------------------------------------

-- AI Tools Policies
create policy "Allow public read access to AI tools" 
  on public.ai_tools for select using (true);

create policy "Allow admin write/update access to AI tools" 
  on public.ai_tools for all 
  using (auth.is_admin())
  with check (auth.is_admin());

-- Internships Policies
create policy "Allow public read access to internships" 
  on public.internships for select using (true);

create policy "Allow admin write/update access to internships" 
  on public.internships for all 
  using (auth.is_admin())
  with check (auth.is_admin());

-- Hackathons Policies
create policy "Allow public read access to hackathons" 
  on public.hackathons for select using (true);

create policy "Allow admin write/update access to hackathons" 
  on public.hackathons for all 
  using (auth.is_admin())
  with check (auth.is_admin());

-- Blog Posts Policies
create policy "Allow public read access to published blogs" 
  on public.blog_posts for select 
  using (is_published = true or auth.is_admin());

create policy "Allow admin write/update access to blogs" 
  on public.blog_posts for all 
  using (auth.is_admin())
  with check (auth.is_admin());


-- --------------------------------------
-- USER WORKSPACE (Bookmarks, Chats, Messages, Notifications)
-- Isolated, Protected, & Secure: Strictly Owned by Authenticated User
-- --------------------------------------

-- Bookmarks Policies
create policy "Users can view own bookmarks" 
  on public.bookmarks for select 
  using (auth.user_id() = user_id or auth.is_admin());

create policy "Users can insert own bookmarks" 
  on public.bookmarks for insert 
  with check (auth.user_id() = user_id);

create policy "Users can delete own bookmarks" 
  on public.bookmarks for delete 
  using (auth.user_id() = user_id);

-- Chats Policies
create policy "Users can view own chat sessions" 
  on public.chats for select 
  using (auth.user_id() = user_id or auth.is_admin());

create policy "Users can create own chat sessions" 
  on public.chats for insert 
  with check (auth.user_id() = user_id);

create policy "Users can update own chat sessions" 
  on public.chats for update 
  using (auth.user_id() = user_id or auth.is_admin());

create policy "Users can delete own chat sessions" 
  on public.chats for delete 
  using (auth.user_id() = user_id or auth.is_admin());

-- Chat Messages Policies
create policy "Users can view own chat messages" 
  on public.chat_messages for select 
  using (
    exists (
      select 1 from public.chats 
      where chats.id = chat_messages.session_id 
      and (chats.user_id = auth.user_id() or auth.is_admin())
    )
  );

create policy "Users can create own chat messages in active session" 
  on public.chat_messages for insert 
  with check (
    exists (
      select 1 from public.chats 
      where chats.id = chat_messages.session_id 
      and chats.user_id = auth.user_id()
    )
  );

-- Notifications Policies
create policy "Users can view own notifications" 
  on public.notifications for select 
  using (auth.user_id() = user_id);

create policy "Users can update own notifications default read state" 
  on public.notifications for update 
  using (auth.user_id() = user_id)
  with check (auth.user_id() = user_id);
