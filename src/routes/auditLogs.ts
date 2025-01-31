import { FastifyPluginAsync } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import { readJsonFile, writeJsonFile } from '../helpers/fileArchive'
import { AuditLog, CreateAuditLogRequest } from '../types/audit'
import { 
  CreateAuditLogSchema, 
  AuditLogResponseSchema, 
  CreateAuditLogResponseSchema 
} from '../schemas/auditLogs.schema'

const AUDIT_LOGS_FILE = 'src/data/auditLogs.json'

const auditLogs: FastifyPluginAsync = async (fastify) => {
  // POST /api/audit-logs
  fastify.post('/', {
    schema: {
      body: CreateAuditLogSchema,
      response: {
        201: CreateAuditLogResponseSchema
      }
    }
  }, async (request, reply) => {
    const logData = request.body as CreateAuditLogRequest
    
    const newLog: AuditLog = {
      ...logData,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    }

    try {
      const existingLogs: AuditLog[] = await readJsonFile(AUDIT_LOGS_FILE) || []
      const updatedLogs = [...existingLogs, newLog]
      await writeJsonFile(AUDIT_LOGS_FILE, updatedLogs)
      return reply.status(201).send({ success: true, data: newLog })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ success: false, error: 'Failed to create audit log' })
    }
  })

  // GET /api/audit-logs
  fastify.get('/', {
    schema: {
      response: {
        200: AuditLogResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const logs: AuditLog[] = await readJsonFile(AUDIT_LOGS_FILE) || []
      return { success: true, data: logs }
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ success: false, error: 'Failed to fetch audit logs' })
    }
  })
}

export default auditLogs 