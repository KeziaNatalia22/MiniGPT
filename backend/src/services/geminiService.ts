import axios from 'axios';

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDhN8cvskqhNe8ng2r0SDme5eC9K3VpKZo";
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1';

if (!API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set. Add it to .env to enable API calls.');
}

export async function generateText(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  const modelPath = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
  const url = `${BASE}/${modelPath}:generateContent?key=${API_KEY}`;

  try {
    const resp = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = resp.data as any;
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) return candidate;

    return JSON.stringify(data);
  } catch (err: any) {
    console.error('generateText error:', err?.response?.data || err?.message || err);
    throw new Error(err?.response?.data?.error?.message || err?.message || 'Unknown Gemini API error');
  }
}

export async function generateTextStream(_prompt: string): Promise<never> {
  // Streaming implementation is optional and depends on the API surface (gRPC/websocket).
  // For simplicity this server currently supports non-streaming responses.
  throw new Error('Streaming not implemented in this example');
}
