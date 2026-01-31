import { Patient } from '../types'
import './PatientList.css'

interface Props {
  patients: Patient[]
  onEdit: (patient: Patient) => void
  onDelete: (id: string) => void
}

export function PatientList({ patients, onEdit, onDelete }: Props) {
  if (patients.length === 0) {
    return (
      <div className="empty-state">
        <p>Inga patienter registrerade</p>
        <p className="empty-subtitle">Klicka på knappen ovan för att registrera din första patient</p>
      </div>
    )
  }

  return (
    <div className="patient-list">
      <h2>Registrerade patienter</h2>
      {patients.map(patient => (
        <div key={patient.id} className="patient-card">
          <div className="patient-header">
            <div className="patient-main-info">
              <span className="patient-number">{patient.patientNumber}</span>
              <span className={`triage-badge triage-${patient.triageCategory.toLowerCase()}`}>
                {patient.triageCategory}
              </span>
            </div>
            {patient.name && <div className="patient-name">{patient.name}</div>}
          </div>

          <div className="patient-details">
            <div className="detail-row">
              <span className="detail-label">Ålder:</span>
              <span>{patient.age}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Plats:</span>
              <span>{patient.location}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Skador:</span>
              <span className="detail-text">{patient.injuries}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Behandling:</span>
              <span className="detail-text">{patient.treatment}</span>
            </div>
          </div>

          <div className="patient-actions">
            <button 
              className="btn-primary btn-small btn-secondary"
              onClick={() => onEdit(patient)}
            >
              Visa/Redigera
            </button>
            <button 
              className="btn-primary btn-small btn-danger"
              onClick={() => onDelete(patient.id)}
            >
              Ta bort
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
