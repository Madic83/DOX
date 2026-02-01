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
  patientNumber: string
  name?: string
  age: string
  
  // Militärinformation
  rank?: string
  ssn?: string
  unit: string
  
  // Skadeinformation (AT-MIST)
  timeOfInjury: string
  mechanism: string
  injuries: string
  
  // Observationer
  signs: string
  
  // Vitala tecken
  consciousness: string
  respiration: string
  pulse: string
  bloodPressure: string
  spo2: string
  temperature: string
  
  // Historik
  vitalHistory: VitalReading[]
  
  // Behandling
  treatment: string
  
  // Lokalisering
  location: string
  
  // Triage
  triageCategory: 'P1' | 'P2' | 'P3' | 'P4' | ''
  
  // Anteckningar
  notes?: string
  
  // Metadata
  dateTime?: string
}
