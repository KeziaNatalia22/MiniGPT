import { Router } from 'express';
import { generateText } from '../services/geminiService';
import { Message, ListRoomChat } from '../models'

const router = Router();

router.post('/', async (req, res) => {
  const { text, roomId } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing `text` in request body' });
  }

  try {
    // If a roomId is provided, persist the user message first (best-effort)
    if (roomId) {
      try {
        const room = await ListRoomChat.findByPk(Number(roomId))
        if (room) {
          await Message.create({ roomId: Number(roomId), role: 'user', text })
          await room.save() // touch updatedAt
        }
      } catch (e) {
        console.warn('Failed to persist user message (continuing):', e)
      }
    }

    const reply = await generateText(text);

    // Persist AI reply if roomId provided (best-effort)
    if (roomId) {
      try {
        const room = await ListRoomChat.findByPk(Number(roomId))
        if (room) {
          await Message.create({ roomId: Number(roomId), role: 'ai', text: reply })
          await room.save()
        }
      } catch (e) {
        console.warn('Failed to persist AI message (continuing):', e)
      }
    }

    return res.json({ text: reply });
  } catch (err: any) {
    console.error('AI error:', err?.message || err);
    return res.status(500).json({ error: 'AI request failed', details: err?.message });
  }
});

export default router;
