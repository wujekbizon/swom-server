export interface DutyParams {
    caregiverId: string
    date?: string
}
  
export interface DutyBody {
    duty: Duty
}
  
export interface Duty {
      id: string
      date: string
      shift: 'day' | 'night'
      isActive: boolean
}
  
export interface Caregiver {
    id: string
    name: string
    duties: Duty[]
}