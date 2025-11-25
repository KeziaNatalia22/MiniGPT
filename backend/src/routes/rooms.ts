import { Router } from 'express'
import { ListRoomChat, Message } from '../models'

const router = Router()

// List all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await ListRoomChat.findAll({ order: [['updatedAt', 'DESC']] })
    res.json(rooms)
  } catch (err: any) {
    console.error('GET /rooms error', err)
    res.status(500).json({ error: 'Failed to list rooms' })
  }
})

// Create a new room
router.post('/', async (req, res) => {
  try {
    const title = (req.body?.title as string) || 'New chat'
    const room = await ListRoomChat.create({ title })
    res.status(201).json(room)
  } catch (err: any) {
    console.error('POST /rooms error', err)
    res.status(500).json({ error: 'Failed to create room' })
  }
})

// Rename / update room
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const room = await ListRoomChat.findByPk(id)
    if (!room) return res.status(404).json({ error: 'Room not found' })
    const title = req.body?.title
    if (title) room.title = title
    await room.save()
    res.json(room)
  } catch (err: any) {
    console.error('PATCH /rooms/:id error', err)
    res.status(500).json({ error: 'Failed to update room' })
  }
})

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const room = await ListRoomChat.findByPk(id)
    if (!room) return res.status(404).json({ error: 'Room not found' })
    await room.destroy()
    res.status(204).end()
  } catch (err: any) {
    console.error('DELETE /rooms/:id error', err)
    res.status(500).json({ error: 'Failed to delete room' })
  }
})

// Get messages for a room (with optional pagination)
router.get('/:id/messages', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const limit = Math.min(100, Number(req.query.limit) || 100)
    const offset = Number(req.query.offset) || 0
    const messages = await Message.findAll({
      where: { roomId: id },
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    })
    res.json(messages)
  } catch (err: any) {
    console.error('GET /rooms/:id/messages error', err)
    res.status(500).json({ error: 'Failed to load messages' })
  }
})

// Post a message to a room
router.post('/:id/messages', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const room = await ListRoomChat.findByPk(id)
    if (!room) return res.status(404).json({ error: 'Room not found' })
    const role = (req.body?.role as 'user' | 'ai') || 'user'
    const text = req.body?.text
    if (typeof text !== 'string') return res.status(400).json({ error: 'Missing text' })
    const msg = await Message.create({ roomId: id, role, text, metadata: req.body?.metadata || null })
    // touch room updatedAt
    await room.save()
    res.status(201).json(msg)
  } catch (err: any) {
    console.error('POST /rooms/:id/messages error', err)
    res.status(500).json({ error: 'Failed to create message' })
  }
})

export default router
