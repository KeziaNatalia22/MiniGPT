import axios from 'axios';

const rawKey = process.env.GEMINI_API_KEY || '';
const API_KEY = rawKey.replace(/^"|"$/g, '').trim() || undefined;

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1';

if (!API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set.');
}

export async function generateText(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  // Allow customizing the system instructions via env var. If not set,
  // we inject a default instruction that encourages the model to act as
  // a strong coding assistant with clear, step-by-step reasoning.
  const defaultSystemInstruction = `You are an expert programming assistant. Prioritize correct, secure, and well-tested code. When responding to coding or logic questions, do the following:\n\n1) Explain your high-level approach briefly.\n2) Show the final code with minimal fluff.\n3) Include short reasoning steps about important design choices and edge cases.\n4) When applicable, provide simple tests or usage examples.\n5) Prefer clear variable names and idiomatic patterns.\n6) If asked to debug, list likely causes and a step-by-step fix.\n\nAlways be concise but thorough and prefer correctness over verbosity.`

  const systemInstruction = (process.env.GEMINI_SYSTEM_PROMPT || defaultSystemInstruction).trim();

  const modelPath = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
  const url = `${BASE}/${modelPath}:generateContent?key=${API_KEY}`;

  try {
    const resp = await axios.post(
      url,
      {
        // Keep role as "user" for compatibility with v1; prepend the
        // system instruction to the user prompt so the model behaves as
        // a coding assistant with strong logical reasoning.
        contents: [{
          role: "user",
          parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = resp.data as any;

    const extractText = (obj: any): string | undefined => {
      if (!obj) return undefined;

      if (typeof obj === 'string' && obj.trim()) return obj;

      // candidates array (v1)
      if (Array.isArray(obj.candidates)) {
        for (const c of obj.candidates) {
          const content = c?.content;

          // parts (v1)
          if (content?.parts) {
            const joined = content.parts
              .map((p: any) => p?.text ?? p?.content ?? '')
              .join('\n')
              .trim();
            if (joined) return joined;
          }

          // direct text (fallback)
          if (typeof content?.text === 'string' && content.text.trim()) {
            return content.text.trim();
          }
        }
      }

      // direct content root (sometimes v1beta)
      if (obj?.content?.parts) {
        const joined = obj.content.parts
          .map((p: any) => p?.text ?? p?.content ?? '')
          .join('\n')
          .trim();
        if (joined) return joined;
      }

      // fallbacks
      if (typeof obj?.text === 'string' && obj.text.trim()) return obj.text.trim();
      if (typeof obj?.output?.text === 'string') return obj.output.text.trim();

      return undefined;
    };

    const extracted =
      extractText(data) ||
      extractText(data?.candidates?.[0]) ||
      extractText(data?.content);

    if (extracted) return extracted;

    // fallback: show raw JSON so frontend can debug
    console.warn('generateText: unable to extract text, returning raw JSON');
    return JSON.stringify(data);

  } catch (err: any) {
    console.error('generateText error:', err?.response?.data || err?.message || err);
    throw new Error(err?.response?.data?.error?.message || err?.message || 'Unknown Gemini API error');
  }
}

export async function generateTextStream(): Promise<never> {
  throw new Error('Streaming not implemented');
}
