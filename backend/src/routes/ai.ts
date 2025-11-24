import { Router } from 'express';
import { generateText } from '../services/geminiService';

const router = Router();

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing `text` in request body' });
  }

  try {
    const reply = await generateText(text);
    return res.json({ text: reply });
  } catch (err: any) {
    console.error('AI error:', err?.message || err);
    return res.status(500).json({ error: 'AI request failed', details: err?.message });
  }
});

export default router;
