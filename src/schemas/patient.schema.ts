import { Type } from "@sinclair/typebox"

// Base schemas for nested objects
const SurgerySchema = Type.Object({
  date: Type.String(),
  procedure: Type.String()
})

const MedicationSchema = Type.Object({
  name: Type.String(),
  dosage: Type.String(),
  frequency: Type.String()
})

// Patient Create schema
export const CreatePatientSchema = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
  age: Type.Number(),
  hasInsurance: Type.Boolean(),
  room: Type.String(),
  medicalHistory: Type.Object({
    conditions: Type.Array(Type.String()),
    allergies: Type.Array(Type.String()),
    surgeries: Type.Array(Type.Object({
      date: Type.String(),
      procedure: Type.String()
    })),
    medications: Type.Array(Type.Object({
      name: Type.String(),
      dosage: Type.String(),
      frequency: Type.String()
    }))
  })
})

// Patient response schema (includes id)
export const PatientSchema = Type.Intersect([
  Type.Object({ id: Type.String() }),
  CreatePatientSchema
])

// Response schemas for Patient operations
export const GetPatientsResponseSchema = Type.Object({
  success: Type.Boolean(),
  patients: Type.Array(PatientSchema),
  total: Type.Number()
})

export const PatientResponseSchema = Type.Object({
  success: Type.Boolean(),
  patient: PatientSchema
})

// Add this with other schemas
export const PatientParamsSchema = Type.Object({
  patientId: Type.String()
}) 