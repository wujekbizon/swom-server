import { Type } from '@sinclair/typebox'

export const UserRole = Type.Enum({
  caregiver: 'caregiver',
  admin: 'admin'
})

export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
})

export const RegisterSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  name: Type.String(),
  role: UserRole
})

export type User = {
  id: string
  email: string
  password: string
  name: string
  role: 'caregiver' | 'admin'
  createdAt: string
} 