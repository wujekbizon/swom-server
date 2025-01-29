export interface User {
  id: string
  email: string
  password: string
  name: string
  role: 'caregiver' | 'admin'
  createdAt: string
} 