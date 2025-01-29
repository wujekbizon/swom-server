import 'dotenv/config'
import bcrypt from 'bcrypt'
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { LoginSchema, RegisterSchema } from '../schemas/auth.schema'
import { readJsonFile, writeJsonFile } from '../helpers/fileArchive'
import { USERS_FILE } from '../helpers/paths'
import type { User } from '../types/auth'

/**
 * Authentication Routes Plugin
 * Handles user authentication and registration endpoints
 */
const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/auth/login
   * Authenticates user and returns JWT token
   * 
   * @body {email: string, password: string}
   * @returns {token: string, user: { id, email, name, role }}
   */
  fastify.post('/login', {
    schema: {
      body: LoginSchema
    }
  }, async (request, reply) => {
    const { email, password } = request.body as User
    
    try {
      const data = await readJsonFile(USERS_FILE)
      const user = data.users.find((u: any) => u.email === email)
      
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return reply.code(401).send({ error: 'Invalid credentials' })
      }

      // Generate JWT token with user information
      const token = fastify.jwt.sign({ 
        id: user.id,
        email: user.email,
        role: user.role 
      })

      // Return token and user data (excluding password)
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })

  /**
   * POST /api/auth/register
   * Registers a new user
   * 
   * @body {email: string, password: string, name: string, role: 'caregiver' | 'admin'}
   * @returns {token: string, user: { id, email, name, role }}
   */
  fastify.post('/register', {
    schema: {
      body: RegisterSchema
    }
  }, async (request, reply) => {
    const { email, password, name, role } = request.body as User
    
    try {
      const data = await readJsonFile(USERS_FILE)
      
      // Check if email already exists
      if (data.users.some((u: User) => u.email === email)) {
        return reply.code(400).send({ error: 'Email already exists' })
      }

      // Create new user with hashed password
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        role,
        createdAt: new Date().toISOString()
      }

      // Save user to database
      data.users.push(newUser)
      await writeJsonFile(USERS_FILE, data)

      // Generate JWT token for new user
      const token = fastify.jwt.sign({ 
        id: newUser.id,
        email: newUser.email,
        role: newUser.role 
      })

      // Return token and user data (excluding password)
      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })

  /**
   * GET /api/auth/me
   * Returns current authenticated user's information
   * Requires valid JWT token in Authorization header
   * 
   * @returns {user: { id, email, name, role }}
   */
  fastify.get('/me', {
    onRequest: [fastify.authenticate]
  }, async (request) => {
    const data = await readJsonFile(USERS_FILE)
    const user = data.users.find((u: User) => u.id === request.user.id)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
}

export default authRoutes 