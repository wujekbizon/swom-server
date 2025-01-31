export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_PATIENT'
  | 'UPDATE_PATIENT'
  | 'CREATE_PATIENT'
  | 'DELETE_PATIENT'
  | 'VIEW_USER'
  | 'UPDATE_USER'
  | 'CREATE_USER'
  | 'DELETE_USER'
  | 'SYSTEM_ERROR'

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  details: Record<string, any>;
  ipAddress?: string;
}

export interface CreateAuditLogRequest {
  userId: string;
  userName: string;
  action: AuditAction;
  details: Record<string, any>;
  ipAddress?: string;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLog[];
}