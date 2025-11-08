import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const CheckInManagement = () => {
  const { showMessage, openModal, refresh } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, refresh]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAppointments({ date: selectedDate });
      setAppointments(data);
    } catch (error) {
      showMessage('error', 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, newStatus);
      showMessage('success', `Status updated to ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      showMessage('error', 'Failed to update status');
    }
  };

  const viewPatientDetails = (patient) => {
    openModal('Patient Details', (
      <div className="patient-details-modal">
        <div className="detail-group">
          <label>Name:</label>
          <p>{patient.patient_name}</p>
        </div>
        <div className="detail-group">
          <label>Contact:</label>
          <p>{patient.contact || 'Not available'}</p>
        </div>
        <div className="detail-group">
          <label>Appointment Time:</label>
          <p>{patient.time}</p>
        </div>
        <div className="detail-group">
          <label>Doctor:</label>
          <p>Dr. {patient.doctor_name}</p>
        </div>
        <div className="detail-group">
          <label>Current Status:</label>
          <p className={`status ${patient.status}`}>{patient.status}</p>
        </div>
      </div>
    ));
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAppointments = {
    scheduled: filteredAppointments.filter(apt => apt.status === 'Scheduled'),
    checkedIn: filteredAppointments.filter(apt => apt.status === 'Checked-In'),
    consulted: filteredAppointments.filter(apt => apt.status === 'Consulted'),
    completed: filteredAppointments.filter(apt => apt.status === 'Completed')
  };

  return (
    <div className="section">
      <h2>Patient Check-in Management</h2>
      
      <div className="checkin-controls">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
        
        <input
          type="text"
          placeholder="Search patient or doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <button onClick={fetchAppointments} className="btn-secondary">
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="checkin-board">
          <div className="status-column">
            <h3 className="column-header scheduled">
              Scheduled ({groupedAppointments.scheduled.length})
            </h3>
            <div className="appointment-cards">
              {groupedAppointments.scheduled.map(apt => (
                <div key={apt.id} className="appointment-card">
                  <div className="card-header">
                    <span className="time">{apt.time}</span>
                    <span className="appointment-id">#{apt.id?.slice(-6)}</span>
                  </div>
                  <h4>{apt.patient_name}</h4>
                  <p>Dr. {apt.doctor_name}</p>
                  <div className="card-actions">
                    <button
                      onClick={() => updateStatus(apt.id, 'Checked-In')}
                      className="btn-primary btn-small"
                    >
                      Check In
                    </button>
                    <button
                      onClick={() => viewPatientDetails(apt)}
                      className="btn-secondary btn-small"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="status-column">
            <h3 className="column-header checked-in">
              Checked In ({groupedAppointments.checkedIn.length})
            </h3>
            <div className="appointment-cards">
              {groupedAppointments.checkedIn.map(apt => (
                <div key={apt.id} className="appointment-card">
                  <div className="card-header">
                    <span className="time">{apt.time}</span>
                    <span className="waiting-time">⏱️ 15 min</span>
                  </div>
                  <h4>{apt.patient_name}</h4>
                  <p>Dr. {apt.doctor_name}</p>
                  <div className="card-actions">
                    <button
                      onClick={() => updateStatus(apt.id, 'Consulted')}
                      className="btn-primary btn-small"
                    >
                      Send to Doctor
                    </button>
                    <button
                      onClick={() => viewPatientDetails(apt)}
                      className="btn-secondary btn-small"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="status-column">
            <h3 className="column-header consulted">
              In Consultation ({groupedAppointments.consulted.length})
            </h3>
            <div className="appointment-cards">
              {groupedAppointments.consulted.map(apt => (
                <div key={apt.id} className="appointment-card">
                  <div className="card-header">
                    <span className="time">{apt.time}</span>
                    <span className="in-progress">🔴 In Progress</span>
                  </div>
                  <h4>{apt.patient_name}</h4>
                  <p>Dr. {apt.doctor_name}</p>
                  <div className="card-actions">
                    <button
                      onClick={() => updateStatus(apt.id, 'Completed')}
                      className="btn-success btn-small"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => viewPatientDetails(apt)}
                      className="btn-secondary btn-small"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="status-column">
            <h3 className="column-header completed">
              Completed ({groupedAppointments.completed.length})
            </h3>
            <div className="appointment-cards">
              {groupedAppointments.completed.map(apt => (
                <div key={apt.id} className="appointment-card completed">
                  <div className="card-header">
                    <span className="time">{apt.time}</span>
                    <span className="completed-check">✅</span>
                  </div>
                  <h4>{apt.patient_name}</h4>
                  <p>Dr. {apt.doctor_name}</p>
                  <button
                    onClick={() => viewPatientDetails(apt)}
                    className="btn-secondary btn-small full-width"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};