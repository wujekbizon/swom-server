import { Type } from "@sinclair/typebox"

// Base HealthCheck schema
export const HealthCheckSchema = Type.Object({
  date: Type.String(),
  bloodPressure: Type.Object({
    systolic: Type.Number(),
    diastolic: Type.Number()
  }),
  bloodSugar: Type.Number(),
  heartRate: Type.Number(),
  oxygenSaturation: Type.Number(),
  temperature: Type.Number()
})

// Create/Update schema
export const CreateHealthCheckSchema = Type.Object({
  patientId: Type.String(),
  check: HealthCheckSchema
})

// Response schemas for HealthCheck operations
export const GetHealthChecksResponseSchema = Type.Object({
  success: Type.Boolean(),
  healthChecks: Type.Array(HealthCheckSchema),
  lastCheck: Type.String(),
  total: Type.Number()
})

export const HealthCheckResponseSchema = Type.Object({
  success: Type.Boolean(),
  healthCheck: HealthCheckSchema
})

// Request params schemas
export const HealthCheckParamsSchema = Type.Object({
  patientId: Type.String(),
  date: Type.Optional(Type.String())
})

// Request body schemas for different operations
export const UpdateHealthCheckSchema = Type.Object({
  updates: Type.Partial(HealthCheckSchema)
})

export const DeleteHealthCheckSchema = Type.Object({
  patientId: Type.String(),
  date: Type.String()
})

// Add this schema for delete response
export const DeleteHealthCheckResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String()
}) 