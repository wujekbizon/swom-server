import Fastify from 'fastify'
import FastifyCors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import authPlugin from './plugins/auth'
import authRoutes from './routes/auth'
import dutiesRoutes from './routes/duties'
import patientRoutes from './routes/patients'
import healthCheckRoutes from './routes/health-checks'
import auditLogsRoutes from './routes/auditLogs'
import 'dotenv/config'

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
}).withTypeProvider<TypeBoxTypeProvider>()

// Register plugins
await server.register(FastifyCors)
await server.register(authPlugin)

// Register routes
await server.register(authRoutes, { prefix: '/api/auth' })
await server.register(dutiesRoutes, { prefix: '/api/duties' })
await server.register(patientRoutes, { prefix: '/api/patients' })
await server.register(healthCheckRoutes, { prefix: '/api/health-checks' })
await server.register(auditLogsRoutes, { prefix: '/api/audit-logs' })

// Start server
const start = async () => {
  try {
    await server.listen({ 
      port: Number(process.env.PORT) || 3000, 
      host: '0.0.0.0' 
    })
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()