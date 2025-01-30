export interface HealthCheck {
    date: string
    bloodPressure: {
      systolic: number
      diastolic: number
    }
    bloodSugar: number
    heartRate: number
    oxygenSaturation: number
    temperature: number
}
  
export interface Patient {
    id: string
    firstName: string
    lastName: string
    age: number
    hasInsurance: boolean
    room: string
    medicalHistory: {
      conditions: string[]
      allergies: string[]
      surgeries: Array<{
        date: string
        procedure: string
      }>
      medications: Array<{
        name: string
        dosage: string
        frequency: string
      }>
    }
    healthParameters: {
      history: HealthCheck[]
      lastCheck: string
    }
}

// Request params type
export interface PatientParams {
    patientId: string
}
  
export interface CreatePatientRequest {
    firstName: string
    lastName: string
    age: number
    hasInsurance: boolean
    room: string
    medicalHistory: {
      conditions: string[]
      allergies: string[]
      surgeries: Array<{ date: string; procedure: string }>
      medications: Array<{ name: string; dosage: string; frequency: string }>
    }
}