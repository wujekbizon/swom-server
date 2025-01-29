import Fastify from 'fastify'
import FastifyCors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { DutySchema } from './types'
import { readJsonFile, writeJsonFile } from './helpers/fileArchive'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth'

// Replace __dirname usage with this
const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

// Create fastify instance with TypeBox
export const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
}).withTypeProvider<TypeBoxTypeProvider>()

// Register cors
await server.register(FastifyCors)

// Register auth plugin
await server.register(authPlugin)

// Register auth routes
await server.register(authRoutes, { prefix: '/api/auth' })

const DUTIES_FILE = path.join(__dirname, '../src/data/mock-duties.json')

// Routes
server.get('/api/duties', async (request, reply) => {
    try {
      const data = await readJsonFile(DUTIES_FILE)
      return {
        success: true,
        caregivers: data.caregivers,
        total: data.caregivers.length
      }
    } catch (error) {
      return reply.code(500).send({ 
        success: false, 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
  
server.get('/api/duties/:caregiverId', {
  schema: {
    params: Type.Object({
      caregiverId: Type.String()
    })
  }
}, async (request, reply) => {
  try {
    const data = await readJsonFile(DUTIES_FILE)
    const caregiver = data.caregivers.find(
      (c: any) => c.id === request.params.caregiverId
    )
    
    if (!caregiver) {
      return reply.code(404).send({ error: 'Caregiver not found' })
    }
    
    return caregiver
  } catch (error) {
    return reply.code(500).send({ error: 'Server error' })
  }
})

server.post('/api/duties/:caregiverId', {
  schema: {
    params: Type.Object({
      caregiverId: Type.String()
    }),
    body: Type.Object({
      duty: DutySchema
    })
  }
}, async (request, reply) => {
  try {
    const data = await readJsonFile(DUTIES_FILE)
    const caregiverIndex = data.caregivers.findIndex(
      (c: any) => c.id === request.params.caregiverId
    )
    
    if (caregiverIndex === -1) {
      return reply.code(404).send({ error: 'Caregiver not found' })
    }

    const { duty } = request.body
    const dutyIndex = data.caregivers[caregiverIndex].duties.findIndex(
      (d: any) => d.date === duty.date
    )

    if (dutyIndex !== -1) {
      data.caregivers[caregiverIndex].duties[dutyIndex] = duty
    } else {
      data.caregivers[caregiverIndex].duties.push(duty)
    }

    await writeJsonFile(DUTIES_FILE, data)
    return data.caregivers[caregiverIndex]
  } catch (error) {
    return reply.code(500).send({ error: 'Server error' })
  }
})

server.delete('/api/duties/:caregiverId/:date', {
  schema: {
    params: Type.Object({
      caregiverId: Type.String(),
      date: Type.String()
    })
  }
}, async (request, reply) => {
  try {
    const data = await readJsonFile(DUTIES_FILE)
    const caregiverIndex = data.caregivers.findIndex(
      (c: any) => c.id === request.params.caregiverId
    )
    
    if (caregiverIndex === -1) {
      return reply.code(404).send({ error: 'Caregiver not found' })
    }

    const dutyIndex = data.caregivers[caregiverIndex].duties.findIndex(
      (d: any) => d.date === request.params.date
    )

    if (dutyIndex !== -1) {
      data.caregivers[caregiverIndex].duties.splice(dutyIndex, 1)
      await writeJsonFile(DUTIES_FILE, data)
    }

    return data.caregivers[caregiverIndex]
  } catch (error) {
    return reply.code(500).send({ error: 'Server error' })
  }
})

// Start server
const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start() 