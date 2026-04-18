import { useState, useEffect } from 'react'
import type { Patient, VitalReading } from './types'
import pmGuidelinesRaw from './data/fm-prehospitala-2025.json'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [patients, setPatients] = useState<Patient[]>([])
  const [evacuatedPatients, setEvacuatedPatients] = useState<(Patient & { evacuatedLocation?: string })[]>([])
  const [deceasedPatients, setDeceasedPatients] = useState<Patient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null)
  const [showVitals, setShowVitals] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'journal' | 'at-mist' | 'rekommendationer'>('journal')
  const [showEvacuationModal, setShowEvacuationModal] = useState(false)
  const [evacuationLocation, setEvacuationLocation] = useState('')
  const [viewEvacuated, setViewEvacuated] = useState(false)
  const [viewDeceased, setViewDeceased] = useState(false)
  const [viewPm, setViewPm] = useState(false)
  const [pmSearch, setPmSearch] = useState('')
  const [pmShowToc, setPmShowToc] = useState(false)
  const [previousTreatment, setPreviousTreatment] = useState('')
  const [customTimeVitals, setCustomTimeVitals] = useState('')
  const [customTimeMeds, setCustomTimeMeds] = useState('')
  const [customTimeActions, setCustomTimeActions] = useState('')
  const [formData, setFormData] = useState<Partial<Patient>>({
    patientNumber: '',
    name: '',
    age: '',
    timeOfInjury: '',
    mechanism: '',
    injuries: '',
    signs: '',
    consciousness: '',
    respiration: '',
    pulse: '',
    bloodPressure: '',
    spo2: '',
    temperature: '',
    treatment: '',
    location: '',
    unit: '',
    triageCategory: '',
    rank: '',
    ssn: '',
    notes: '',
    dateTime: '',
    vitalHistory: []
  })

  // Ladda användarens patienter från localStorage om inloggad
  useEffect(() => {
    if (currentUser) {
      const savedPatients = localStorage.getItem(`patients_${currentUser}`)
      if (savedPatients) {
        setPatients(JSON.parse(savedPatients))
      }
    }
  }, [currentUser])

  // Spara patienter till localStorage när de ändras
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`patients_${currentUser}`, JSON.stringify(patients))
      localStorage.setItem(`evacuated_${currentUser}`, JSON.stringify(evacuatedPatients))
      localStorage.setItem(`deceased_${currentUser}`, JSON.stringify(deceasedPatients))
    }
  }, [patients, evacuatedPatients, deceasedPatients, currentUser])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      alert('Användarnamn och lösenord krävs')
      return
    }

    // Special test account
    if (loginForm.username === 'test' && loginForm.password === 'test') {
      setCurrentUser('test')
      const savedPatients = localStorage.getItem('patients_test')
      if (savedPatients) {
        setPatients(JSON.parse(savedPatients))
      } else {
        setPatients([])
      }
      const savedEvacuated = localStorage.getItem('evacuated_test')
      if (savedEvacuated) {
        setEvacuatedPatients(JSON.parse(savedEvacuated))
      } else {
        setEvacuatedPatients([])
      }
      const savedDeceased = localStorage.getItem('deceased_test')
      if (savedDeceased) {
        setDeceasedPatients(JSON.parse(savedDeceased))
      } else {
        setDeceasedPatients([])
      }
      setLoginForm({ username: '', password: '' })
      return
    }

    // Regular user authentication
    const users = JSON.parse(localStorage.getItem('users') || '{}')
    
    if (users[loginForm.username]) {
      if (users[loginForm.username] === loginForm.password) {
        // Login successful
        setCurrentUser(loginForm.username)
        const savedPatients = localStorage.getItem(`patients_${loginForm.username}`)
        if (savedPatients) {
          setPatients(JSON.parse(savedPatients))
        } else {
          setPatients([])
        }
        const savedEvacuated = localStorage.getItem(`evacuated_${loginForm.username}`)
        if (savedEvacuated) {
          setEvacuatedPatients(JSON.parse(savedEvacuated))
        } else {
          setEvacuatedPatients([])
        }
        const savedDeceased = localStorage.getItem(`deceased_${loginForm.username}`)
        if (savedDeceased) {
          setDeceasedPatients(JSON.parse(savedDeceased))
        } else {
          setDeceasedPatients([])
        }
        setLoginForm({ username: '', password: '' })
      } else {
        alert('Fel lösenord')
      }
    } else {
      // Register new user
      users[loginForm.username] = loginForm.password
      localStorage.setItem('users', JSON.stringify(users))
      
      setCurrentUser(loginForm.username)
      setPatients([])
      setEvacuatedPatients([])
      setDeceasedPatients([])
      setLoginForm({ username: '', password: '' })
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    setPatients([])
    setEvacuatedPatients([])
    setDeceasedPatients([])
    setShowForm(false)
    setShowVitals(null)
    setViewEvacuated(false)
    setViewDeceased(false)
    setViewPm(false)
  }

  // Om ingen är inloggad, visa login-sida
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', background: '#111', padding: '40px', borderRadius: '12px', border: '1px solid #333' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#F3D021' }}>DOX</h1>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '18px' }}>Militär Patientdokumentation</h2>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Användarnamn:</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                placeholder="Ange användarnamn"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Lösenord:</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="Ange lösenord"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#F3D021',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Logga in / Registrera
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
            <p>Första gången? Ange ett användarnamn och lösenord för att registrera dig.</p>
          </div>
        </div>
      </div>
    )
  }

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
  //   if (!time) return true // Tom är ok, använder vi aktuell tid
  //   const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  //   return regex.test(time)
  // }

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

  const savePatients = (patientList: Patient[]) => {
    if (currentUser) {
      localStorage.setItem(`patients_${currentUser}`, JSON.stringify(patientList))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let updatedPatients: Patient[] = []
    
    if (editingPatientId) {
      // Uppdatera befintlig aktiv patient
      const existingPatient = patients.find(p => p.id === editingPatientId)

      if (!existingPatient) {
        setEditingPatientId(null)
        setShowForm(false)
        return
      }

      const updatedPatient: Patient = {
        ...existingPatient,
        ...formData,
        triageCategory: (formData.triageCategory ?? existingPatient.triageCategory ?? '') as 'P1' | 'P2' | 'P3' | 'P4' | ''
      }

      const previousTriage = existingPatient.triageCategory
      const nextTriage = updatedPatient.triageCategory
      if (previousTriage !== nextTriage && nextTriage) {
        updatedPatient.triageHistory = [
          ...(existingPatient.triageHistory || []),
          {
            from: previousTriage,
            to: nextTriage,
            time: new Date().toLocaleString('sv-SE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        ]
      }

      // Lägg till nuvarande vitala parametrar i historik om nåtg¥gra är ifyllda
      if (formData.consciousness || formData.respiration || formData.pulse || formData.bloodPressure || formData.spo2 || formData.temperature) {
        const newReading: VitalReading = {
          time: getTime(customTimeVitals),
          consciousness: formData.consciousness ?? '',
          respiration: formData.respiration ?? '',
          pulse: formData.pulse ?? '',
          bloodPressure: formData.bloodPressure ?? '',
          spo2: formData.spo2 ?? '',
          temperature: formData.temperature ?? ''
        }
        updatedPatient.vitalHistory = [...(existingPatient.vitalHistory || []), newReading]
      }

      if (updatedPatient.triageCategory === 'P4') {
        const remainingPatients = patients.filter(p => p.id !== editingPatientId)
        setPatients(remainingPatients)
        setDeceasedPatients(prev => [...prev.filter(p => p.id !== updatedPatient.id), updatedPatient])
        updatedPatients = remainingPatients
      } else {
        updatedPatients = patients.map(p => (p.id === editingPatientId ? updatedPatient : p))
        setPatients(updatedPatients)
        setDeceasedPatients(prev => prev.filter(p => p.id !== updatedPatient.id))
      }

      setEditingPatientId(null)
    } else {
      // Skapa ny patient
      const patientNumber = `P-${String(patients.length + 1).padStart(3, '0')}`
      const vitalHistory: VitalReading[] = []
      
      // Lägg till initiala vitalparametrar om nåtg¥gra är ifyllda
      if (formData.consciousness || formData.respiration || formData.pulse || formData.bloodPressure || formData.spo2 || formData.temperature) {
        const initialReading: VitalReading = {
          time: getTime(customTimeVitals),
          consciousness: formData.consciousness ?? '',
          respiration: formData.respiration ?? '',
          pulse: formData.pulse ?? '',
          bloodPressure: formData.bloodPressure ?? '',
          spo2: formData.spo2 ?? '',
          temperature: formData.temperature ?? ''
        }
        vitalHistory.push(initialReading)
      }
      
      const newPatient: Patient = {
        id: Date.now().toString(),
        patientNumber,
        vitalHistory,
        triageHistory: [],
        name: formData.name ?? '',
        age: formData.age ?? '',
        unit: formData.unit ?? '',
        timeOfInjury: formData.timeOfInjury ?? '',
        mechanism: formData.mechanism ?? '',
        injuries: formData.injuries ?? '',
        consciousness: formData.consciousness ?? '',
        respiration: formData.respiration ?? '',
        pulse: formData.pulse ?? '',
        bloodPressure: formData.bloodPressure ?? '',
        spo2: formData.spo2 ?? '',
        temperature: formData.temperature ?? '',
        treatment: formData.treatment ?? '',
        location: formData.location ?? '',
        triageCategory: (formData.triageCategory ?? '') as 'P1' | 'P2' | 'P3' | 'P4' | '',
        signs: formData.signs ?? '',
        rank: formData.rank,
        ssn: formData.ssn,
        notes: formData.notes,
        dateTime: formData.dateTime
      }

      if (newPatient.triageCategory === 'P4') {
        setDeceasedPatients(prev => [...prev, newPatient])
        updatedPatients = patients
      } else {
        updatedPatients = [...patients, newPatient]
        setPatients(updatedPatients)
      }
    }
    
    // Spara explicit till localStorage
    savePatients(updatedPatients)
    
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
                  'TXA 2g iv (Ej efter 3h från skada)',
                  'Morfin 10mg IM/IV',
                  'Fentanylklubba 800mcg',
                  'Esketamin 25mg im',
                  'Ondansetron 4mg IV',
                  'Vätska 250ml'
                ].map(med => {
                  const regex = new RegExp(med.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\[\\d{2}:\\d{2}\\]', 'g')
                  const allCount = ((formData.treatment ?? '').match(regex) || []).length
                  const previousCount = (previousTreatment.match(regex) || []).length
                  const count = allCount - previousCount
                  return (
                    <button
                      key={med}
                      type="button"
                      onClick={() => {
                        if (count > 0) {
                          // Ta bort senaste dosen
                          const lines = (formData.treatment ?? '').split('\n')
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
                          setFormData({...formData, treatment: (formData.treatment ?? '') + ((formData.treatment ?? '') ? '\n' : '') + medWithTime})
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
                  const allCount = ((formData.treatment ?? '').match(regex) || []).length
                  const previousCount = (previousTreatment.match(regex) || []).length
                  const count = allCount - previousCount
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (count > 0) {
                          // Ta bort sista för¶rekomsten
                          const lines = (formData.treatment ?? '').split('\n')
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
                          setFormData({...formData, treatment: (formData.treatment ?? '') + ((formData.treatment ?? '') ? '\n' : '') + medWithTime})
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
                  {['TQ HöArm', 'TQ HöBen', 'TQ VäArm', 'TQ VäBen'].map(tq => {
                    const isApplied = (formData.treatment ?? '').includes(tq)
                    return (
                      <button
                        key={tq}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            // Ta bort sista för¶rekomsten
                            const lines = (formData.treatment ?? '').split('\n')
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
                  { action: 'Chest seal', needsLocation: true, sides: ['Hö fram', 'Hö bak', 'Vä fram', 'Vä bak'] },
                  { action: 'Sårpack', needsLocation: true, sides: ['Hö ljumske','Hö axill', 'Vä ljumske', 'Vä axill'] },
                ].map(item => {
                  if (item.needsLocation && item.sides) {
                    return (
                      <div key={item.action} style={{ display: 'flex', gap: '4px' }}>
                        {item.sides.map(side => {
                          const actionText = `${item.action} ${side}`
                          const isApplied = (formData.treatment ?? '').includes(actionText)
                          return (
                            <button
                              key={`${item.action}-${side}`}
                              type="button"
                              onClick={() => {
                                if (isApplied) {
                                  // Ta bort sista för¶rekomsten
                                  const lines = (formData.treatment ?? '').split('\n')
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
                                  setFormData({...formData, treatment: (formData.treatment ?? '') + ((formData.treatment ?? '') ? '\n' : '') + actionWithTime})
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
                    const isApplied = (formData.treatment ?? '').includes(item.action)
                    return (
                      <button
                        key={item.action}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            // Ta bort sista för¶rekomsten
                            const lines = (formData.treatment ?? '').split('\n')
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
                            setFormData({...formData, treatment: (formData.treatment ?? '') + ((formData.treatment ?? '') ? '\n' : '') + actionWithTime})
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
                    const isApplied = (formData.treatment ?? '').includes(ioAccess)
                    return (
                      <button
                        key={ioAccess}
                        type="button"
                        onClick={() => {
                          if (isApplied) {
                            // Ta bort sista för¶rekomsten
                            const lines = (formData.treatment ?? '').split('\n')
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
                            setFormData({...formData, treatment: (formData.treatment ?? '') + ((formData.treatment ?? '') ? '\n' : '') + actionWithTime})
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
                  onClick={() => setFormData({...formData, triageCategory: option.value as 'P1' | 'P2' | 'P3' | 'P4' | ''})}
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
            Spara
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

  if (viewEvacuated) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
        <button
          onClick={() => setViewEvacuated(false)}
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
          ← Tillbaka
        </button>
        <h1 style={{ marginBottom: '20px' }}>Evakuerade patienter ({evacuatedPatients.length})</h1>
        
        {evacuatedPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Inga evakuerade patienter</p>
          </div>
        ) : (
          <div>
            {evacuatedPatients.map(patient => (
              <div key={patient.id} style={{
                background: '#111',
                padding: '15px',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#ea580c' }}>
                  {patient.patientNumber} - {patient.name || 'Namn ej angivet'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Evakueringsplats:</strong> {patient.evacuatedLocation || '-'}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Ålder:</strong> {patient.age || '-'}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Skador:</strong> {patient.injuries || '-'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Triagekategori:</strong>{' '}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: getTriageColor(patient.triageCategory),
                    color: '#fff',
                    fontWeight: 'bold'
                  }}>
                    {patient.triageCategory}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEvacuatedPatients(evacuatedPatients.filter(p => p.id !== patient.id))
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Ta bort från lista
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (viewDeceased) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
        <button
          onClick={() => setViewDeceased(false)}
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
          ← Tillbaka
        </button>
        <h1 style={{ marginBottom: '20px' }}>Avlidna patienter ({deceasedPatients.length})</h1>

        {deceasedPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Inga avlidna patienter</p>
          </div>
        ) : (
          <div>
            {deceasedPatients.map(patient => (
              <div
                key={patient.id}
                style={{
                  background: '#111',
                  padding: '15px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#ef4444' }}>
                  {patient.patientNumber} - {patient.name || 'Namn ej angivet'}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Ålder:</strong> {patient.age || '-'}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Skador:</strong> {patient.injuries || '-'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Triagekategori:</strong>{' '}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: getTriageColor(patient.triageCategory),
                    color: '#fff',
                    fontWeight: 'bold'
                  }}>
                    {patient.triageCategory}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setViewDeceased(false)
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
                    onClick={() => {
                      setViewDeceased(false)
                      setViewMode('at-mist')
                      setShowVitals(patient.id)
                      setShowEvacuationModal(true)
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: '#ea580c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Evakuera
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (viewPm) {
    type PmEntry = { type: 'h1' | 'h2' | 'body' | 'bullet' | 'bullet2'; text: string }
    const allEntries = pmGuidelinesRaw as PmEntry[]

    const h1Entries = allEntries.filter(e => e.type === 'h1')
    const slugify = (text: string) => 'pm-' + text.toLowerCase().replace(/[^a-zåäö0-9]+/gi, '-')
    const scrollToSection = (text: string) => {
      const el = document.getElementById(slugify(text))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setPmShowToc(false)
    }

    // When searching: find h1 sections that contain matches and show matching context
    let displayEntries: PmEntry[]
    if (pmSearch.trim().length < 2) {
      displayEntries = allEntries
    } else {
      const q = pmSearch.toLowerCase()
      // Gather sections (h1 blocks)
      const sections: { heading: PmEntry; children: PmEntry[] }[] = []
      let cur: { heading: PmEntry; children: PmEntry[] } | null = null
      for (const e of allEntries) {
        if (e.type === 'h1') {
          if (cur) sections.push(cur)
          cur = { heading: e, children: [] }
        } else if (cur) {
          cur.children.push(e)
        }
      }
      if (cur) sections.push(cur)

      displayEntries = []
      for (const sec of sections) {
        const allText = [sec.heading.text, ...sec.children.map(c => c.text)].join(' ').toLowerCase()
        if (allText.includes(q)) {
          displayEntries.push(sec.heading)
          displayEntries.push(...sec.children)
        }
      }
    }

    const highlight = (text: string) => {
      if (pmSearch.trim().length < 2) return text
      const q = pmSearch.trim()
      const idx = text.toLowerCase().indexOf(q.toLowerCase())
      if (idx === -1) return text
      return (
        <>
          {text.slice(0, idx)}
          <mark style={{ background: '#fbbf24', color: '#000', borderRadius: '2px' }}>{text.slice(idx, idx + q.length)}</mark>
          {text.slice(idx + q.length)}
        </>
      )
    }

    const isBodySectionHeading = (entry: PmEntry, index: number) => {
      if (entry.type !== 'body') return false
      const next = displayEntries[index + 1]
      if (!next || next.type !== 'h2') return false
      const text = entry.text.trim()
      return (
        text.length > 1 &&
        text.length <= 60 &&
        /^[A-ZÅÄÖ]/.test(text) &&
        !text.endsWith('.') &&
        !text.endsWith(':')
      )
    }

    const getMedicineHeading = (entry: PmEntry, index: number): { name: string; rest: string } | null => {
      if (entry.type !== 'body') return null

      const MEDICINE_HEADINGS = [
        'ADRENALIN',
        'AMIODARON',
        'ATARAX',
        'ATROPIN',
        'BETAMETASON',
        'BRICANYL TURBUHALER (TERBUTALIN)',
        'BUDESONID',
        'CEFOTAXIM',
        'DESLORATADIN',
        'ERTAPENEM',
        'FENTANYL',
        'FLUMAZENIL',
        'GLUKOS',
        'HYDROXYKOBALAMIN (CYANOKIT)',
        'IBUPROFEN',
        'IPRATROPIUM',
        'KALCIUM',
        'KETAMIN',
        'LIDOKAIN',
        'MIDAZOLAM',
        'MORFIN',
        'MOXIFLOXACIN',
        'NALOXON',
        'NATRIUMTIOSULFAT',
        'ONDANSETRON',
        'OXYGEN',
        'PARACETAMOL',
        'PULMICORT TURBUHALER (BUDESONID)',
        'RINGER-ACETAT',
        'SALBUTAMOL',
        'TETRAKAIN',
        'TRANEXAMSYRA'
      ]

      const normalizeName = (s: string) => s.toUpperCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()

      let currentH2 = ''
      let currentH1 = ''
      for (let i = index; i >= 0; i--) {
        if (!currentH1 && displayEntries[i].type === 'h1') {
          currentH1 = displayEntries[i].text.toLowerCase()
        }
        if (displayEntries[i].type === 'h2') {
          currentH2 = displayEntries[i].text.toLowerCase()
        }
        if (currentH1 && currentH2) {
          break
        }
      }

      if (!currentH2.includes('läkemedel') && !currentH1.includes('läkemedel')) return null

      const text = entry.text.trim()
      if (!/beredningsform/i.test(text)) return null

      const beredningsIndex = text.toLowerCase().indexOf('beredningsform')
      if (beredningsIndex <= 0) return null

      const before = text.slice(0, beredningsIndex).trim()
      const after = text.slice(beredningsIndex).trim()

      const normalizedBefore = normalizeName(before)
      const matchedName = MEDICINE_HEADINGS
        .slice()
        .sort((a, b) => b.length - a.length)
        .find(name => normalizedBefore.startsWith(normalizeName(name)))

      if (!matchedName) return null

      return { name: matchedName, rest: after }
    }

    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: '#111827', borderBottom: '1px solid #374151', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30 }}>
          <button
            onClick={() => setViewPm(false)}
            style={{ padding: '8px 16px', fontSize: '14px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ← Tillbaka
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#f9c74f' }}>FM Prehospitala behandlingsriktlinjer 2025</div>
          </div>
          <button
            onClick={() => setPmShowToc(v => !v)}
            style={{ padding: '8px 14px', fontSize: '14px', background: pmShowToc ? '#f9c74f' : '#374151', color: pmShowToc ? '#000' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ☰ Innehåll
          </button>
          <input
            type="text"
            placeholder="🔍 Sök i PM..."
            value={pmSearch}
            onChange={e => setPmSearch(e.target.value)}
            style={{
              padding: '8px 14px', fontSize: '15px', background: '#1f2937', color: '#fff',
              border: '1px solid #4b5563', borderRadius: '8px', outline: 'none', width: '210px'
            }}
          />
          {pmSearch && (
            <button onClick={() => setPmSearch('')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          )}
        </div>

        {pmShowToc && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, display: 'flex' }} onClick={() => setPmShowToc(false)}>
            <div style={{ width: '340px', maxWidth: '88vw', background: '#111827', borderRight: '1px solid #374151', overflowY: 'auto', padding: '16px' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#f9c74f', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #374151' }}>
                Innehållsförteckning
              </div>
              {h1Entries.map((e, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSection(e.text)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '7px 8px', borderRadius: '4px', fontSize: '14px', lineHeight: 1.4 }}
                >
                  {e.text}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '86px 20px 16px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          {pmSearch.trim().length >= 2 && displayEntries.length === 0 && (
            <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>Inga träffar för "{pmSearch}"</div>
          )}
          {displayEntries.map((entry, i) => {
            if (entry.type === 'h1') {
              return (
                <h2 key={i} id={slugify(entry.text)} style={{ fontSize: '20px', fontWeight: 700, color: '#f9c74f', marginTop: '32px', marginBottom: '6px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>
                  {highlight(entry.text)}
                </h2>
              )
            }
            if (entry.type === 'h2') {
              return (
                <h3 key={i} style={{ fontSize: '15px', fontWeight: 600, color: '#93c5fd', marginTop: '16px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {highlight(entry.text)}
                </h3>
              )
            }
            const medicineHeading = getMedicineHeading(entry, i)
            if (medicineHeading) {
              return (
                <>
                  <h4 key={`med-name-${i}`} style={{ fontSize: '22px', fontWeight: 800, color: '#F3D021', marginTop: '24px', marginBottom: '6px' }}>
                    {highlight(medicineHeading.name)}
                  </h4>
                  <p key={`med-rest-${i}`} style={{ fontSize: '14px', lineHeight: 1.6, color: '#d1d5db', marginTop: '0', marginBottom: '0' }}>
                    {highlight(medicineHeading.rest)}
                  </p>
                </>
              )
            }
            if (isBodySectionHeading(entry, i)) {
              return (
                <h4 key={i} style={{ fontSize: '18px', fontWeight: 700, color: '#fde68a', marginTop: '22px', marginBottom: '6px', borderLeft: '3px solid #f59e0b', paddingLeft: '10px' }}>
                  {highlight(entry.text)}
                </h4>
              )
            }
            if (entry.type === 'bullet') {
              return (
                <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingLeft: '8px' }}>
                  <span style={{ color: '#f9c74f', flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: '14px', lineHeight: 1.55, color: '#d1d5db' }}>{highlight(entry.text)}</span>
                </div>
              )
            }
            if (entry.type === 'bullet2') {
              return (
                <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '3px', paddingLeft: '24px' }}>
                  <span style={{ color: '#9ca3af', flexShrink: 0 }}>–</span>
                  <span style={{ fontSize: '14px', lineHeight: 1.55, color: '#9ca3af' }}>{highlight(entry.text)}</span>
                </div>
              )
            }
            return (
              <p key={i} style={{ fontSize: '14px', lineHeight: 1.6, color: '#d1d5db', marginTop: '8px', marginBottom: '0' }}>
                {highlight(entry.text)}
              </p>
            )
          })}
          <div style={{ height: '40px' }} />
        </div>
      </div>
    )
  }

  if (showVitals) {
    const patient = patients.find(p => p.id === showVitals) || deceasedPatients.find(p => p.id === showVitals)
    const isDeceasedPatient = deceasedPatients.some(p => p.id === showVitals)
    if (!patient) return null

    // Kombinera historik med nuvarande värden
    const allReadings: VitalReading[] = [
      ...(patient.vitalHistory || []),
      ...(editingPatientId === showVitals && (formData.consciousness || formData.respiration || formData.pulse || formData.bloodPressure || formData.spo2 || formData.temperature) ? [{
        time: 'CURRENT',
        consciousness: formData.consciousness ?? '',
        respiration: formData.respiration ?? '',
        pulse: formData.pulse ?? '',
        bloodPressure: formData.bloodPressure ?? '',
        spo2: formData.spo2 ?? '',
        temperature: formData.temperature ?? ''
      } as VitalReading] : [])
    ]

    const getNumericValue = (str: string | undefined): number => {
      if (!str) return 0
      const match = str.match(/\d+(?:\.\d+)?/)
      return match ? parseFloat(match[0]) : 0
    }

    const createCombinedGraph = (readings: VitalReading[]) => {
      // Filter out readings that have at least one vital parameter
      const data = readings.filter(r => r.pulse || r.respiration || r.spo2 || r.temperature || r.consciousness || r.bloodPressure)
      const hasData = data.length > 0

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
      const gridCount = Math.max(data.length, 10)
      const width = Math.max(gridCount * pointSpacing + padding * 2, 400)  // Grafens totala bredd
      const height = 400  // Håt¶gre graf
      const graphWidth = (gridCount - 1) * pointSpacing  // Faktiska ritområt¥det baserat på¥ antal punkter
      const graphHeight = height - padding * 2
      const gridColor = hasData ? '#444' : '#666'

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
              {Array.from({ length: gridCount }).map((_, i) => {
                const x = padding + (i / Math.max(gridCount - 1, 1)) * graphWidth
                return <line key={`vgrid-${i}`} x1={x} y1={padding} x2={x} y2={height - padding} stroke={gridColor} strokeDasharray="2,2" strokeWidth="0.5" opacity={hasData ? "0.7" : "0.9"} />
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
                      stroke={isMainLine ? '#888' : gridColor}
                      strokeDasharray={isMainLine ? '0' : '2,2'} 
                      strokeWidth={isMainLine ? '2' : '0.5'}
                      opacity={hasData ? "1" : "0.9"}
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
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#888" strokeWidth="2" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#888" strokeWidth="2" />

              {!hasData && (
                <text
                  x={width / 2}
                  y={height / 2}
                  textAnchor="middle"
                  fill="#888"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Inga vitalparametrar registrerade
                </text>
              )}

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
          ← Tillbaka
        </button>

        {viewMode === 'journal' ? (
          <div>
            {!isDeceasedPatient && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={() => {
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
                      triageCategory: patient.triageCategory,
                      signs: patient.signs
                    })
                    setEditingPatientId(patient.id)
                    setShowForm(true)
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#F3D021',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Registrera värde
                </button>
              </div>
            )}
            
            <h3 style={{ marginBottom: '20px', color: '#F3D021' }}>Trend:</h3>
            
            {createCombinedGraph(allReadings)}

            {/* Tabell med exakta värden */}
            <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginTop: '20px', marginBottom: '20px', overflowX: 'auto' }}>
              <h4 style={{ marginBottom: '15px', color: '#F3D021' }}>Exakta värden</h4>
              {allReadings.length > 0 ? (
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
              ) : (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Inga värden registrerade ännu
                </div>
              )}
            </div>

            {/* Åtgärder och Läkemedel */}
            <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '15px', color: '#F3D021' }}>Åtgärder och givna läkemedel</h4>
              {patient.treatment && patient.treatment.trim() ? (
                <div style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'monospace', 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  color: '#fff'
                }}>
                  {patient.treatment.split('\n').map((line, index) => (
                    <div key={index} style={{ 
                      marginBottom: '8px',
                      paddingLeft: line.trim().startsWith('-') || line.trim().startsWith('•') ? '0' : '20px'
                    }}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Inga åtgärder eller läkemedel registrerade ännu
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <h5 style={{ marginBottom: '10px', color: '#F3D021', fontSize: '14px' }}>Prioritetsändringar</h5>
                {patient.triageHistory && patient.triageHistory.length > 0 ? (
                  <div>
                    {patient.triageHistory.map((change, index) => (
                      <div key={`${change.time}-${index}`} style={{ marginBottom: '8px', color: '#fff' }}>
                        <strong>{change.time}:</strong> {change.from || 'Ej satt'} → {change.to || 'Ej satt'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#666' }}>
                    Inga prioriteringsändringar registrerade
                  </div>
                )}
              </div>
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
                    recommendations.treatments.push('  • Applicera tourniquet ovan skadan (minst 2-3 cm proximalt)')
                    recommendations.treatments.push('  • Antibiotika vid öppen skada')
                                      }
                  
                  // Bröstkorgskada
                  if (injuries.includes('thorax') || injuries.includes('bröstkorg') || injuries.includes('bröst')) {
                    recommendations.treatments.push('🫁 BRÖSTKORGSKADA:')
                    
                    // Öppen bröstkorgskada
                    if (injuries.includes('öppen') || injuries.includes('genom')) {
                      recommendations.treatments.push('  • ÖPPEN THORAX: Täck omedelbar med thoraxförband)')
                      recommendations.treatments.push('  • Lyssna efter luftvägsljud - ljud från såret indikerar luftläckage')
                      recommendations.treatments.push('  • Antibiotika vid öppen skada')
                    }
                    
                    // Tecken på spänningsthorax
                    if ((patient.respiration && parseInt(patient.respiration) > 30) || 
                        (patient.spo2 && parseInt(patient.spo2) < 90) ||
                        (patient.pulse && parseInt(patient.pulse) > 120)) {
                      recommendations.treatments.push('  • MISSTANKE OM ÖVERTRYCKSPNEUMOTHORAX:')
                      recommendations.treatments.push('  • Nåldekommpression: 4-5:e ICS, Midazillär linjen')
                      recommendations.treatments.push('  • Följt av thoraxdrän')
                    }
                  }
                  
                  // Bäcken-/abdominalskada
                  if (injuries.includes('abdomen') || injuries.includes('bäcken') || injuries.includes('magiskador')) {
                    recommendations.treatments.push('💥 BUK/BÄCKENSKADA:')
                    
                    if (injuries.includes('bäcken')) {
                      recommendations.treatments.push('  • Applicera bäckengördelför stabilisering')
                                          }
                    
                    recommendations.treatments.push('  • Risk för massiv intra-abdominal blödning')
                    recommendations.treatments.push('  • Om tarmar synliga, täck med fuktat förband')
                    recommendations.treatments.push('  • PRIORITERA EVAKUERING till operationssal')
                    recommendations.treatments.push('  • Antibiotika vid öppen skada')
                  }
                }

                // === 2. AIRWAY MANAGEMENT ===
                if (patient.consciousness) {
                  const consciousness = patient.consciousness.toUpperCase()
                  
                  if (consciousness === 'U') {
                    recommendations.treatments.push('🛡️ AIRWAY - MEDVETSLÖS PATIENT:')
                    recommendations.treatments.push('  • Positionera i stabilt sidoläge')
                    recommendations.treatments.push('  • Säkerställ öppen luftväg - avlägsna främmande föremål')
                    recommendations.treatments.push('  • Överväg NPA (näskantarell)')
                    recommendations.treatments.push('  • Intubering om tränad, möjligt, och lämpligt')
                  } else if (consciousness === 'V' || consciousness === 'P') {
                    recommendations.treatments.push('🛡️ AIRWAY - REDUCERAD MEDVETENHET:')
                    recommendations.treatments.push('  • Övervaka luftväg löpande - risk för försämring')
                    recommendations.treatments.push('  • Ha luftvägsutrustning redo (NPA, OPA, intubering-utrustning)')
                  }
                }

                // === 3. BREATHING ===
                if (patient.respiration) {
                  const respValue = parseInt(patient.respiration)
                  
                  if (respValue > 35) {
                    recommendations.treatments.push('🫁 BREATHING - EXTREMT HÖG ANDNINGSFREKVENS:')
                    recommendations.treatments.push('  • Misstanke på övertryckspneumothorax - se bröstkorgskada ovan')
                    recommendations.treatments.push('  • Eller massiv blödning/chock - se circulation nedan')
                  } else if (respValue > 30) {
                    recommendations.treatments.push('🫁 BREATHING - HÖG ANDNINGSFREKVENS (>30):')
                    recommendations.treatments.push('  • Kan indikera övertryckspneumothorax eller chock')
                    
                  } else if (respValue < 10) {
                    recommendations.treatments.push('🫁 BREATHING - LÅG ANDNINGSFREKVENS (<10) - KRITISKT:')
                    recommendations.treatments.push('  • Manuell ventilation: BVM (Bag-Valve-Mask) 12-20 andetag/min')
                    recommendations.treatments.push('  • Överväg luftvägsintervention')
                  }
                }

                // === 4. CIRCULATION ===
                if (patient.bloodPressure || patient.pulse) {
                  const systolic = patient.bloodPressure ? parseInt(patient.bloodPressure.split('/')[0] || '0') : 0
                  const pulseValue = patient.pulse ? parseInt(patient.pulse) : 0
                  
                  if (systolic < 90 || pulseValue > 120) {
                    recommendations.treatments.push('🩸 CIRCULATION - HYPOVOLEM CHOCK:')
                    recommendations.treatments.push('  • Två IV-infarter')
                    recommendations.treatments.push('  • Vätsketillförsel')
                    recommendations.treatments.push('  • Restriktiv vätskehantering tills kirurgisk kontroll')
                    recommendations.treatments.push('  • Tranexamsyra (TXA): 2g IV inom 3 timmar från trauma')
                    
                    if (systolic < 70) {
                      recommendations.treatments.push('  • KRITISK HYPOTENSION (<70): Minimal vätsketillförsel, PRIORITERA EVAKUERING')
                    }
                  } else if (systolic < 100 || pulseValue > 100) {
                    recommendations.treatments.push('🩸 CIRCULATION - KOMPENSERAD CHOCK:')
                    recommendations.treatments.push('  • En IV-infart, börja vätsketillförsel')
                    recommendations.treatments.push('  • Övervaka blödningskälla')
                     recommendations.treatments.push('  • Tranexamsyra (TXA): 2g IV inom 3 timmar från trauma')
                  }
                  
                  if (pulseValue < 60 && pulseValue > 0) {
                    recommendations.treatments.push('🩸 CIRCULATION - BRADYKARDI:')
                    recommendations.treatments.push('  • Risk för övertryckspneumothorax eller hjärtarytmi')
                    recommendations.treatments.push('  • Kontrollera bröstkorgskada och luftväg')
                  }
                }

                // === 5. HYPOTHERMIA/OTHER ===
                if (patient.temperature) {
                  const tempValue = parseFloat(patient.temperature)
                  
                  if (tempValue < 32) {
                    recommendations.treatments.push('❄️ ALLVARLIG HYPOTERMI (<32°C):')
                    recommendations.treatments.push('  • Långsam passiv värmning - undvik "afterdrop"')
                    recommendations.treatments.push('  • Minimal rörelse - risk för hjärtstillestånd')
                    recommendations.treatments.push('  • ECMO-värming på sjukhus om möjligt')
                  } else if (tempValue < 35) {
                    recommendations.treatments.push('❄️ MODERAT HYPOTERMI (32-35°C):')
                    recommendations.treatments.push('  • Aktiv yttre värmning (värmefilt, värmande vätskor)')
                  } else if (tempValue < 36) {
                    recommendations.treatments.push('❄️ MILD HYPOTERMI (<36°C):')
                    recommendations.treatments.push('  • Passiv värmning - täckning och skydd från miljö')
                  }
                }

                // === STANDARD TCCC-INTERVENTIONER ===
                const systolicForPain = patient.bloodPressure ? parseInt(patient.bloodPressure.split('/')[0] || '0') : 0
                const respForPain = patient.respiration ? parseInt(patient.respiration) : 0
                const spo2ForPain = patient.spo2 ? parseInt(patient.spo2) : 0
                const consciousnessForPain = (patient.consciousness || '').toUpperCase().trim()

                const hasLowBloodPressure = systolicForPain > 0 && systolicForPain < 90
                const hasReducedConsciousness = ['V', 'P', 'U'].includes(consciousnessForPain)
                const hasRespiratoryDistress =
                  (respForPain > 0 && (respForPain < 10 || respForPain > 30)) ||
                  (spo2ForPain > 0 && spo2ForPain < 90)

                const hasAnalgesicContraindication = hasLowBloodPressure || hasReducedConsciousness || hasRespiratoryDistress

                recommendations.treatments.push('')
                recommendations.treatments.push('📋 STANDAR SMÅRTSTILLANDE INTERVENTIONER:')
                recommendations.treatments.push('  • Smärtlindring beroende på nivå av smärta, medvetande och andning')
                recommendations.treatments.push('  • Paracetamol: 1g PO/PR var 6:e timme (max 4g/dygn)')
                if (!hasLowBloodPressure) {
                  recommendations.treatments.push('  • Ibuprofen: 400 mg PO var 6-8 timme (max 1200 mg/dygn)')
                }

                if (hasAnalgesicContraindication) {
                  recommendations.treatments.push('  • ⚠️ Undvik opioid/sederande analgesi vid nuvarande vitalparametrar (lågt BT, medvetandesänkning eller andningspåverkan).')
                  recommendations.treatments.push('  • Reassess efter stabilisering av cirkulation/andning innan opioid övervägs.')
                } else {
                  recommendations.treatments.push('  • Fentanylklubba 800mcg kan upprepas en gång efter 15 min')
                  recommendations.treatments.push('  • Morfin 0,05-0,1 mg/kg IV/IM var 4-6 timme vid svår smärta (max 10 mg/dos)')
                }
                recommendations.treatments.push('  • Ketamin: 0,1–0,3 mg/kg IV, 0,5 mg/kg IM (kan ges vid lågt BT, medvetandesänkning och andningsbesvär)')
                
                return (
                  <div>
                    <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '4px', marginBottom: '15px', borderLeft: '4px solid #F3D021' }}>
                      <strong style={{ color: '#F3D021' }}>TCCC PROTOKOLL - TACTICAL COMBAT CASUALTY CARE</strong>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
                        Följer FM:s Prehospitala behandlingsriktlinjer (2025)
                      </div>
                    </div>
                    <div style={{ background: '#000', padding: '15px', borderRadius: '4px' }}>
                      <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
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

                          const medMatch = treatment.match(/^\s*•\s*(Paracetamol|Ibuprofen|Fentanylklubba|Morfin|Esketamin|Ketamin):\s*(.*)$/i)
                          if (medMatch) {
                            return (
                              <li key={i} style={{ marginBottom: '8px', fontSize: '13px', color: '#fff' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 'bold', marginRight: '6px' }}>•</span>
                                <span style={{ color: '#fde68a', fontWeight: 700 }}>{medMatch[1]}:</span>{' '}
                                <span style={{ color: '#fff' }}>{medMatch[2]}</span>
                              </li>
                            )
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
            <h3 style={{ marginBottom: '15px', color: '#fff', marginTop: '30px' }}>AT-MIST</h3>
            <button 
              onClick={() => {
                setShowEvacuationModal(true)
              }}
              style={{
                padding: '10px 20px',
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}
            >
              Evakuering
            </button>
                
                {/* Samlad journal */}
                <div style={{ 
              background: '#fff', 
              color: '#000',
              padding: '20px', 
              marginBottom: '20px', 
              borderRadius: '8px',
              border: '2px solid #d1d5db'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Patientnummer:</strong> {patient.patientNumber}</div>
                <div><strong>Enhet:</strong> {patient.unit || '-'}</div>
                <div><strong>Namn:</strong> {patient.name || '-'}</div>
                <div><strong>Triagekategori:</strong> {patient.triageCategory || '-'}</div>
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #d1d5db' }}>
                  <strong style={{ color: '#000' }}>A - Age (Ålder):</strong> {patient.age || '-'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#000' }}>T - Time (Tidsnummer):</strong> {patient.timeOfInjury || '-'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#000' }}>M - Mechanism (Skademekanism):</strong> {patient.mechanism || '-'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: '#000' }}>I - Injuries (Skador):</strong> {patient.injuries || '-'}
                </div>
              </div>
              <div style={{ marginTop: '15px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#000' }}>S - Signs (Vitala parametrar):</strong>
                <div style={{ 
                  background: '#fff', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db'
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
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#000' }}>T - Treatment (Behandling):</strong>
                  <div style={{ 
                    background: '#fff', 
                    padding: '10px', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    border: '1px solid #d1d5db'
                  }}>
                    {patient.treatment}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {showEvacuationModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#111',
              padding: '30px',
              borderRadius: '8px',
              border: '2px solid #ea580c',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '20px', color: '#ea580c' }}>Evakuera patient</h2>
              <p style={{ marginBottom: '15px', color: '#aaa' }}>
                Patient: <strong>{patient.patientNumber || '-'}</strong>
              </p>
              <label style={{ display: 'block', marginBottom: '10px', color: '#fff' }}>
                Evakueringsplats:
              </label>
              <input
                type="text"
                value={evacuationLocation}
                onChange={(e) => setEvacuationLocation(e.target.value)}
                placeholder="Ange evakueringsplats (t.ex. Sjukhus/Evakueringspunkt)"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '20px',
                  background: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setEvacuatedPatients([...evacuatedPatients, { ...patient, evacuatedLocation: evacuationLocation }])
                    setPatients(patients.filter(p => p.id !== patient.id))
                    setDeceasedPatients(deceasedPatients.filter(p => p.id !== patient.id))
                    setShowVitals(null)
                    setShowEvacuationModal(false)
                    setEvacuationLocation('')
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Evakuera
                </button>
                <button
                  onClick={() => {
                    setShowEvacuationModal(false)
                    setEvacuationLocation('')
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box',
      width: '100%',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>DOX - Patientregistrering</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 }}>
          <span style={{ color: '#aaa', whiteSpace: 'nowrap' }}>Inloggad som: <strong style={{ color: '#F3D021' }}>{currentUser}</strong></span>
          {currentUser === 'test' && (
            <button 
              onClick={() => {
                if (window.confirm('Är du säker på att du vill rensa ALLA patienter, avlidna och evakuerade? Detta går inte att ångra!')) {
                  setPatients([])
                  setEvacuatedPatients([])
                  setDeceasedPatients([])
                  localStorage.removeItem('patients_test')
                  localStorage.removeItem('evacuated_test')
                  localStorage.removeItem('deceased_test')
                }
              }}
              style={{
                padding: '10px 20px',
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              RENSA
            </button>
          )}
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Logga ut
          </button>
        </div>
      </div>
      <p style={{ marginBottom: '20px' }}>{patients.length} patienter registrerade</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
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
            fontWeight: 'bold'
          }}
        >
          + Registrera ny patient
        </button>

        <button 
          onClick={() => setViewEvacuated(true)}
          style={{
            padding: '20px 40px',
            fontSize: '18px',
            background: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Evakuerade ({evacuatedPatients.length})
        </button>

        <button 
          onClick={() => setViewDeceased(true)}
          style={{
            padding: '20px 40px',
            fontSize: '18px',
            background: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Avlidna ({deceasedPatients.length})
        </button>

        <button
          onClick={() => setViewPm(true)}
          style={{
            padding: '20px 40px',
            fontSize: '18px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          PM
        </button>
      </div>

      {patients.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '15px' }}>Registrerade patienter</h2>
          {patients.map(patient => (
            <div 
              key={patient.id} 
              style={{ 
              background: '#111', 
              padding: '15px', 
              marginBottom: '15px', 
              borderRadius: '8px',
              border: '1px solid #333'
            }}
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
                <strong>Skador:</strong> {patient.injuries}
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











