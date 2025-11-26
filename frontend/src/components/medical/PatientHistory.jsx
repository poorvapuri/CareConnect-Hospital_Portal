import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

export const PatientHistory = ({ patientId }) => {
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientHistory();
  }, [patientId]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch all patient data
      const [appointmentsData, prescriptionsData, labReportsData] = await Promise.all([
        apiService.getAppointments({ patientId }),
        apiService.getPrescriptions({ patientId }),
        apiService.getLabTests({ patientId })
      ]);
      
      setAppointments(appointmentsData);
      setPrescriptions(prescriptionsData);
      setLabReports(labReportsData);
      
      // Mock patient data (in real app, this would come from API)
      setPatientData({
        id: patientId,
        name: 'Patient Name',
        age: 35,
        gender: 'Male',
        bloodGroup: 'O+',
        contactNumber: '1234567890',
        email: 'patient@example.com',
        address: '123 Main St, City',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        emergencyContact: '9876543210'
      });
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patient history...</div>;
  }

  return (
    <div className="patient-history-container">
      <div className="patient-header">
        <div className="patient-avatar">
          {patientData?.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="patient-info">
          <h2>{patientData?.name}</h2>
          <div className="patient-meta">
            <span>Age: {patientData?.age}</span>
            <span>Gender: {patientData?.gender}</span>
            <span>Blood Group: {patientData?.bloodGroup}</span>
            <span>Contact: {patientData?.contactNumber}</span>
          </div>
        </div>
      </div>

      <div className="history-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments ({appointments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions ({prescriptions.length})
        </button>
        <button 
          className={`tab ${activeTab === 'lab-reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('lab-reports')}
        >
          Lab Reports ({labReports.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="info-card">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{patientData?.email}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{patientData?.address}</span>
                </div>
                <div className="info-item">
                  <label>Emergency Contact:</label>
                  <span>{patientData?.emergencyContact}</span>
                </div>
              </div>
            </div>
            
            <div className="info-card">
              <h3>Medical Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Medical History:</label>
                  <span>{patientData?.medicalHistory}</span>
                </div>
                <div className="info-item">
                  <label>Allergies:</label>
                  <span>{patientData?.allergies}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <h3>Appointment History</h3>
            <div className="history-list">
              {appointments.map(apt => (
                <div key={apt.id} className="history-item">
                  <div className="item-date">
                    <span className="date">{new Date(apt.date).toLocaleDateString()}</span>
                    <span className="time">{apt.time}</span>
                  </div>
                  <div className="item-details">
                    <h4>Dr. {apt.doctor_name}</h4>
                    <p>Status: <span className={`status ${apt.status}`}>{apt.status}</span></p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="no-data">No appointment history</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="prescriptions-section">
            <h3>Prescription History</h3>
            <div className="prescription-list">
              {prescriptions.map(pres => (
                <div key={pres.id} className="prescription-item">
                  <div className="pres-header">
                    <span className="pres-date">
                      {new Date(pres.date).toLocaleDateString()}
                    </span>
                    <span className="pres-doctor">Dr. {pres.doctor_name}</span>
                  </div>
                  <div className="pres-details">
                    <h4>{pres.medication}</h4>
                    <p><strong>Dosage:</strong> {pres.dosage}</p>
                    <p><strong>Instructions:</strong> {pres.instructions}</p>
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <p className="no-data">No prescription history</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lab-reports' && (
          <div className="lab-reports-section">
            <h3>Lab Report History</h3>
            <div className="reports-list">
              {labReports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="report-header">
                    <h4>{report.test_name}</h4>
                    <span className="report-date">
                      {new Date(report.date + "T00:00:00").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="report-status">
                    <span className={`status ${report.status}`}>{report.status}</span>
                    {report.report_url && (
                      <a 
                        href={report.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-small"
                      >
                        View Report
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {labReports.length === 0 && (
                <p className="no-data">No lab reports</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};