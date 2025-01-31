import { Type } from '@sinclair/typebox'

export const CreateAuditLogSchema = Type.Object({
  userId: Type.String(),
  userName: Type.String(),
  action: Type.Union([
    Type.Literal('LOGIN'),
    Type.Literal('LOGOUT'),
    Type.Literal('VIEW_PATIENT'),
    Type.Literal('UPDATE_PATIENT'),
    Type.Literal('CREATE_PATIENT'),
    Type.Literal('DELETE_PATIENT'),
    Type.Literal('VIEW_USER'),
    Type.Literal('UPDATE_USER'),
    Type.Literal('CREATE_USER'),
    Type.Literal('DELETE_USER'),
    Type.Literal('SYSTEM_ERROR')
  ]),
  details: Type.Record(Type.String(), Type.Any()),
  ipAddress: Type.Optional(Type.String())
})

export const AuditLogSchema = Type.Object({
  id: Type.String(),
  timestamp: Type.String(),
  userId: Type.String(),
  userName: Type.String(),
  action: Type.String(),
  details: Type.Record(Type.String(), Type.Any()),
  ipAddress: Type.Optional(Type.String())
})

export const AuditLogResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(AuditLogSchema)
})

export const CreateAuditLogResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: AuditLogSchema
}) 