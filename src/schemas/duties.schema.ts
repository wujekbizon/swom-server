import { Type } from "@sinclair/typebox"

// Duty schema
export const DutySchema = Type.Object({
  id: Type.String(),
  date: Type.String(),
  shift: Type.Union([
    Type.Literal('day'),
    Type.Literal('night')
  ]),
  isActive: Type.Boolean()
})

// Caregiver schema
export const CaregiverSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  duties: Type.Array(DutySchema)
})

// Response schemas
export const GetDutiesResponseSchema = Type.Object({
  success: Type.Boolean(),
  caregivers: Type.Array(CaregiverSchema),
  total: Type.Number()
})

// Request schemas
export const DutyParamsSchema = Type.Object({
  caregiverId: Type.String()
})

export const DutyBodySchema = Type.Object({
  duty: DutySchema
})

export const DeleteDutyParamsSchema = Type.Object({
  caregiverId: Type.String(),
  date: Type.String()
}) 