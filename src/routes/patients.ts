import { Type } from "@sinclair/typebox"
import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { 
  CreatePatientSchema,
  GetPatientsResponseSchema, 
  PatientResponseSchema,
  PatientParamsSchema
} from '../schemas/patient.schema'
import { ErrorResponseSchema } from '../schemas/common.schema'
import { readJsonFile, writeJsonFile } from '../helpers/fileArchive'
import { PATIENTS_FILE } from '../helpers/paths'
import { CreatePatientRequest, Patient, PatientParams } from "../types/patient"


/**
 * Patient Routes Plugin
 * Handles basic CRUD operations for patients
 */
const patientRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/patients
   * Retrieve all patients
   */
  fastify.get('/', {
    schema: {
      response: {
        200: GetPatientsResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      return {
        success: true,
        patients: data.patients,
        total: data.patients.length
      }
    } catch (error) {
      return reply.code(500).send({ 
        success: false, 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  /**
   * GET /api/patients/:patientId
   * Retrieve a specific patient by ID
   */
  fastify.get('/:patientId', {
    schema: {
      params: PatientParamsSchema,
      response: {
        200: PatientResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: PatientParams }>, reply) => {
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
        patient 
      } as {success: boolean, patient: Patient}
    } catch (error) {
      return reply.code(500).send({ 
        success: false, 
        error: 'Server error' 
      })
    }
  })

  /**
   * POST /api/patients
   * Create a new patient
   */
  fastify.post('/', {
    schema: {
      body: CreatePatientSchema,
      response: {
        201: PatientResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Body: CreatePatientRequest }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const newPatient: Patient = {
        id: crypto.randomUUID(),
        ...request.body,
        healthParameters: {
          history: [],
          lastCheck: ""
        }
      }

      data.patients.push(newPatient)
      await writeJsonFile(PATIENTS_FILE, data)

      return reply.code(201).send({
        success: true,
        patient: newPatient
      })
    } catch (error) {
      return reply.code(500).send({ 
        success: false, 
        error: 'Server error' 
      })
    }
  })

  /**
   * DELETE /api/patients/:patientId
   * Delete a patient by ID
   */
  fastify.delete('/:patientId', {
    schema: {
      params: PatientParamsSchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String()
        }),
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: PatientParams }>, reply) => {
    try {
      const data = await readJsonFile(PATIENTS_FILE)
      const patientIndex = data.patients.findIndex((p: Patient) => p.id === request.params.patientId)
      
      if (patientIndex === -1) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Patient not found' 
        })
      }

      data.patients.splice(patientIndex, 1)
      await writeJsonFile(PATIENTS_FILE, data)

      return {
        success: true,
        message: 'Patient deleted successfully'
      }
    } catch (error) {
      return reply.code(500).send({ 
        success: false, 
        error: 'Server error' 
      })
    }
  })
}

export default patientRoutes 