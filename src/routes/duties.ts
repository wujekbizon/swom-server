import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { 
  GetDutiesResponseSchema, 
  DutyParamsSchema,
  DutyBodySchema,
  DeleteDutyParamsSchema,
  CaregiverSchema
} from '../schemas/duties.schema'
import { ErrorResponseSchema } from '../schemas/common.schema'
import { readJsonFile, writeJsonFile } from '../helpers/fileArchive'
import { DUTIES_FILE } from '../helpers/paths'
import type { DutyParams, Caregiver, DutyBody, Duty } from '../types/duties'

const dutiesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/duties - Retrieve all caregivers with their duties
  fastify.get('/', {
    schema: {
      response: {
        200: GetDutiesResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request, reply) => {
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

  // GET /api/duties/:caregiverId - Retrieve duties for specific caregiver
  fastify.get('/:caregiverId', {
    schema: {
      params: DutyParamsSchema,
      response: {
        200: CaregiverSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: DutyParams }>, reply) => {
    try {
      const data = await readJsonFile(DUTIES_FILE)
      const caregiver = data.caregivers.find((c: Caregiver) => c.id === request.params.caregiverId)
      
      if (!caregiver) {
        return reply.code(404).send({ error: 'Caregiver not found' })
      }
      
      return caregiver
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })

  // POST /api/duties/:caregiverId - Create or update a duty
  fastify.post('/:caregiverId', {
    schema: {
      params: DutyParamsSchema,
      body: DutyBodySchema,
      response: {
        200: CaregiverSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: DutyParams; Body: DutyBody }>, reply) => {
    try {
      const data = await readJsonFile(DUTIES_FILE)
      const caregiverIndex = data.caregivers.findIndex((c: Caregiver) => c.id === request.params.caregiverId)
      
      if (caregiverIndex === -1) {
        return reply.code(404).send({ error: 'Caregiver not found' })
      }

      const { duty } = request.body
      const dutyIndex = data.caregivers[caregiverIndex].duties.findIndex((d: Duty) => d.date === duty.date)

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

  // DELETE /api/duties/:caregiverId/:date - Remove a duty
  fastify.delete('/:caregiverId/:date', {
    schema: {
      params: DeleteDutyParamsSchema,
      response: {
        200: CaregiverSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: DutyParams }>, reply) => {
    try {
      const data = await readJsonFile(DUTIES_FILE)
      const caregiverIndex = data.caregivers.findIndex((c: Caregiver) => c.id === request.params.caregiverId)
      
      if (caregiverIndex === -1) {
        return reply.code(404).send({ error: 'Caregiver not found' })
      }

      const dutyIndex = data.caregivers[caregiverIndex].duties.findIndex((d: Duty) => d.date === request.params.date)

      if (dutyIndex !== -1) {
        data.caregivers[caregiverIndex].duties.splice(dutyIndex, 1)
        await writeJsonFile(DUTIES_FILE, data)
      }

      return data.caregivers[caregiverIndex]
    } catch (error) {
      return reply.code(500).send({ error: 'Server error' })
    }
  })
}

export default dutiesRoutes 