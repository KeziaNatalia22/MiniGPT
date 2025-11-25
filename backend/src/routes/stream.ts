import { Router } from 'express'
import { addClient, clientCount } from '../events/broadcaster'

const router = Router()

// SSE endpoint: clients connect here to receive room/message events
router.get('/', (req, res) => {
  try {
    addClient(res)
    // keep connection open
    console.log('SSE client connected. Total:', clientCount())
  } catch (e) {
    console.warn('Failed to add SSE client', e)
    res.status(500).end()
  }
})

export default router
