import { Type } from "@sinclair/typebox"

// Types
export const DutySchema = Type.Object({
  date: Type.String(),
  // Add other duty properties here
})

export const CaregiverSchema = Type.Object({
  id: Type.String(),
  duties: Type.Array(DutySchema)
})

export const DataSchema = Type.Object({
  caregivers: Type.Array(CaregiverSchema)
})
