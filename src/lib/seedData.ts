import { AITool, Internship, Hackathon } from "../types";

const RAW_AI_TOOLS = [
  {
    id: "1",
    name: "ChatGPT",
    slug: "chatgpt",
    description: "A state-of-the-art conversational language model trained by OpenAI, capable of assisting with writing, brainstorming, programming, and general problem solving.",
    category: "Chatbots",
    pricing: "Freemium",
    pros: ["Highly versatile across subjects", "Extensive plugins and custom GPTs", "Rapidly evolving reasoning with GPT-4o"],
    cons: ["Can occasionally hallucinate false facts", "Knowledge cutoff applies to details", "Advanced models have usage rate limits"],
    website_url: "https://chatgpt.com",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Claude",
    slug: "claude",
    description: "Anthropic's flagship AI model known for its exceptional writing style, complex reasoning capabilities, and massive context window, perfect for reading papers and debugging code.",
    category: "Chatbots",
    pricing: "Freemium",
    pros: ["Superior long-form academic writing", "Extremely wide context window", "Advanced code explanation and logic"],
    cons: ["Premium features require costly monthly subscription", "Free tier has very rapid rate limits", "No live web search on free mode"],
    website_url: "https://claude.ai",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Cursor AI",
    slug: "cursor",
    description: "An AI-powered fork of VS Code designed for rapid software development. Integrates Claude and GPT models directly into the file system and project tree.",
    category: "Coding Assistants",
    pricing: "Freemium",
    pros: ["Autocomplete that understands the whole codebase", "Seamless multi-file edits", "Inline terminal debugging"],
    cons: ["Requires adaptation from other editors", "Free tier usage limits are low", "Pro subscripton is $20/month"],
    website_url: "https://cursor.com",
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Midjourney",
    slug: "midjourney",
    description: "An ultra-popular text-to-image generative AI model accessible via Discord and web interfaces, renowned for creating highly aesthetic and detailed artistic illustrations.",
    category: "Image Gen",
    pricing: "Paid",
    pros: ["Unmatched artistic style and visual quality", "Flexible prompt weights and zoom filters", "Vibrant community sharing prompts"],
    cons: ["No persistent free tier", "Interactions can feel clunky in Discord", "Prompt syntax has a steep learning curve"],
    website_url: "https://midjourney.com",
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "v0 by Vercel",
    slug: "v0",
    description: "A generative UI system by Vercel that creates complete, production-ready React component code styled with Tailwind CSS and Shadcn UI from simple text commands.",
    category: "Coding Assistants",
    pricing: "Freemium",
    pros: ["Generates beautiful UI designs instantly", "Exports clean React and Tailwind utility code", "Allows interactive iterations"],
    cons: ["Limited backend/dynamic logic creation", "Requires familiarity with React to integrate", "Can generate excessive visual boilerplate"],
    website_url: "https://v0.dev",
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "NotebookLM",
    slug: "notebooklm",
    description: "A personalized AI notebook research assistant by Google that relies on your specified source documents to generate summaries, study guides, and engaging audio podcasts.",
    category: "Research",
    pricing: "Free",
    pros: ["100% free with massive upload limits", "Provides precise source citations", "Audio Overview podcast is extremely helpful"],
    cons: ["Only answers using uploaded information", "Limited writing composition templates", "No real-time dynamic web scraping"],
    website_url: "https://notebooklm.google",
    created_at: new Date().toISOString()
  },
  {
    id: "7",
    name: "DeepSeek R1",
    slug: "deepseek-r1",
    description: "A prominent open-source model specializing in intensive, step-by-step mathematical reasoning, logical deduction, and deep coding assistance.",
    category: "Coding Assistants",
    pricing: "Free",
    pros: ["Transparent chain-of-thought visible in the UI", "Outstanding math and algorithmic design", "Fully open weights for local hosting"],
    cons: ["High server congestion during peak hours", "UI feels extremely basic", "Occasional multi-lingual language mixing"],
    website_url: "https://chat.deepseek.com",
    created_at: new Date().toISOString()
  },
  {
    id: "8",
    name: "Runway Gen-3 Alpha",
    slug: "runway-gen3",
    description: "Next-generation video creation tool that generates photorealistic, highly detailed, cinematic shots using simple natural language control.",
    category: "Video Gen",
    pricing: "Paid",
    pros: ["Photorealistic movement and physical accuracy", "Camera-motion precise adjustments", "Saves massive visual production costs"],
    cons: ["Very expensive subscription blocks", "Computationally slow generations", "Minor anatomical aberrations occasionally"],
    website_url: "https://runwayml.com",
    created_at: new Date().toISOString()
  },
  {
    id: "9",
    name: "Kickresume",
    slug: "kickresume",
    description: "An AI-powered professional resume builder loaded with custom templates, grammar checkers, and cover letter synthesizers to accelerate job hunts.",
    category: "Resume Builders",
    pricing: "Freemium",
    pros: ["Step-by-step career path prompts", "Dozens of ATS-compliant layouts", "Pre-written bullet items for easy editing"],
    cons: ["Most high-end designs require subscription", "Slightly rigid customization boxes", "Cover letter generator has repetitive phrasing"],
    website_url: "https://kickresume.com",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_AI_TOOLS: AITool[] = RAW_AI_TOOLS.map(t => ({
  ...t,
  category: t.category as any,
  is_featured: false,
  is_sponsored: false,
  views: 0,
  saves: 0,
  updated_at: t.created_at
}));

const RAW_INTERNSHIPS = [
  {
    id: "int_1",
    company: "Google",
    slug: "google-swe-intern",
    role: "Software Engineering Intern",
    location: "Mountain View, CA",
    is_remote: false,
    stipend: "$9,500 / month",
    eligibility: "Currently pursuing a Bachelor's, Master's, or PhD in Computer Science or related STEM field. Expected graduation in late 2026 or 2027.",
    deadline: "2026-10-15",
    apply_url: "https://careers.google.com/jobs/results/",
    created_at: new Date().toISOString()
  },
  {
    id: "int_2",
    company: "Stripe",
    slug: "stripe-frontend-intern",
    role: "Frontend Engineering Intern",
    location: "New York, NY",
    is_remote: false,
    stipend: "$8,800 / month",
    eligibility: "Strong knowledge of React, modern CSS layout, and semantic browser APIs. Enrolled in an undergraduate technical curriculum.",
    deadline: "2026-11-01",
    apply_url: "https://stripe.com/jobs",
    created_at: new Date().toISOString()
  },
  {
    id: "int_3",
    company: "OpenAI",
    slug: "openai-safety-intern",
    role: "AI Safety & Alignment Intern",
    location: "San Francisco, CA",
    is_remote: false,
    stipend: "$10,200 / month",
    eligibility: "Prior research projects or publications in ML safety, reinforcement learning, LLM evaluation, or machine ethics. Coding in Python.",
    deadline: "2026-09-30",
    apply_url: "https://openai.com/careers",
    created_at: new Date().toISOString()
  },
  {
    id: "int_4",
    company: "Vercel",
    slug: "vercel-devrel-intern",
    role: "Developer Relations Intern",
    location: "Remote (US/Canada)",
    is_remote: true,
    stipend: "$6,500 / month",
    eligibility: "Passionate about building developer content. Familiar with Next.js, React Server Components, Tailwind, and technical writing.",
    deadline: "2026-12-15",
    apply_url: "https://vercel.com/careers",
    created_at: new Date().toISOString()
  },
  {
    id: "int_5",
    company: "NVIDIA",
    slug: "nvidia-deep-learning-intern",
    role: "Deep Learning Research Intern",
    location: "Santa Clara, CA",
    is_remote: false,
    stipend: "$9,200 / month",
    eligibility: "Pursuing PhD or research-oriented Master's with expertise in PyTorch, CUDA, kernel optimization, and neural rendering.",
    deadline: "2026-09-10",
    apply_url: "https://nvidia.com/careers",
    created_at: new Date().toISOString()
  },
  {
    id: "int_6",
    company: "Duolingo",
    slug: "duolingo-product-design-intern",
    role: "Product Design Intern",
    location: "Pittsburgh, PA",
    is_remote: false,
    stipend: "$7,200 / month",
    eligibility: "Portfolio demonstrating high-fidelity Figma designs, user empathy, and delightful animations. Enrolled in design curriculum.",
    deadline: "2026-11-20",
    apply_url: "https://careers.duolingo.com",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_INTERNSHIPS: Internship[] = RAW_INTERNSHIPS.map(i => ({
  source: "manual",
  tags: [],
  is_sponsored: false,
  views: 0,
  saves: 0,
  updated_at: i.created_at,
  ...i
}));

const RAW_HACKATHONS = [
  {
    id: "hack_1",
    name: "ETHGlobal San Francisco",
    slug: "ethglobal-sf-2026",
    organizer: "ETHGlobal",
    prize_pool: "$150,000",
    deadline: "2026-10-01",
    eligibility: "Open to developers of all backgrounds, web3 enthusiasts, and students. Travel stipends available for select students.",
    registration_url: "https://ethglobal.com/events/sf2026",
    created_at: new Date().toISOString()
  },
  {
    id: "hack_2",
    name: "HackMIT 2026",
    slug: "hackmit-2026",
    organizer: "Massachusetts Institute of Technology",
    prize_pool: "$50,000",
    deadline: "2026-09-01",
    eligibility: "All undergraduate students globally. Hard age limit is 18+. Free food, hardware, and travel reimbursement are sponsored.",
    registration_url: "https://hackmit.org",
    created_at: new Date().toISOString()
  },
  {
    id: "hack_3",
    name: "CalgaryHacks 2026",
    slug: "calgaryhacks-2026",
    organizer: "University of Calgary Tech Club",
    prize_pool: "$15,000",
    deadline: "2026-08-15",
    eligibility: "Students studying in Western Canada. High school, undergraduate, and graduate categories are separated.",
    registration_url: "https://calgaryhacks.ca",
    created_at: new Date().toISOString()
  },
  {
    id: "hack_4",
    name: "NASA Space Apps Challenge",
    slug: "nasa-space-apps-2026",
    organizer: "NASA",
    prize_pool: "Global Recognition & VIP Launch Visit",
    deadline: "2026-10-10",
    eligibility: "Everyone. Universal hackathon for students, coders, dreamers, scientists, storytellers, and visual artists.",
    registration_url: "https://spaceappschallenge.org",
    created_at: new Date().toISOString()
  },
  {
    id: "hack_5",
    name: "Google Developer Student Solution Challenge",
    slug: "google-solution-challenge-2026",
    organizer: "Google Developer Groups",
    prize_pool: "$120,000 + Tech Mentorship",
    deadline: "2026-11-30",
    eligibility: "Must be active member of a Google Developer Student Club (GDSC) chapter at an accredited university.",
    registration_url: "https://developers.google.com/community/gdsc/challenge",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_HACKATHONS: Hackathon[] = RAW_HACKATHONS.map(h => ({
  tags: [],
  mode: "online",
  is_featured: false,
  views: 0,
  saves: 0,
  updated_at: h.created_at,
  ...h
}));
