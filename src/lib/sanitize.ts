const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /<iframe[\s\S]*?>/gi,
  /vbscript:/gi,
];

export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  let s = input.trim();
  for (const p of DANGEROUS_PATTERNS) s = s.replace(p, '');
  return s;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    const p = new URL(url);
    return ['http:', 'https:'].includes(p.protocol);
  } catch { return false; }
}

export function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 128);
}
