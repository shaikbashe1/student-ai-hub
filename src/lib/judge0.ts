export const LANGUAGE_IDS: Record<string, number> = {
  python: 71, javascript: 63, java: 62, cpp: 54, c: 50,
};

export const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python 3', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C',
};

const JUDGE0_URL = (import.meta.env.VITE_JUDGE0_API_URL as string) || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = import.meta.env.VITE_JUDGE0_API_KEY as string | undefined;

export interface RunResult {
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compilation_error' | 'error';
  statusLabel: string;
  output: string;
  runtime_ms?: number;
  memory_kb?: number;
}

interface SubmissionResult { token: string }
interface ExecutionResult {
  stdout: string | null; stderr: string | null;
  compile_output: string | null; message: string | null;
  status: { id: number; description: string };
  time: string | null; memory: number | null;
}

const STATUS_MAP: Record<number, string> = {
  3: 'Accepted', 4: 'Wrong Answer', 5: 'Time Limit Exceeded',
  6: 'Compilation Error', 7: 'Runtime Error', 12: 'Runtime Error',
};

async function createSubmission(payload: {
  source_code: string; language_id: number; stdin?: string; expected_output?: string;
}): Promise<string> {
  if (!JUDGE0_KEY) throw new Error('Judge0 API key not configured');
  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Judge0 error: ${res.status}`);
  const data = await res.json() as SubmissionResult;
  return data.token;
}

async function pollResult(token: string): Promise<ExecutionResult> {
  if (!JUDGE0_KEY) throw new Error('Judge0 API key not configured');
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`, {
      headers: { 'X-RapidAPI-Key': JUDGE0_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' },
    });
    const data = await res.json() as ExecutionResult;
    if (data.status.id > 2) return data;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Execution timed out');
}

export async function runCode(
  code: string, language: string, stdin = '', expectedOutput?: string,
): Promise<RunResult> {
  const langId = LANGUAGE_IDS[language];
  if (!langId) return { status: 'error', statusLabel: 'Unsupported language', output: '' };
  if (!JUDGE0_KEY) {
    return { status: 'error', statusLabel: 'Judge0 not configured', output: 'Add VITE_JUDGE0_API_KEY to .env.local' };
  }
  try {
    const token = await createSubmission({ source_code: code, language_id: langId, stdin: stdin || undefined, expected_output: expectedOutput });
    const result = await pollResult(token);
    const sid = result.status.id;
    const output = (result.stdout || result.stderr || result.compile_output || result.message || '').trim();
    let status: RunResult['status'] = 'error';
    if (sid === 3) status = 'accepted';
    else if (sid === 4) status = 'wrong_answer';
    else if (sid === 5) status = 'time_limit';
    else if (sid === 6) status = 'compilation_error';
    else if (sid >= 7 && sid <= 12) status = 'runtime_error';
    return { status, statusLabel: STATUS_MAP[sid] || result.status.description, output, runtime_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : undefined, memory_kb: result.memory ?? undefined };
  } catch (err) {
    return { status: 'error', statusLabel: 'Error', output: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function runTestCases(
  code: string, language: string, testCases: { input: string; expected_output: string }[],
): Promise<{ passed: number; total: number; results: RunResult[] }> {
  const results = await Promise.all(testCases.map((tc) => runCode(code, language, tc.input, tc.expected_output)));
  return { passed: results.filter((r) => r.status === 'accepted').length, total: testCases.length, results };
}
