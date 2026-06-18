export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  is_remote: boolean;
  description: string;
  url: string;
  type?: string;
  salary?: string;
  tags: string[];
  source: 'adzuna' | 'remotive' | 'arbeitnow';
  posted_at: string;
}

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID as string | undefined;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY as string | undefined;

export async function fetchAdzunaJobs(searchQuery = 'software intern'): Promise<JobListing[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];
  try {
    const url = new URL('https://api.adzuna.com/v1/api/jobs/in/search/1');
    url.searchParams.set('app_id', ADZUNA_APP_ID);
    url.searchParams.set('app_key', ADZUNA_APP_KEY);
    url.searchParams.set('what', searchQuery);
    url.searchParams.set('results_per_page', '20');
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json() as { results?: Record<string, unknown>[] };
    return (data.results ?? []).map((job) => ({
      id: `adzuna-${String(job['id'] ?? Math.random())}`,
      title: String(job['title'] ?? ''),
      company: String((job['company'] as Record<string, unknown>)?.['display_name'] ?? ''),
      location: String((job['location'] as Record<string, unknown>)?.['display_name'] ?? ''),
      is_remote: String(job['title'] ?? '').toLowerCase().includes('remote'),
      description: String(job['description'] ?? '').slice(0, 300),
      url: String(job['redirect_url'] ?? ''),
      tags: [],
      source: 'adzuna' as const,
      posted_at: String(job['created'] ?? new Date().toISOString()),
    }));
  } catch { return []; }
}

export async function fetchRemotiveJobs(): Promise<JobListing[]> {
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=20');
    if (!res.ok) return [];
    const data = await res.json() as { jobs?: Record<string, unknown>[] };
    return (data.jobs ?? []).map((job) => ({
      id: `remotive-${String(job['id'] ?? Math.random())}`,
      title: String(job['title'] ?? ''),
      company: String(job['company_name'] ?? ''),
      location: 'Remote',
      is_remote: true,
      description: String(job['description'] ?? '').replace(/<[^>]*>/g, '').slice(0, 300),
      url: String(job['url'] ?? ''),
      salary: String(job['salary'] ?? ''),
      tags: Array.isArray(job['tags']) ? (job['tags'] as unknown[]).map(String) : [],
      source: 'remotive' as const,
      posted_at: String(job['publication_date'] ?? new Date().toISOString()),
    }));
  } catch { return []; }
}

export async function fetchArbeitnowJobs(): Promise<JobListing[]> {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api?page=1');
    if (!res.ok) return [];
    const data = await res.json() as { data?: Record<string, unknown>[] };
    return (data.data ?? []).slice(0, 20).map((job) => ({
      id: `arbeitnow-${String(job['slug'] ?? Math.random())}`,
      title: String(job['title'] ?? ''),
      company: String(job['company_name'] ?? ''),
      location: String(job['location'] ?? ''),
      is_remote: Boolean(job['remote']),
      description: String(job['description'] ?? '').replace(/<[^>]*>/g, '').slice(0, 300),
      url: String(job['url'] ?? ''),
      tags: Array.isArray(job['tags']) ? (job['tags'] as unknown[]).map(String) : [],
      source: 'arbeitnow' as const,
      posted_at: String(job['created_at'] ?? new Date().toISOString()),
    }));
  } catch { return []; }
}

export async function fetchAllJobs(query?: string): Promise<JobListing[]> {
  const [a, b, c] = await Promise.allSettled([
    fetchAdzunaJobs(query),
    fetchRemotiveJobs(),
    fetchArbeitnowJobs(),
  ]);
  const all: JobListing[] = [];
  if (a.status === 'fulfilled') all.push(...a.value);
  if (b.status === 'fulfilled') all.push(...b.value);
  if (c.status === 'fulfilled') all.push(...c.value);
  return all.sort((x, y) => new Date(y.posted_at).getTime() - new Date(x.posted_at).getTime());
}
