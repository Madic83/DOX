import { useState, useEffect } from 'react'
import { Patient } from '../types'
import './PatientForm.css'

interface Props {
  patient: Patient | null
  onSave: (patient: Patient) => void
  onCancel: () => void
}

export function PatientForm({ patient, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<Patient>({
    id: patient?.id || '',
    patientNumber: patient?.patientNumber || '',
    dateTime: patient?.dateTime || new Date().toISOString().slice(0, 16),
    age: patient?.age || '',
    timeOfInjury: patient?.timeOfInjury || '',
    mechanism: patient?.mechanism || '',
    injuries: patient?.injuries || '',
    signs: patient?.signs || '',
    treatment: patient?.treatment || '',
    name: patient?.name || '',
    rank: patient?.rank || '',
    ssn: patient?.ssn || '',
    unit: patient?.unit || '',
    location: patient?.location || '',
    bloodPressure: patient?.bloodPressure || '',
    pulse: patient?.pulse || '',
    respiration: patient?.respiration || '',
    temperature: patient?.temperature || '',
    triageCategory: patient?.triageCategory || '',
    notes: patient?.notes || ''
  })

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{patient ? 'Uppdatera patient' : 'Ny patient'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="patient-form">
        {/* Grundläggande info */}
        <section className="form-section">
          <h3>Grundläggande information</h3>
          
          <div className="form-group">
            <label>Patientnummer *</label>
            <input
              type="text"
              value={formData.patientNumber}
              onChange={e => handleChange('patientNumber', e.target.value)}
              placeholder="t.ex. A-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Datum/tid</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={e => handleChange('dateTime', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Namn</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Efternamn, Förnamn"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Grad</label>
              <input
                type="text"
                value={formData.rank}
                onChange={e => handleChange('rank', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Personnummer</label>
              <input
                type="text"
                value={formData.ssn}
                onChange={e => handleChange('ssn', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Enhet *</label>
            <input
              type="text"
              value={formData.unit}
              onChange={e => handleChange('unit', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Plats påträffad *</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="Koordinater eller beskrivning"
              required
            />
          </div>
        </section>

        {/* AT-MIST */}
        <section className="form-section">
          <h3>AT-MIST</h3>

          <div className="form-group">
            <label>Age (Ålder) *</label>
            <input
              type="text"
              value={formData.age}
              onChange={e => handleChange('age', e.target.value)}
              placeholder="t.ex. 25 år"
              required
            />
          </div>

          <div className="form-group">
            <label>Time (Tidpunkt för skada) *</label>
            <input
              type="text"
              value={formData.timeOfInjury}
              onChange={e => handleChange('timeOfInjury', e.target.value)}
              placeholder="t.ex. 14:30"
              required
            />
          </div>

          <div className="form-group">
            <label>Mechanism (Skademekanism) *</label>
            <textarea
              value={formData.mechanism}
              onChange={e => handleChange('mechanism', e.target.value)}
              placeholder="t.ex. Splitter från granat, GSW, brand..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Injuries (Skador) *</label>
            <textarea
              value={formData.injuries}
              onChange={e => handleChange('injuries', e.target.value)}
              placeholder="Beskriv alla skador..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Signs (Tecken & vitala parametrar) *</label>
            <textarea
              value={formData.signs}
              onChange={e => handleChange('signs', e.target.value)}
              placeholder="Medvetandegrad, andning, cirkulation..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Treatment (Behandling given) *</label>
            <textarea
              value={formData.treatment}
              onChange={e => handleChange('treatment', e.target.value)}
              placeholder="TQ, luftväg, infart, läkemedel..."
              rows={4}
              required
            />
          </div>
        </section>

        {/* Vitala tecken */}
        <section className="form-section">
          <h3>Vitala tecken</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Blodtryck</label>
              <input
                type="text"
                value={formData.bloodPressure}
                onChange={e => handleChange('bloodPressure', e.target.value)}
                placeholder="120/80"
              />
            </div>
            <div className="form-group">
              <label>Puls</label>
              <input
                type="text"
                value={formData.pulse}
                onChange={e => handleChange('pulse', e.target.value)}
                placeholder="80"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Andning</label>
              <input
                type="text"
                value={formData.respiration}
                onChange={e => handleChange('respiration', e.target.value)}
                placeholder="16"
              />
            </div>
            <div className="form-group">
              <label>Temp (°C)</label>
              <input
                type="text"
                value={formData.temperature}
                onChange={e => handleChange('temperature', e.target.value)}
                placeholder="37.0"
              />
            </div>
          </div>
        </section>

        {/* Triage */}
        <section className="form-section">
          <h3>Triage-kategori *</h3>
          <div className="triage-buttons">
            {(['P1', 'P2', 'P3', 'P4'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                className={`triage-btn triage-${cat.toLowerCase()} ${formData.triageCategory === cat ? 'active' : ''}`}
                onClick={() => handleChange('triageCategory', cat)}
              >
                {cat}
                <span className="triage-label">
                  {cat === 'P1' && 'Omedelbar'}
                  {cat === 'P2' && 'Brådskande'}
                  {cat === 'P3' && 'Fördröjd'}
                  {cat === 'P4' && 'Avliden'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Anteckningar */}
        <section className="form-section">
          <h3>Övriga anteckningar</h3>
          <div className="form-group">
            <textarea
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Ytterligare information..."
              rows={4}
            />
          </div>
        </section>

        {/* Knappar */}
        <div className="form-actions">
          <button type="submit" className="btn-primary btn-large">
            {patient ? 'Spara ändringar' : 'Registrera patient'}
          </button>
          <button type="button" className="btn-primary btn-secondary" onClick={onCancel}>
            Avbryt
          </button>
        </div>
      </form>
    </div>
  )
}
