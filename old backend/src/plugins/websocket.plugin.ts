/**
 * WebSocket Plugin
 * Integrates Socket.io with Fastify for real-time communication
 */

import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { setupWebSocket } from '../services/websocket'

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
  // Register fastify-socket.io
  await fastify.register(require('fastify-socket.io'), {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://admin.garbaking.com', 'https://kds.garbaking.com', 'https://customer.garbaking.com']
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
          ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  })

  // Setup WebSocket handlers using existing service
  setupWebSocket(fastify.io)

  fastify.log.info('✅ WebSocket server initialized')
}

export default fp(websocketPlugin, {
  name: 'websocket',
  dependencies: ['database', 'auth']
})
