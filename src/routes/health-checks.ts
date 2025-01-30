import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { 
  CreateHealthCheckSchema,
  GetHealthChecksResponseSchema,
  HealthCheckResponseSchema,
  HealthCheckParamsSchema,
  UpdateHealthCheckSchema,
  DeleteHealthCheckSchema,
  DeleteHealthCheckResponseSchema
} from '../schemas/health-check.schema'
import { ErrorResponseSchema } from '../schemas/common.schema'
import { readJsonFile, writeJsonFile } from '../helpers/fileArchive'
import { PATIENTS_FILE } from '../helpers/paths'
import type { Patient, HealthCheck } from '../types/patient'

interface HealthCheckParams {
  patientId: string
  date?: string
}

interface CreateHealthCheckBody {
  check: HealthCheck
}

interface UpdateHealthCheckBody {
  updates: Partial<HealthCheck>
}

const healthCheckRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/health-checks/:patientId
   * Get all health checks for a patient
   */
  fastify.get('/:patientId', {
    schema: {
      params: HealthCheckParamsSchema,
      response: {
        200: GetHealthChecksResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: HealthCheckParams }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const patient = data.patients.find((p: Patient) => p.id === request.params.patientId)

      if (!patient) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Patient not found' 
        })
      }

      return {
        success: true,
        healthChecks: patient.healthParameters.history,
        lastCheck: patient.healthParameters.lastCheck,
        total: patient.healthParameters.history.length
      }
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })

  /**
   * GET /api/health-checks/:patientId/:date
   * Get specific health check by date
   */
  fastify.get('/:patientId/:date', {
    schema: {
      params: DeleteHealthCheckSchema,
      response: {
        200: HealthCheckResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: Required<HealthCheckParams> }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const patient = data.patients.find((p: Patient) => p.id === request.params.patientId)

      if (!patient) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Patient not found' 
        })
      }

      const healthCheck = patient.healthParameters.history.find(
        (h: HealthCheck) => h.date === request.params.date
      )

      if (!healthCheck) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Health check not found' 
        })
      }

      return {
        success: true,
        healthCheck
      }
    } catch (error) {
      return reply.code(500).send({ 
        success: false, 
        error: 'Server error' 
      })
    }
  })

  /**
   * POST /api/health-checks/:patientId
   * Create new health check
   */
  fastify.post('/:patientId', {
    schema: {
      params: HealthCheckParamsSchema,
      body: CreateHealthCheckSchema,
      response: {
        201: HealthCheckResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: HealthCheckParams; Body: CreateHealthCheckBody }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const patientIndex = data.patients.findIndex((p: Patient) => p.id === request.params.patientId)

      if (patientIndex === -1) {
        return reply.code(404).send({ error: 'Patient not found' })
      }

      const { check } = request.body
      data.patients[patientIndex].healthParameters.history.push(check)
      data.patients[patientIndex].healthParameters.lastCheck = check.date

      await writeJsonFile(PATIENTS_FILE, data)

      return reply.code(201).send({
        success: true,
        healthCheck: check
      })
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })

  /**
   * PUT /api/health-checks/:patientId/:date
   * Update existing health check
   */
  fastify.put('/:patientId/:date', {
    schema: {
      params: DeleteHealthCheckSchema,
      body: UpdateHealthCheckSchema,
      response: {
        200: HealthCheckResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: Required<HealthCheckParams>; 
    Body: UpdateHealthCheckBody 
  }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const patientIndex = data.patients.findIndex((p: Patient) => p.id === request.params.patientId)

      if (patientIndex === -1) {
        return reply.code(404).send({ error: 'Patient not found' })
      }

      const checkIndex = data.patients[patientIndex].healthParameters.history.findIndex(
        (h: HealthCheck) => h.date === request.params.date
      )

      if (checkIndex === -1) {
        return reply.code(404).send({ error: 'Health check not found' })
      }

      const updatedCheck = {
        ...data.patients[patientIndex].healthParameters.history[checkIndex],
        ...request.body.updates
      }

      data.patients[patientIndex].healthParameters.history[checkIndex] = updatedCheck
      await writeJsonFile(PATIENTS_FILE, data)

      return {
        success: true,
        healthCheck: updatedCheck
      }
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })

  /**
   * DELETE /api/health-checks/:patientId/:date
   * Delete health check
   */
  fastify.delete('/:patientId/:date', {
    schema: {
      params: DeleteHealthCheckSchema,
      response: {
        200: DeleteHealthCheckResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: Required<HealthCheckParams> }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const patientIndex = data.patients.findIndex((p: Patient) => p.id === request.params.patientId)

      if (patientIndex === -1) {
        return reply.code(404).send({ error: 'Patient not found' })
      }

      const checkIndex = data.patients[patientIndex].healthParameters.history.findIndex(
        (h: HealthCheck) => h.date === request.params.date
      )

      if (checkIndex === -1) {
        return reply.code(404).send({ error: 'Health check not found' })
      }

      data.patients[patientIndex].healthParameters.history.splice(checkIndex, 1)
      
      if (data.patients[patientIndex].healthParameters.lastCheck === request.params.date) {
        const lastCheck = data.patients[patientIndex].healthParameters.history[0]
        data.patients[patientIndex].healthParameters.lastCheck = lastCheck ? lastCheck.date : null
      }

      await writeJsonFile(PATIENTS_FILE, data)

      return {
        success: true,
        message: 'Health check deleted successfully'
      }
    } catch (error) {
      return reply.code(500).send({ success: false, error: 'Server error' })
    }
  })
}

export default healthCheckRoutes 