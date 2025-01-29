import { Type } from "@sinclair/typebox"

// Common response schemas
export const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String(),
  message: Type.Optional(Type.String())
})

export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String())
}) 