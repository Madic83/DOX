import { useState } from 'react'
import './App.css'

interface VitalReading {
  time: string
  timestamp?: string
  consciousness: string
  respiration: string
  pulse: string
  bloodPressure: string
  spo2: string
  temperature: string
}

interface Patient {
  id: string
  patientNumber: string
  name: string
  age: string
  timeOfInjury: string
  mechanism: string
  injuries: string
  consciousness: string
  respiration: string
  pulse: string
  bloodPressure: string
  spo2: string
  temperature: string
  vitalHistory: VitalReading[]
  treatment: string
  location: string
  unit: string
  triageCategory: string
}

function App() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)
  const [showVitals, setShowVitals] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'journal' | 'at-mist' | 'rekommendationer'>('journal')
  const [previousTreatment, setPreviousTreatment] = useState('')
  const [customTimeVitals, setCustomTimeVitals] = useState('')
  const [customTimeMeds, setCustomTimeMeds] = useState('')
  const [customTimeActions, setCustomTimeActions] = useState('')
  const [formData, setFormData] = useState({
    patientNumber: '',
    name: '',
    age: '',
    timeOfInjury: '',
    mechanism: '',
    injuries: '',
    consciousness: '',
    respiration: '',
    pulse: '',
    bloodPressure: '',
    spo2: '',
    temperature: '',
    treatment: '',
    location: '',
    unit: '',
    triageCategory: ''
  })

  const handleTimeInput = (value: string): string => {
    // Ta bara siffror
    const digits = value.replace(/\D/g, '')
    
    // Om 4 siffror, förmatera som HH:MM
    if (digits.length === 4) {
      const hours = parseInt(digits.substring(0, 2))
      const minutes = parseInt(digits.substring(2, 4))
      
      // Validera
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${digits.substring(0, 2)}:${digits.substring(2, 4)}`
      }
      // Om ogiltigt, returnera bara siffrorna utan förmatering
      return digits
    }
    
    // Om mindre än 4 siffror, returnera som är
    if (digits.length <= 2) {
      return digits
    }
    
    // Om mellan 2 och 4 siffror, förmatera med :
    if (digits.length === 3) {
      return `${digits.substring(0, 2)}:${digits.substring(2)}`
    }
    
    // Mer än 4 siffror, ta bara de 4 för¶rsta
    if (digits.length > 4) {
      const first4 = digits.substring(0, 4)
      const hours = parseInt(first4.substring(0, 2))
      const minutes = parseInt(first4.substring(2, 4))
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${first4.substring(0, 2)}:${first4.substring(2, 4)}`
      }
      return first4
    }
    
    return digits
  }

  const getTime = (customTime: string) => {
    if (customTime) {
      return customTime
    }
    return new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  // const isValidTime = (time: string): boolean => {
    if (!time) return true // Tom är ok, använder vi aktuell tid
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    return regex.test(time)
  }

  const canBeValidTime = (input: string): boolean => {
    if (!input) return true // Tom är ok
    
    const digits = input.replace(/\D/g, '') // Ta bara siffror
    
    if (digits.length === 0) return true
    if (digits.length === 1) {
      const first = parseInt(digits[0])
      return first <= 2 // Timmar börjar¶rjar på¥ 0, 1 eller 2
    }
    if (digits.length === 2) {
      const hours = parseInt(digits.substring(0, 2))
      return hours <= 23 // Kan vara 0-23
    }
    if (digits.length === 3) {
      const hours = parseInt(digits.substring(0, 2))
      const firstMinute = parseInt(digits[2])
      return hours <= 23 && firstMinute <= 5 // för¶rsta siffran på¥ minuter kan vara 0-5
    }
    if (digits.length >= 4) {
      const hours = parseInt(digits.substring(0, 2))
      const minutes = parseInt(digits.substring(2, 4))
      return hours <= 23 && minutes <= 59
    }
    
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPatientId) {
      // Uppdatera befintlig patient
      setPatients(patients.map(p => {
        if (p.id === editingPatientId) {
          const updatedPatient = { ...p, ...formData }
          // Lägg till nuvarande vitala parametrar i historik om nåtg¥gra är ifyllda
          if (formData.consciousness || formData.respiration || formData.pulse || formData.bloodPressure || formData.spo2 || formData.temperature) {
            const newReading: VitalReading = {
              time: getTime(customTimeVitals),
              consciousness: formData.consciousness,
              respiration: formData.respiration,
              pulse: formData.pulse,
              bloodPressure: formData.bloodPressure,
              spo2: formData.spo2,
              temperature: formData.temperature
            }
            updatedPatient.vitalHistory = [...(p.vitalHistory || []), newReading]
          }
          return updatedPatient
        }
        return p
      }))
      setEditingPatientId(null)
    } else {
      // Skapa ny patient
      const patientNumber = `P-${String(patients.length + 1).padStart(3, '0')}`
      const vitalHistory: VitalReading[] = []
      
      // Lägg till initiala vitalparametrar om nåtg¥gra är ifyllda
      if (formData.consciousness || formData.respiration || formData.pulse || formData.bloodPressure || formData.spo2 || formData.temperature) {
        const initialReading: VitalReading = {
          time: getTime(customTimeVitals),
          consciousness: formData.consciousness,
          respiration: formData.respiration,
          pulse: formData.pulse,
          bloodPressure: formData.bloodPressure,
          spo2: formData.spo2,
          temperature: formData.temperature
        }
        vitalHistory.push(initialReading)
      }
      
      const newPatient: Patient = {
        id: Date.now().toString(),
        ...formData,
        patientNumber,
        vitalHistory
      }
      setPatients([...patients, newPatient])
    }
    
    setFormData({
      patientNumber: '',
      name: '',
      age: '',
      timeOfInjury: '',
      mechanism: '',
      injuries: '',
      consciousness: '',
      respiration: '',
      pulse: '',
      bloodPressure: '',
      spo2: '',
      temperature: '',
      treatment: '',
      location: '',
      unit: '',
      triageCategory: ''
    })
    setPreviousTreatment('')
    setShowForm(false)
  }

  const handleEditPatient = (patient: Patient) => {
    setPreviousTreatment(patient.treatment)
    setFormData({
      patientNumber: patient.patientNumber,
      name: patient.name,
      age: patient.age,
      timeOfInjury: patient.timeOfInjury,
      mechanism: patient.mechanism,
      injuries: patient.injuries,
      consciousness: '',
      respiration: '',
      pulse: '',
      bloodPressure: '',
      spo2: '',
      temperature: '',
      treatment: patient.treatment,
      location: patient.location,
      unit: patient.unit,
      triageCategory: patient.triageCategory
    })
    setEditingPatientId(patient.id)
    setShowForm(true)
  }

  const getTriageColor = (category: string) => {
    switch(category) {
      case 'P1': return '#dc2626'
      case 'P2': return '#f59e0b'
      case 'P3': return '#10b981'
      case 'P4': return '#6b7280'
      default: return '#444'
    }
  }

  if (showForm) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>{editingPatientId ? 'Uppdatera patient' : 'Registrera ny patient'}</h1>
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '15px', padding: '15px', background: '#222', borderRadius: '4px' }}>
            <strong>Patientnummer: {editingPatientId ? formData.patientNumber : `P-${String(patients.length + 1).padStart(3, '0')}`}</strong>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Namn</label>
            <input
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Enhet</label>
            <input
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
              style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Ålder</label>
            <input
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tidpunkt för skada</label>
            <input
              value={formData.timeOfInjury}
              onChange={e => setFormData({...formData, timeOfInjury: e.target.value})}
              style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Skademekanism</label>
            <textarea
              value={formData.mechanism}
              onChange={e => setFormData({...formData, mechanism: e.target.value})}
              style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', minHeight: '80px' }}
              placeholder="t.ex. Splitter, GSW, brand..."
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Skador</label>
            <textarea
              value={formData.injuries}
              onChange={e => setFormData({...formData, injuries: e.target.value})}
              style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', minHeight: '100px' }}
              placeholder="Beskriv alla skador..."
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '18px', color: '#F3D021', margin: 0 }}>Vitala parametrar</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap' }}>Tid:</label>
                <input
                  type="text"
                  value={customTimeVitals}
                  onChange={e => setCustomTimeVitals(handleTimeInput(e.target.value))}
                  style={{ width: '90px', padding: '4px 8px', fontSize: '14px', background: !canBeValidTime(customTimeVitals) ? '#8b0000' : '#222', color: '#fff', border: !canBeValidTime(customTimeVitals) ? '1px solid #ff0000' : '1px solid #444', borderRadius: '4px' }}
                  placeholder="HH:MM"
                  maxLength={5}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Andning (AF)</label>
              <input
                value={formData.respiration}
                onChange={e => setFormData({...formData, respiration: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                placeholder=""
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>SpO2</label>
              <input
                value={formData.spo2}
                onChange={e => setFormData({...formData, spo2: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                placeholder=""
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Puls (HF)</label>
              <input
                value={formData.pulse}
                onChange={e => setFormData({...formData, pulse: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                placeholder=""
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Blodtryck (BT)</label>
              <input
                value={formData.bloodPressure}
                onChange={e => setFormData({...formData, bloodPressure: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                placeholder=""
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Medvetande (ACVPU)</label>
              <input
                value={formData.consciousness}
                onChange={e => setFormData({...formData, consciousness: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                placeholder=""
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Temperatur</label>
              <input
                value={formData.temperature}
                onChange={e => setFormData({...formData, temperature: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                placeholder=""
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '18px', color: '#F3D021', margin: 0 }}>Behandling</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap' }}>Tid:</label>
                <input
                  type="text"
                  value={customTimeMeds}
                  onChange={e => setCustomTimeMeds(handleTimeInput(e.target.value))}
                  style={{ width: '90px', padding: '4px 8px', fontSize: '14px', background: !canBeValidTime(customTimeMeds) ? '#8b0000' : '#222', color: '#fff', border: !canBeValidTime(customTimeMeds) ? '1px solid #ff0000' : '1px solid #444', borderRadius: '4px' }}
                  placeholder="HH:MM"
                  maxLength={5}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>TCCC - Läkemedel:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {[
                  'TXA 2g iv (Ej efter 3h fråtn skada)',
                  'Morfin 10mg IM/IV',
                  'Fentanylklubba 800mcg',
                  'Esketamin 25mg im',
                  'Ondansetron 4mg IV',
                  'Vätska 250ml'
                ].map(med => {
                  const regex = new RegExp(med.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\[\\d{2}:\\d{2}\\]', 'g')
                  const allCount = (formData.treatment.match(regex) || []).length
                  const previousCount = (previousTreatment.match(regex) || []).length
                  const count = allCount - previousCount
                  return (
                    <button
                      key={med}
                      type="button"
                      onClick={() => {
                        if (count > 0) {
                          // Ta bort senaste dosen
                          const lines = formData.treatment.split('\n')
                          let lastIndex = -1
                          for (let i = lines.length - 1; i >= 0; i--) {
                            if (lines[i].includes(med)) {
                              lastIndex = i
                              break
                            }
                          }
                          if (lastIndex !== -1) {
                            lines.splice(lastIndex, 1)
                            setFormData({...formData, treatment: lines.join('\n')})
                          }
                        } else {
                          // Lägg till ny dos
                          const currentTime = getTime(customTimeMeds)
                          const medWithTime = `${med} [${currentTime}]`
                          setFormData({...formData, treatment: formData.treatment + (formData.treatment ? '\n' : '') + medWithTime})
                        }
                      }}
                      style={{
                        padding: '10px',
                        fontSize: '14px',
                        background: count > 0 ? '#F3D021' : '#333',
                        color: count > 0 ? '#000' : '#fff',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative'
                      }}
                    >
                      {med}
                      {count > 0 && (
                        <span style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          right: '8px', 
                          background: '#000', 
                          color: '#F3D021', 
                          borderRadius: '50%', 
                          width: '20px', 
                          height: '20px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', marginTop: '15px' }}>Antibiotika:</label>
              <div style={{ marginBottom: '10px', padding: '10px', background: '#1a1a1a', borderRadius: '4px', border: '1px solid #444' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#ccc', lineHeight: '1.5' }}>
                  <strong>Indikationer:</strong> Antibiotika ges vid penetrerande trauma eller öppna frakturer. 
                  första dos ska ges inom 3 timmar fråtn skada. Välj antibiotika baserat på skadelokalisation och djup.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '10px' }}>
                {[
                  { label: 'Kloxacillin 2g x3', indication: 'Öppen fraktur, Stor mjukdelsskada, amputation' },
                  { label: 'Cefotaxim 2g x3', indication: 'Extremitetsskada >10cm, thorax-, buk-, ansikts- eller skallskada' },
                  { label: 'Metronidazol 1g x1', indication: 'Tillägg vid buk-, intrakraniella eller skallskador' }
                ].map(item => {
                  const regex = new RegExp(item.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\[\\d{2}:\\d{2}\\]', 'g')
                  const allCount = (formData.treatment.match(regex) || []).length
                  const previousCount = (previousTreatment.match(regex) || []).length
                  const count = allCount - previousCount
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (count > 0) {
                          // Ta bort sista för¶rekomsten
                          const lines = formData.treatment.split('\n')
                          let lastIndex = -1
                          for (let i = lines.length - 1; i >= 0; i--) {
                            if (lines[i].includes(item.label)) {
                              lastIndex = i
                              break
                            }
                          }
                          if (lastIndex !== -1) {
                            lines.splice(lastIndex, 1)
                            setFormData({...formData, treatment: lines.join('\n')})
                          }
                        } else {
                          // Lägg till
                          const currentTime = getTime(customTimeMeds)
                          const medWithTime = `${item.label} [${currentTime}]`
                          setFormData({...formData, treatment: formData.treatment + (formData.treatment ? '\n' : '') + medWithTime})
                        }
                      }}
                      style={{
                        padding: '10px',
                        fontSize: '14px',
                        background: count > 0 ? '#F3D021' : '#333',
                        color: count > 0 ? '#000' : '#fff',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{ fontSize: '11px', color: count > 0 ? '#000' : '#999', marginLeft: '10px' }}>({item.indication})</span>
                      {count > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '8px',
                          background: '#000',
                          color: '#F3D021',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold', margin: 0 }}>TCCC - Åtgärder:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <label style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap' }}>Tid:</label>
                  <input
                    type="text"
                    value={customTimeActions}
                    onChange={e => setCustomTimeActions(handleTimeInput(e.target.value))}
                    style={{ width: '90px', padding: '4px 8px', fontSize: '14px', background: !canBeValidTime(customTimeActions) ? '#8b0000' : '#222', color: '#fff', border: !canBeValidTime(customTimeActions) ? '1px solid #ff0000' : '1px solid #444', borderRadius: '4px' }}
                    placeholder="HH:MM"
                    maxLength={5}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Tourniquet:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                  {['TQ HA', 'TQ HB', 'TQ VA', 'TQ VB'].map(tq => {
                    const isApplied = formData.treatment.includes(tq)
                    return (
                      <button
                        key={tq}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            // Ta bort sista för¶rekomsten
                            const lines = formData.treatment.split('\n')
                            let lastIndex = -1
                            for (let i = lines.length - 1; i >= 0; i--) {
                              if (lines[i].includes(tq)) {
                                lastIndex = i
                                break
                              }
                            }
                            if (lastIndex !== -1) {
                              lines.splice(lastIndex, 1)
                              setFormData({...formData, treatment: lines.join('\n')})
                            }
                          } else {
                            // Lägg till
                            const currentTime = getTime(customTimeActions)
                            const actionWithTime = `${tq} [${currentTime}]`
                            setFormData({...formData, treatment: formData.treatment + (formData.treatment ? '\n' : '') + actionWithTime})
                          }
                        }}
                        style={{
                          padding: '8px',
                          fontSize: '13px',
                          background: isApplied ? '#F3D021' : '#333',
                          color: isApplied ? '#000' : '#fff',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {tq}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {[
                  { action: 'Luftväg säkrad', needsLocation: false },
                  { action: 'Nåldekomp', needsLocation: true, sides: ['H', 'V'] },
                  { action: 'Chest seal', needsLocation: true, sides: ['H', 'V'] },
                  { action: 'Sårpack', needsLocation: true, sides: ['H', 'V'] }
                ].map(item => {
                  if (item.needsLocation && item.sides) {
                    return (
                      <div key={item.action} style={{ display: 'flex', gap: '4px' }}>
                        {item.sides.map(side => {
                          const actionText = `${item.action} ${side}`
                          const isApplied = formData.treatment.includes(actionText)
                          return (
                            <button
                              key={`${item.action}-${side}`}
                              type="button"
                              onClick={() => {
                                if (isApplied) {
                                  // Ta bort sista för¶rekomsten
                                  const lines = formData.treatment.split('\n')
                                  let lastIndex = -1
                                  for (let i = lines.length - 1; i >= 0; i--) {
                                    if (lines[i].includes(actionText)) {
                                      lastIndex = i
                                      break
                                    }
                                  }
                                  if (lastIndex !== -1) {
                                    lines.splice(lastIndex, 1)
                                    setFormData({...formData, treatment: lines.join('\n')})
                                  }
                                } else {
                                  // Lägg till
                                  const currentTime = getTime(customTimeActions)
                                  const actionWithTime = `${actionText} [${currentTime}]`
                                  setFormData({...formData, treatment: formData.treatment + (formData.treatment ? '\n' : '') + actionWithTime})
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '10px',
                                fontSize: '14px',
                                background: isApplied ? '#F3D021' : '#333',
                                color: isApplied ? '#000' : '#fff',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                            >
                              {actionText}
                            </button>
                          )
                        })}
                      </div>
                    )
                  } else {
                    const isApplied = formData.treatment.includes(item.action)
                    return (
                      <button
                        key={item.action}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            // Ta bort sista för¶rekomsten
                            const lines = formData.treatment.split('\n')
                            let lastIndex = -1
                            for (let i = lines.length - 1; i >= 0; i--) {
                              if (lines[i].includes(item.action)) {
                                lastIndex = i
                                break
                              }
                            }
                            if (lastIndex !== -1) {
                              lines.splice(lastIndex, 1)
                              setFormData({...formData, treatment: lines.join('\n')})
                            }
                          } else {
                            // Lägg till
                            const currentTime = getTime(customTimeActions)
                            const actionWithTime = `${item.action} [${currentTime}]`
                            setFormData({...formData, treatment: formData.treatment + (formData.treatment ? '\n' : '') + actionWithTime})
                          }
                        }}
                        style={{
                          padding: '10px',
                          fontSize: '14px',
                          background: isApplied ? '#F3D021' : '#333',
                          color: isApplied ? '#000' : '#fff',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {item.action}
                      </button>
                    )
                  }
                })}
              </div>

              {/* IV/IO access med specifika platser */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>IV/IO access:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                  {['H Arm', 'V Arm', 'H Ben', 'V Ben'].map(ioAccess => {
                    const isApplied = formData.treatment.includes(ioAccess)
                    return (
                      <button
                        key={ioAccess}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            // Ta bort sista för¶rekomsten
                            const lines = formData.treatment.split('\n')
                            let lastIndex = -1
                            for (let i = lines.length - 1; i >= 0; i--) {
                              if (lines[i].includes(ioAccess)) {
                                lastIndex = i
                                break
                              }
                            }
                            if (lastIndex !== -1) {
                              lines.splice(lastIndex, 1)
                              setFormData({...formData, treatment: lines.join('\n')})
                            }
                          } else {
                            // Lägg till
                            const currentTime = getTime(customTimeActions)
                            const actionWithTime = `IV/IO access ${ioAccess} [${currentTime}]`
                            setFormData({...formData, treatment: formData.treatment + (formData.treatment ? '\n' : '') + actionWithTime})
                          }
                        }}
                        style={{
                          padding: '8px',
                          fontSize: '13px',
                          background: isApplied ? '#F3D021' : '#333',
                          color: isApplied ? '#000' : '#fff',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {ioAccess}
                      </button>
                    )
                  })}
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: '5px' }}>Övrig behandling:</label>
              <textarea
                value={formData.treatment}
                onChange={e => setFormData({...formData, treatment: e.target.value})}
                style={{ width: '100%', padding: '12px', fontSize: '16px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', minHeight: '100px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px' }}>Triage-kategori</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 'P1', label: 'P1 - Omedelbar', color: '#dc2626' },
                { value: 'P2', label: 'P2 - Brådskande', color: '#f59e0b' },
                { value: 'P3', label: 'P3 - Fördröjd', color: '#10b981' },
                { value: 'P4', label: 'P4 - Avliden', color: '#6b7280' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({...formData, triageCategory: option.value})}
                  style={{
                    padding: '20px',
                    fontSize: '16px',
                    background: option.color,
                    color: '#fff',
                    border: formData.triageCategory === option.value ? `4px solid #fff` : '2px solid #000',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    minHeight: '80px',
                    opacity: 1
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: '#F3D021',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
          >
            Spara patient
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setEditingPatientId(null)
              setFormData({
                patientNumber: '',
                name: '',
                age: '',
                timeOfInjury: '',
                mechanism: '',
                injuries: '',
                consciousness: '',
                respiration: '',
                pulse: '',
                bloodPressure: '',
                spo2: '',
                temperature: '',
                treatment: '',
                location: '',
                unit: '',
                triageCategory: ''
              })
            }}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Avbryt
          </button>
        </form>
      </div>
    )
  }

  if (showVitals) {
    const patient = patients.find(p => p.id === showVitals)
    if (!patient) return null

    // Kombinera historik med nuvarande värden
    const allReadings = [
      ...(patient.vitalHistory || []),
      // Lägg till nuvarande värden fråt¥n formData om vi är i redigeringsläge
      editingPatientId === showVitals && (formData.consciousness || formData.respiration || formData.pulse || formData.bloodPressure || formData.spo2 || formData.temperature) ? [{
        time: 'CURRENT',
        consciousness: formData.consciousness,
        respiration: formData.respiration,
        pulse: formData.pulse,
        bloodPressure: formData.bloodPressure,
        spo2: formData.spo2,
        temperature: formData.temperature
      }] : []
    ]

    const getNumericValue = (str: string | undefined): number => {
      if (!str) return 0
      const match = str.match(/\d+(?:\.\d+)?/)
      return match ? parseFloat(match[0]) : 0
    }

    const createCombinedGraph = (readings: VitalReading[]) => {
      // Filter out readings that have at least one vital parameter
      const data = readings.filter(r => r.pulse || r.respiration || r.spo2 || r.temperature || r.consciousness || r.bloodPressure)
      if (data.length === 0) return null

      // Define parameters with their ranges and colors
      const params = [
        { field: 'respiration' as keyof VitalReading, label: 'Andning (AF)', color: '#f59e0b', symbol: 'square' },
        { field: 'spo2' as keyof VitalReading, label: 'SpO2', color: '#10b981', symbol: 'triangle' },
        { field: 'pulse' as keyof VitalReading, label: 'Puls', color: '#dc2626', symbol: 'circle' },
        { field: 'bloodPressure' as keyof VitalReading, label: 'Blodtryck', color: '#a855f7', symbol: 'arc' },
        { field: 'consciousness' as keyof VitalReading, label: 'ACVPU', color: '#06b6d4', symbol: 'diamond' },
        { field: 'temperature' as keyof VitalReading, label: 'Temperatur', color: '#3b82f6', symbol: 'circle' }
      ]

      const minValue = 0
      const maxValue = 200
      const padding = 40
      const pointSpacing = 25  // Fast avståt¥nd mellan punkter
      const width = Math.max(data.length * pointSpacing + padding * 2, 400)  // Grafens totala bredd
      const height = 400  // Håt¶gre graf
      const graphWidth = (data.length - 1) * pointSpacing  // Faktiska ritområt¥det baserat på¥ antal punkter
      const graphHeight = height - padding * 2

      // Calculate points för each parameter
      const allPoints = params.map(param => ({
        ...param,
        points: data.map((reading, index) => {
          let value: number
          
          // Special handling för ACVPU
          if (param.field === 'consciousness') {
            const consciousness = (reading[param.field] as string || '').toUpperCase()
            if (consciousness === 'A') value = 100
            else if (consciousness === 'C') value = 80
            else if (consciousness === 'V') value = 50
            else if (consciousness === 'P') value = 30
            else if (consciousness === 'U') value = 0
            else return null
          } else {
            value = getNumericValue(reading[param.field] as string | undefined)
            if (value === 0) return null
          }
          
          // för¶r blodtryck, använd åt¶vertryck för¶r huvud-punkten
          if (param.field === 'bloodPressure') {
            value = parseInt(reading.bloodPressure?.split('/')[0] || '0') || 0
            if (value === 0) return null
          }
          
          const x = padding + (index / Math.max(data.length - 1, 1)) * graphWidth
          const y = padding + graphHeight - ((value - minValue) / (maxValue - minValue)) * graphHeight
          return { x, y, value, reading }
        }).filter(p => p !== null)
      }))

      // Lägg till undertryck som separata punkter
      const diastolicPoints = data.map((reading, index) => {
        if (!reading.bloodPressure) return null
        const diastolic = parseInt(reading.bloodPressure?.split('/')[1] || '0') || 0
        if (diastolic === 0) return null
        const x = padding + (index / Math.max(data.length - 1, 1)) * graphWidth
        const y = padding + graphHeight - ((diastolic - minValue) / (maxValue - minValue)) * graphHeight
        return { x, y, value: diastolic, reading }
      }).filter(p => p !== null)

      // Funktion för¶r att rita symboler
      const renderSymbol = (x: number, y: number, size: number, color: string, symbol: string, reading?: VitalReading) => {
        if (symbol === 'circle') {
          return <circle cx={x} cy={y} r={size} fill={color} stroke="#000" strokeWidth="1" />
        } else if (symbol === 'square') {
          return <rect x={x - size} y={y - size} width={size * 2} height={size * 2} fill={color} stroke="#000" strokeWidth="1" />
        } else if (symbol === 'triangle') {
          return <polygon points={`${x},${y - size} ${x + size},${y + size} ${x - size},${y + size}`} fill={color} stroke="#000" strokeWidth="1" />
        } else if (symbol === 'diamond') {
          return <polygon points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`} fill={color} stroke="#000" strokeWidth="1" />
        } else if (symbol === 'arc') {
          // Chevron (soldatbörjar¥ge) - alltid v (nedåt¥t) för¶r åt¶vertryck
          if (!reading || !reading.bloodPressure) return null
          const chevronPath = `M ${x - size} ${y - size} L ${x} ${y + size} L ${x + size} ${y - size}` // v nedåt¥t
          return <path d={chevronPath} stroke={color} strokeWidth="2" fill="none" />
        }
        return null
      }

      return (
        <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '20px', marginTop: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#F3D021' }}>Vitalparametrar</h4>
          <div style={{ overflowX: 'auto' }}>
            <svg width={Math.max(width, 400)} height={height} style={{ background: '#0a0a0a', borderRadius: '4px' }}>
              {/* Rutnät - vertikala linjer vid varje datapunkt */}
              {data.map((_, i) => {
                const x = padding + (i / Math.max(data.length - 1, 1)) * graphWidth
                return <line key={`vgrid-${i}`} x1={x} y1={padding} x2={x} y2={height - padding} stroke="#444" strokeDasharray="2,2" strokeWidth="0.5" opacity="0.7" />
              })}
              
              {/* Rutnät - horisontella linjer med skala 0-200, varje 10 enheter */}
              {Array.from({ length: 21 }).map((_, i) => {
                const y = padding + (i / 20) * graphHeight
                const value = maxValue - (i / 20) * (maxValue - minValue)
                const isMainLine = value % 50 === 0
                const showLabel = value % 50 === 0  // Visa bara varje 50:e värde
                return (
                  <g key={`hgrid-${i}`}>
                    <line 
                      x1={padding} y1={y} x2={width - padding} y2={y} 
                      stroke={isMainLine ? '#666' : '#444'}
                      strokeDasharray={isMainLine ? '0' : '2,2'} 
                      strokeWidth={isMainLine ? '2' : '0.5'}
                      opacity="1"
                    />
                    {showLabel && (
                      <text x={padding - 8} y={y + 4} textAnchor="end" fill="#fff" fontSize="12" fontWeight="bold">
                        {Math.round(value)}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Axlar */}
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#666" strokeWidth="2" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#666" strokeWidth="2" />

              {/* Linjer och symboler för¶r varje parameter */}
              {allPoints.map(param => {
                if (param.points.length === 0) return null

                const pathData = param.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

                return (
                  <g key={param.field}>
                    {/* Linje */}
                    <path d={pathData} stroke={param.color} strokeWidth="2" fill="none" opacity="0.8" />

                    {/* Symboler */}
                    {param.points.map((p, i) => (
                      <g key={`${param.field}-${i}`}>
                        {param.field === 'consciousness' ? (
                          <text 
                            x={p.x} 
                            y={p.y + 5} 
                            textAnchor="middle" 
                            fill={param.color} 
                            fontSize="14" 
                            fontWeight="bold"
                          >
                            {(p.reading.consciousness || '').toUpperCase()}
                          </text>
                        ) : (
                          renderSymbol(p.x, p.y, 4, param.color, param.symbol, p.reading)
                        )}
                      </g>
                    ))}
                  </g>
                )
              })}

              {/* Linje mellan undertrycksvärdena */}
              {diastolicPoints.length > 1 && (
                <path 
                  d={diastolicPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} 
                  stroke="#c084fc" 
                  strokeWidth="2" 
                  fill="none" 
                  opacity="0.8" 
                />
              )}

              {/* Undertryck (diastoliska värden) som uppå¥tvänd chevron */}
              {diastolicPoints.map((p, i) => {
                const size = 4
                const chevronPath = `M ${p.x - size} ${p.y + size} L ${p.x} ${p.y - size} L ${p.x + size} ${p.y + size}`  // ^ uppå¥t
                return <path key={`diastolic-${i}`} d={chevronPath} stroke="#c084fc" strokeWidth="2" fill="none" />
              })}

              {/* Tidsmarkeringar längs x-axeln */}
              {data.map((reading, i) => {
                const isEveryOther = i % 2 === 0  // Visa varannan tidpunkt
                if (!isEveryOther && data.length > 5) return null  // för¶r måt¥nga punkter: visa bara varannan
                const x = padding + (i / Math.max(data.length - 1, 1)) * graphWidth
                const time = reading.timestamp || ''
                return (
                  <g key={`time-${i}`}>
                    <line x1={x} y1={height - padding} x2={x} y2={height - padding + 5} stroke="#666" strokeWidth="1" />
                    {isEveryOther || data.length <= 5 ? (
                      <text
                        x={x}
                        y={height - padding + 20}
                        textAnchor="middle"
                        fill="#999"
                        fontSize="11"
                      >
                        {time ? time.substring(0, 5) : ''}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {params.map(param => (
              <div key={param.field} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: param.color, borderRadius: '3px' }}></div>
                <span style={{ fontSize: '14px' }}>{param.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }



    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>{patient.patientNumber}</h1>
        <h2 style={{ marginBottom: '20px' }}>{patient.name || 'Namn ej angivet'}</h2>
        
        <button
          onClick={() => setShowVitals(null)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#666',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          † Tillbaka
        </button>

        {viewMode === 'journal' && allReadings.length > 0 ? (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#F3D021' }}>Trend:</h3>
            
            {createCombinedGraph(allReadings)}

            {/* Tabell med exakta värden */}
            <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginTop: '20px', marginBottom: '20px', overflowX: 'auto' }}>
              <h4 style={{ marginBottom: '15px', color: '#F3D021' }}>Exakta värden</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F3D021' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>Tidpunkt</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>Andning (AF)</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>SpO2 (%)</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>Puls (HF)</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>Blodtryck (BT)</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>ACVPU</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#F3D021' }}>Temperatur (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {allReadings.map((reading, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #333', background: reading.time === 'CURRENT' ? '#1a3a1a' : 'transparent' }}>
                      <td style={{ padding: '10px', fontWeight: reading.time === 'CURRENT' ? 'bold' : 'normal' }}>
                        {reading.time === 'CURRENT' ? 'ðŸ“ Aktuell' : reading.time}
                      </td>
                      <td style={{ padding: '10px' }}>{reading.respiration || '-'}</td>
                      <td style={{ padding: '10px' }}>{reading.spo2 || '-'}</td>
                      <td style={{ padding: '10px' }}>{reading.pulse || '-'}</td>
                      <td style={{ padding: '10px' }}>{reading.bloodPressure || '-'}</td>
                      <td style={{ padding: '10px' }}>{reading.consciousness || '-'}</td>
                      <td style={{ padding: '10px' }}>{reading.temperature || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {viewMode === 'rekommendationer' && (
          <>
            <h3 style={{ marginBottom: '15px', color: '#F3D021', marginTop: '30px' }}>Rekommendationer</h3>
            
            <div style={{ 
              background: '#0a2a1a', 
              padding: '20px', 
              marginBottom: '20px', 
              borderRadius: '8px',
              border: '2px solid #F3D021'
            }}>
              {(() => {
                const recommendations: { treatments: string[] } = { treatments: [] }
                
                // Kontrollera om det finns någon faktisk patientdata
                const hasInjuries = patient.injuries && patient.injuries.trim().length > 0
                const hasVitals = patient.pulse || patient.respiration || patient.spo2 || patient.bloodPressure || patient.consciousness
                
                if (!hasInjuries && !hasVitals) {
                  return (
                    <div style={{ 
                      background: '#1a1a1a', 
                      padding: '15px', 
                      borderRadius: '4px', 
                      border: '1px solid #666',
                      color: '#888'
                    }}>
                      Registrera skador och vitala parametrar för att få rekommendationer enligt TCCC-protokoll
                    </div>
                  )
                }

                // TCCC PRIORITERINGSORDNING:
                // 1. CATASTROPHIC BLEEDING CONTROL
                // 2. AIRWAY MANAGEMENT
                // 3. BREATHING
                // 4. CIRCULATION
                // 5. HYPOTHERMIA/OTHER

                // === 1. CATASTROPHIC BLEEDING CONTROL ===
                if (patient.injuries) {
                  const injuries = patient.injuries.toLowerCase()
                  
                  // Extremitetsskador med blödning
                  if ((injuries.includes('extremitet') || injuries.includes('ben') || injuries.includes('arm') || injuries.includes('hand') || injuries.includes('fot')) && 
                      (injuries.includes('blöd') || injuries.includes('skada'))) {
                    recommendations.treatments.push('🔴 EXTREMITETSSKADA MED BLÖDNING:')
                    recommendations.treatments.push('  • Applicera tourniquet ovan skadan (2-3 cm proximalt)')
                    recommendations.treatments.push('  • Markera tid på tourniquet och huden')
                    recommendations.treatments.push('  • Höga tourniquets (lårliv/övre arm) vid massiv blödning')
                  }
                  
                  // Bröstkorgskada
                  if (injuries.includes('thorax') || injuries.includes('bröstkorg') || injuries.includes('bröst')) {
                    recommendations.treatments.push('🫁 BRÖSTKORGSKADA:')
                    
                    // Öppen bröstkorgskada
                    if (injuries.includes('öppen') || injuries.includes('genom')) {
                      recommendations.treatments.push('  • ÖPPEN THORAX: Täck omedelbar med okklusiv förband (3-sidor)')
                      recommendations.treatments.push('  • Se efter luftvägsljud - ljud från såret indikerar luftläcka')
                    }
                    
                    // Tecken på spänningsthorax
                    if ((patient.respiration && parseInt(patient.respiration) > 30) || 
                        (patient.spo2 && parseInt(patient.spo2) < 90) ||
                        (patient.pulse && parseInt(patient.pulse) > 120)) {
                      recommendations.treatments.push('  • MISSTANKE PÅ SPÄNNINGSTHORAX:')
                      recommendations.treatments.push('  • Nåldekommpression: 2nd ICS, midaxillär linje (14G kanyl)')
                      recommendations.treatments.push('  • Följd av bröstdränage (28-32F chest tube)')
                    }
                  }
                  
                  // Bäcken-/abdominalskada
                  if (injuries.includes('abdomen') || injuries.includes('bäcken') || injuries.includes('magiskador')) {
                    recommendations.treatments.push('💥 ABDOMINAL/BÄCKEN-SKADA:')
                    
                    if (injuries.includes('bäcken')) {
                      recommendations.treatments.push('  • Applicera bäckenband (SAM Pelvic Sling) för stabilisering')
                      recommendations.treatments.push('  • Förhindrar ökad blödning från frakturerade bäckenknotor')
                    }
                    
                    recommendations.treatments.push('  • Risk för massiv intra-abdominal blödning')
                    recommendations.treatments.push('  • PRIORITERA EVAKUERING till operationssal')
                  }
                }

                // === 2. AIRWAY MANAGEMENT ===
                if (patient.consciousness) {
                  const consciousness = patient.consciousness.toUpperCase()
                  
                  if (consciousness === 'U') {
                    recommendations.treatments.push('🛡️ AIRWAY - MEDVETSLÖS PATIENT:')
                    recommendations.treatments.push('  • Positionera på sidan (recovery position)')
                    recommendations.treatments.push('  • Säkerställ öppen luftväg - avlägsna framliggande material')
                    recommendations.treatments.push('  • Överväg nasopharyngeal airway (NPA, 6-8mm)')
                    recommendations.treatments.push('  • Intubering om tränad och möjligt')
                  } else if (consciousness === 'V' || consciousness === 'P') {
                    recommendations.treatments.push('🛡️ AIRWAY - REDUCERAD MEDVETENHET:')
                    recommendations.treatments.push('  • Övervaka luftväg löpande - risk för försämring')
                    recommendations.treatments.push('  • Ha airway-verktyg redo (NPA, OPA, intubering-utrustning)')
                  }
                }

                // === 3. BREATHING ===
                if (patient.respiration) {
                  const respValue = parseInt(patient.respiration)
                  
                  if (respValue > 35) {
                    recommendations.treatments.push('🫁 BREATHING - EXTREMT HÖG ANDNINGSFREKVENS:')
                    recommendations.treatments.push('  • Misstanke på spänningsthorax - se bröstkorgskada ovan')
                    recommendations.treatments.push('  • Eller massiv blödning/chock - se circulation nedan')
                  } else if (respValue > 30) {
                    recommendations.treatments.push('🫁 BREATHING - HÖG ANDNINGSFREKVENS (>30):')
                    recommendations.treatments.push('  • Kan indikera spänningsthorax eller chock')
                    recommendations.treatments.push('  • Taktisk andning: 4-4-4-4 (in-hold-ut-hold) för att lugna')
                  } else if (respValue < 10) {
                    recommendations.treatments.push('🫁 BREATHING - LÅG ANDNINGSFREKVENS (<10) - KRITISKT:')
                    recommendations.treatments.push('  • Manuell ventilation: BVM (Bag-Valve-Mask) 12-20 andetag/min')
                    recommendations.treatments.push('  • Överväg airway-intervention')
                  }
                }

                // === 4. CIRCULATION ===
                if (patient.bloodPressure || patient.pulse) {
                  const systolic = patient.bloodPressure ? parseInt(patient.bloodPressure.split('/')[0] || '0') : 0
                  const pulseValue = patient.pulse ? parseInt(patient.pulse) : 0
                  
                  if (systolic < 90 || pulseValue > 120) {
                    recommendations.treatments.push('🩸 CIRCULATION - HYPOVOLEMIC CHOCK:')
                    recommendations.treatments.push('  • Två IV-kanylor (18G eller större, grön eller vit)')
                    recommendations.treatments.push('  • Vätsketillförsel: Normal Saline eller Ringer Laktat')
                    recommendations.treatments.push('  • TCCC-protokoll: Restriktiv vätskehantering tills kirurgisk hemostasis')
                    
                    if (systolic < 70) {
                      recommendations.treatments.push('  • KRITISK HYPOTENSION (<70): Minimal vätsketillförsel, PRIORITERA EVAKUERING')
                    }
                  } else if (systolic < 100 || pulseValue > 100) {
                    recommendations.treatments.push('🩸 CIRCULATION - KOMPENSERAD CHOCK:')
                    recommendations.treatments.push('  • En IV-kanyl, börja vätsketillförsel')
                    recommendations.treatments.push('  • Övervaka blödningskälla')
                  }
                  
                  if (pulseValue < 60 && pulseValue > 0) {
                    recommendations.treatments.push('🩸 CIRCULATION - BRADYKARDI:')
                    recommendations.treatments.push('  • Risk för spänningsthorax eller hjärtarytmi')
                    recommendations.treatments.push('  • Kontrollera bröstkorgskada och airway')
                  }
                }

                // === 5. HYPOTHERMIA/OTHER ===
                if (patient.temperature) {
                  const tempValue = parseFloat(patient.temperature)
                  
                  if (tempValue < 32) {
                    recommendations.treatments.push('❄️ SEVERE HYPOTHERMIA (<32°C):')
                    recommendations.treatments.push('  • Långsam passiv värmning - undvik "afterdrop"')
                    recommendations.treatments.push('  • Minimal rörelse - risk för cardiac arrest')
                    recommendations.treatments.push('  • ECMO-värming på sjukhus om möjligt')
                  } else if (tempValue < 35) {
                    recommendations.treatments.push('❄️ MODERATE HYPOTHERMIA (32-35°C):')
                    recommendations.treatments.push('  • Aktiv yttre värmning (värmefilt, värmande vätskor)')
                  } else if (tempValue < 36) {
                    recommendations.treatments.push('❄️ MILD HYPOTHERMIA (<36°C):')
                    recommendations.treatments.push('  • Passiv värmning - täckning och skydd från miljö')
                  }
                }

                // === STANDARD TCCC-INTERVENTIONER ===
                recommendations.treatments.push('')
                recommendations.treatments.push('📋 STANDARD INTERVENTIONER:')
                recommendations.treatments.push('  • Tranexamic acid (TXA): 1g IV över 10 min inom 3 timmar från trauma')
                recommendations.treatments.push('  • Morphine: 0.1 mg/kg IV/IM eller Ketamine: 1-2 mg/kg IV')
                recommendations.treatments.push('  • Combat Gauze/Quikclot vid arteriell blödning')
                recommendations.treatments.push('  • Tetanus-profylax: Tdap eller dT beroende på historia')
                recommendations.treatments.push('  • Överväg antibiotikaprofylax vid öppen skada (Amoxicillin-Clavulansyra)')

                return (
                  <div>
                    <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '4px', marginBottom: '15px', borderLeft: '4px solid #F3D021' }}>
                      <strong style={{ color: '#F3D021' }}>TCCC PROTOKOLL - TACTICAL COMBAT CASUALTY CARE</strong>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
                        Följer FM:s Prehospitala behandlingsriktlinjer (2019)
                      </div>
                    </div>
                    <div style={{ background: '#000', padding: '15px', borderRadius: '4px' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {recommendations.treatments.map((treatment, i) => {
                          // Formatera rubrikerna
                          if (treatment.match(/^🔴|^🫁|^💥|^🛡️|^🩸|^❄️|^📋/)) {
                            return (
                              <li key={i} style={{ 
                                marginBottom: '10px', 
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#F3D021',
                                marginTop: i === 0 ? '0' : '10px'
                              }}>
                                {treatment}
                              </li>
                            )
                          }
                          // Tom rad
                          if (treatment === '') {
                            return <li key={i} style={{ marginBottom: '10px' }} />
                          }
                          // Normala punkter
                          return (
                            <li key={i} style={{ marginBottom: '5px', fontSize: '13px', color: '#fff' }}>
                              {treatment}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )
              })()}
            </div>
          </>
        )}

        {viewMode === 'at-mist' && (
          <>
            <h3 style={{ marginBottom: '15px', color: '#F3D021', marginTop: '30px' }}>AT-MIST</h3>
                
                {/* Samlad journal */}
                <div style={{ 
              background: '#0a2a1a', 
              padding: '20px', 
              marginBottom: '20px', 
              borderRadius: '8px',
              border: '2px solid #F3D021'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Patientnummer:</strong> {patient.patientNumber}</div>
                <div><strong>Enhet:</strong> {patient.unit || '-'}</div>
                <div><strong>Namn:</strong> {patient.name || '-'}</div>
                <div><strong>Triagekategori:</strong> {patient.triageCategory || '-'}</div>
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                  <strong style={{ color: '#F3D021' }}>A - Age (Ålder):</strong> {patient.age || '-'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#F3D021' }}>T - Time (Tidsnummer):</strong> {patient.timeOfInjury || '-'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#F3D021' }}>M - Mechanism (Skademekanism):</strong> {patient.mechanism || '-'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#F3D021' }}>I - Injuries (Skador):</strong> {patient.injuries || '-'}
                </div>
              </div>
              <div style={{ marginTop: '15px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#F3D021' }}>S - Signs (Vitala parametrar):</strong>
                <div style={{ 
                  background: '#000', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  {(() => {
                    // Hitta senaste värdet för varje parameter från hela historiken
                    const latestValues: {
                      consciousness?: string
                      respiration?: string
                      pulse?: string
                      bloodPressure?: string
                      spo2?: string
                      temperature?: string
                    } = {}

                    // Gå igenom alla readings och hitta senaste värdet för varje parameter
                    allReadings.forEach(reading => {
                      if (reading.consciousness && !latestValues.consciousness) latestValues.consciousness = reading.consciousness
                      if (reading.respiration && !latestValues.respiration) latestValues.respiration = reading.respiration
                      if (reading.pulse && !latestValues.pulse) latestValues.pulse = reading.pulse
                      if (reading.bloodPressure && !latestValues.bloodPressure) latestValues.bloodPressure = reading.bloodPressure
                      if (reading.spo2 && !latestValues.spo2) latestValues.spo2 = reading.spo2
                      if (reading.temperature && !latestValues.temperature) latestValues.temperature = reading.temperature
                    })

                    const hasAnyValue = Object.values(latestValues).some(v => v)

                    return hasAnyValue ? (
                      <div>
                        {latestValues.consciousness && <div style={{ marginBottom: '5px' }}><strong>Medvetande:</strong> {latestValues.consciousness}</div>}
                        {latestValues.respiration && <div style={{ marginBottom: '5px' }}><strong>Andning:</strong> {latestValues.respiration}</div>}
                        {latestValues.pulse && <div style={{ marginBottom: '5px' }}><strong>Puls:</strong> {latestValues.pulse}</div>}
                        {latestValues.bloodPressure && <div style={{ marginBottom: '5px' }}><strong>BT:</strong> {latestValues.bloodPressure}</div>}
                        {latestValues.spo2 && <div style={{ marginBottom: '5px' }}><strong>SpO2:</strong> {latestValues.spo2}</div>}
                        {latestValues.temperature && <div style={{ marginBottom: '5px' }}><strong>Temp:</strong> {latestValues.temperature}</div>}
                      </div>
                    ) : (
                      <div>Inga vitala parametrar registrerade</div>
                    )
                  })()}
                </div>
              </div>
              {patient.treatment && (
                <div style={{ marginTop: '15px' }}>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#F3D021' }}>T - Treatment (Behandling):</strong>
                  <div style={{ 
                    background: '#000', 
                    padding: '10px', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '13px'
                  }}>
                    {patient.treatment}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff',
      padding: '20px'
    }}>
      <h1>Patientregistrering</h1>
      <p style={{ marginBottom: '20px' }}>{patients.length} patienter registrerade</p>
      
      <button 
        onClick={() => {
          setShowForm(true)
          setEditingPatientId(null)
          setFormData({
            patientNumber: '',
            name: '',
            age: '',
            timeOfInjury: '',
            mechanism: '',
            injuries: '',
            consciousness: '',
            respiration: '',
            pulse: '',
            bloodPressure: '',
            spo2: '',
            temperature: '',
            treatment: '',
            location: '',
            unit: '',
            triageCategory: ''
          })
        }}
        style={{
          padding: '20px 40px',
          fontSize: '18px',
          background: '#F3D021',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '30px',
          fontWeight: 'bold'
        }}
      >
        + Registrera ny patient
      </button>

      {patients.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px' }}>Registrerade patienter</h2>
          {patients.map(patient => (
            <div 
              key={patient.id} 
              onClick={() => handleEditPatient(patient)}
              style={{ 
              background: '#111', 
              padding: '15px', 
              marginBottom: '15px', 
              borderRadius: '8px',
              border: '1px solid #333',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#111'}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                {patient.patientNumber} - {patient.name || 'Namn ej angivet'}
              </div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Triage:</strong>{' '}
                <span style={{ 
                  background: getTriageColor(patient.triageCategory),
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>{patient.triageCategory}</span>
              </div>
              <div style={{ color: '#aaa', marginBottom: '5px' }}>
                <strong>Ålder:</strong> {patient.age}
              </div>
              {patient.consciousness && (
                <div style={{ color: '#aaa', marginBottom: '5px' }}>
                  <strong>Medvetande:</strong> {patient.consciousness}
                </div>
              )}
              {patient.pulse && (
                <div style={{ color: '#aaa', marginBottom: '5px' }}>
                  <strong>Puls:</strong> {patient.pulse}
                </div>
              )}
              {patient.bloodPressure && (
                <div style={{ color: '#aaa', marginBottom: '5px' }}>
                  <strong>BT:</strong> {patient.bloodPressure}
                </div>
              )}
              <div style={{ color: '#aaa', marginBottom: '5px' }}>
                <strong>Skador:</strong> {patient.injuries}
              </div>
              <div style={{ color: '#aaa', marginBottom: '5px' }}>
                <strong>Behandling:</strong> {patient.treatment}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewMode('journal')
                    setShowVitals(patient.id)
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    background: '#F3D021',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Journal
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewMode('at-mist')
                    setShowVitals(patient.id)
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    background: '#F3D021',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  AT-MIST
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewMode('rekommendationer')
                    setShowVitals(patient.id)
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    background: '#F3D021',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Rekommendationer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App











