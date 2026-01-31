// Baserat på AT-MIST och DD-1380
export interface Patient {
  id: string
  
  // Grundläggande information
  patientNumber: string  // DD-1380: Patient Serial Number
  dateTime: string       // Tid för registrering
  
  // AT-MIST
  age: string           // Age
  timeOfInjury: string  // Time
  mechanism: string     // Mechanism
  injuries: string      // Injuries
  signs: string         // Signs (vitala tecken)
  treatment: string     // Treatment given
  
  // DD-1380 tillägg
  name?: string
  rank?: string
  ssn?: string          // Service Number
  unit: string
  location: string      // Where found
  
  // Vitala tecken (från Signs)
  bloodPressure?: string
  pulse?: string
  respiration?: string
  temperature?: string
  
  // Triage
  triageCategory: 'P1' | 'P2' | 'P3' | 'P4' | ''
  
  // Anteckningar
  notes?: string
}
