import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcrypt'
import { LoginSchema, RegisterSchema, User } from '../types/auth'
import { readJsonFile, writeJsonFile } from '../helpers/fileArchive'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const USERS_FILE = path.join(__dirname, '../../src/data/mock-users.json')

const authRoutes: FastifyPluginAsync = async (fastify) => {
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

      const token = fastify.jwt.sign({ 
        id: user.id,
        email: user.email,
        role: user.role 
      })

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

  fastify.post('/register', {
    schema: {
      body: RegisterSchema
    }
  }, async (request, reply) => {
    const { email, password, name, role } = request.body as User
    
    try {
      const data = await readJsonFile(USERS_FILE)
      
      if (data.users.some((u: User) => u.email === email)) {
        return reply.code(400).send({ error: 'Email already exists' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        role,
        createdAt: new Date().toISOString()
      }

      data.users.push(newUser)
      await writeJsonFile(USERS_FILE, data)

      const token = fastify.jwt.sign({ 
        id: newUser.id,
        email: newUser.email,
        role: newUser.role 
      })

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