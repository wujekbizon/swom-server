import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

// Extend FastifyInstance type to include our custom authenticate method
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

// Define the JWT payload structure
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string, email: string, role: string } // JWT data structure
    user: { id: string, email: string, role: string }    // Request.user type
  }
}

/**
 * Authentication Plugin
 * Handles JWT setup and provides authentication middleware
 * 
 * This plugin:
 * 1. Registers the JWT functionality
 * 2. Adds an authenticate decorator to verify JWT tokens
 * 3. Can be used to protect routes requiring authentication
 */
const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Register JWT with our secret key
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
  })

  // Add authenticate decorator to verify JWT tokens
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()  // Verifies the JWT token in the Authorization header
    } catch (err) {
      reply.send(err)
    }
  })
}

// Use fastify-plugin to ensure the plugin is scoped correctly
export default fp(authPlugin) 