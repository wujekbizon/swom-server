import { Type } from "@sinclair/typebox"

export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
})

export const RegisterSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  name: Type.String(),
  role: Type.Union([
    Type.Literal('caregiver'),
    Type.Literal('admin')
  ])
}) 