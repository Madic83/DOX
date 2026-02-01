// Baserat på AT-MIST och DD-1380
export interface VitalReading {
  time: string
  timestamp?: string
  consciousness: string
  respiration: string
  pulse: string
  bloodPressure: string
  spo2: string
  temperature: string
}

export interface Patient {
  id: string
  
  // Grundläggande information
  patientNumber: string  // DD-1380: Patient Serial Number
  name?: string
  age: string
  timeOfInjury: string
  mechanism: string
  injuries: string
  
  // Vitala tecken
  consciousness: string
  respiration: string
  pulse: string
  bloodPressure: string
  spo2: string
  temperature: string
  
  // Historik
  vitalHistory: VitalReading[]
  
  // Behandling och klassificering
  treatment: string
  location: string
  unit: string
  triageCategory: 'P1' | 'P2' | 'P3' | 'P4'
}
