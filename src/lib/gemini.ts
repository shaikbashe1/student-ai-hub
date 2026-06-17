import { GoogleGenAI } from '@google/genai';
import { ResumeAnalysis, LearningRoadmap } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string || '' });
const MODEL = 'gemini-2.0-flash';

type GeminiRole = 'user' | 'model';
interface GeminiMessage { role: GeminiRole; text: string }

export async function chatWithGemini(
  messages: GeminiMessage[],
  systemPrompt?: string,
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: systemPrompt, temperature: 0.7, maxOutputTokens: 2048 },
  });
  return response.text ?? '';
}

function parseJson<T>(text: string, fallback: T): T {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return fallback;
  try { return JSON.parse(match[0]) as T; } catch { return fallback; }
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const prompt = `Analyze this resume and return ONLY valid JSON:
{"ats_score":<0-100>,"skills_detected":["..."],"skill_gaps":["..."],"suggestions":[{"type":"critical|warning|tip","section":"...","message":"..."}]}

Resume:
${resumeText.slice(0, 4000)}`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.3, maxOutputTokens: 2048 },
  });
  return parseJson<ResumeAnalysis>(result.text ?? '{}', {
    ats_score: 50, skills_detected: [], skill_gaps: [], suggestions: [],
  });
}

export async function generateInterviewQuestion(
  role: string, mode: 'technical' | 'hr' | 'mixed', previousQuestions: string[],
): Promise<string> {
  const system = `You are an expert interviewer for ${role} (${mode} interview). Ask ONE focused question. Do NOT repeat: ${previousQuestions.join('; ')}. Return only the question text.`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: 'Next question please.' }] }],
    config: { systemInstruction: system, temperature: 0.8, maxOutputTokens: 256 },
  });
  return result.text?.trim() ?? 'Tell me about yourself.';
}

export async function evaluateInterviewAnswer(
  question: string, answer: string, role: string,
): Promise<{ score: number; feedback: string }> {
  const prompt = `Evaluate this interview answer for ${role}.
Q: ${question}
A: ${answer}
Return ONLY JSON: {"score":<0-10>,"feedback":"<2-3 sentences>"}`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.4, maxOutputTokens: 512 },
  });
  return parseJson(result.text ?? '{}', { score: 5, feedback: 'Unable to evaluate.' });
}

export async function generateRoadmap(goal: string, currentSkills: string[]): Promise<LearningRoadmap> {
  const prompt = `Create a learning roadmap for: "${goal}". Current skills: ${currentSkills.join(', ') || 'beginner'}.
Return ONLY JSON: {"title":"...","milestones":[{"id":"1","title":"...","description":"...","resources":["..."],"estimated_hours":<n>,"is_completed":false}]}
Include 5-7 milestones ordered from fundamentals to advanced.`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.5, maxOutputTokens: 3000 },
  });
  return parseJson<LearningRoadmap>(result.text ?? '{}', { title: goal, milestones: [] });
}

export async function generateStudyPlan(
  subjects: string[], mode: 'daily' | 'weekly' | 'semester', hoursPerDay: number,
): Promise<string> {
  const prompt = `Create a ${mode} study plan for: ${subjects.join(', ')}. Available: ${hoursPerDay}h/day. Format as structured markdown with time slots and breaks.`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.6, maxOutputTokens: 2048 },
  });
  return result.text ?? '';
}

export async function generateProjectIdea(
  skills: string[], interests: string[], difficulty: 'beginner' | 'intermediate' | 'advanced',
): Promise<{
  title: string; description: string; tech_stack: string[];
  features: string[]; architecture_overview: string; estimated_days: number;
}> {
  const prompt = `Generate a ${difficulty} project for student with skills: ${skills.join(', ')} and interests: ${interests.join(', ')}.
Return ONLY JSON: {"title":"...","description":"...","tech_stack":["..."],"features":["..."],"architecture_overview":"...","estimated_days":<n>}`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.8, maxOutputTokens: 1024 },
  });
  return parseJson(result.text ?? '{}', {
    title: 'Project Idea', description: '', tech_stack: [], features: [],
    architecture_overview: '', estimated_days: 14,
  });
}

export async function researchTopic(topic: string, depth: 'summary' | 'detailed'): Promise<string> {
  const prompt = depth === 'summary'
    ? `Concise academic summary of "${topic}" in 3-4 paragraphs with key concepts and 5 reference suggestions.`
    : `Detailed research overview of "${topic}": background, current state, key concepts, methodologies, notable papers, future directions. Format as markdown.`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.4, maxOutputTokens: 3000 },
  });
  return result.text ?? '';
}

export async function matchJobsWithAI(
  skills: string[], interests: string[],
  jobs: { title: string; description: string; id: string }[],
): Promise<{ id: string; match_score: number; reason: string }[]> {
  const prompt = `Student skills: ${skills.join(', ')}. Interests: ${interests.join(', ')}.
Rate job matches (0-100):
${JSON.stringify(jobs.slice(0, 8))}
Return ONLY JSON array: [{"id":"...","match_score":<0-100>,"reason":"..."}]`;
  const result = await ai.models.generateContent({
    model: MODEL, contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { temperature: 0.3, maxOutputTokens: 1024 },
  });
  return parseJson<{ id: string; match_score: number; reason: string }[]>(result.text ?? '[]', []);
}
