// frontend/src/components/dashboard/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const DoctorDashboard = () => {
  const { view, setView, currentUser, showMessage, refresh, openModal, closeModal, triggerRefresh } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [monthAppointments, setMonthAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchMonthAppointments();
  }, [selectedDate, refresh]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const apts = await apiService.getAppointments({ 
        doctorId: currentUser.id,
        date: dateStr 
      });
      setAppointments(apts || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthAppointments = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const apts = await apiService.getAppointments({ 
        doctorId: currentUser.id,
        startDate,
        endDate
      });
      setMonthAppointments(apts || []);
    } catch (error) {
      console.error('Error fetching month appointments:', error);
    }
  };

  // Calendar Component
  const CalendarView = () => {
    const getDaysInMonth = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for days before month starts
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
      
      return days;
    };

    const days = getDaysInMonth();

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button 
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
            className="calendar-nav"
          >
            ←
          </button>
          
          <h3>
            {selectedDate.toLocaleDateString('default', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          <button 
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
            className="calendar-nav"
          >
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="calendar-day empty"></div>;
            }

            const dayStr = day.toISOString().split('T')[0];
            const dayAppointments = monthAppointments.filter(a => a.date === dayStr);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="day-number">{day.getDate()}</span>
                {dayAppointments.length > 0 && (
                  <span className="appointment-count">{dayAppointments.length}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="selected-day-details">
          <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
          {appointments.length === 0 ? (
            <p className="no-appointments">No appointments scheduled</p>
          ) : (
            <div className="day-appointments">
              {appointments.sort((a, b) => a.time.localeCompare(b.time)).map(apt => (
                <div key={apt.id} className="appointment-slot">
                  <div className="slot-time">{apt.time}</div>
                  <div className="slot-patient">
                    <h4>{apt.patient_name}</h4>
                    <p>{apt.reason || 'General Consultation'}</p>
                    <span className={`status ${apt.status}`}>{apt.status}</span>
                  </div>
                  <div className="slot-actions">
                    <button 
                      onClick={() => openModal('Patient Details', 
                        <PatientDetails patient={apt} />
                      )}
                      className="btn-secondary btn-small"
                    >
                      View Patient
                    </button>
                    <button 
                      onClick={() => openModal('Create Prescription', 
                        <CreatePrescription appointment={apt} />
                      )}
                      className="btn-primary btn-small"
                    >
                      Prescribe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Patient Details View
  const PatientDetails = ({ patient }) => {
    const [patientHistory, setPatientHistory] = useState({
      appointments: [],
      prescriptions: [],
      labReports: []
    });

    useEffect(() => {
      fetchPatientHistory();
    }, []);

    const fetchPatientHistory = async () => {
      try {
        const [apts, pres, labs] = await Promise.all([
          apiService.getAppointments({ patientId: patient.patient_id }),
          apiService.getPrescriptions({ patientId: patient.patient_id }),
          apiService.getLabTests({ patientId: patient.patient_id })
        ]);
        setPatientHistory({
          appointments: apts || [],
          prescriptions: pres || [],
          labReports: labs || []
        });
      } catch (error) {
        console.error('Error fetching patient history:', error);
      }
    };

    return (
      <div className="patient-details">
        <h3>{patient.patient_name}</h3>
        
        <div className="detail-tabs">
          <div className="tab-content">
            <h4>Medical History</h4>
            <div className="history-section">
              <h5>Previous Appointments ({patientHistory.appointments.length})</h5>
              {patientHistory.appointments.slice(0, 5).map(apt => (
                <div key={apt.id} className="history-item">
                  <span>{new Date(apt.date).toLocaleDateString()}</span>
                  <span>{apt.reason || 'Consultation'}</span>
                </div>
              ))}
            </div>

            <div className="history-section">
              <h5>Lab Reports ({patientHistory.labReports.length})</h5>
              {patientHistory.labReports.map(report => (
                <div key={report.id} className="history-item">
                  <span>{report.test_name}</span>
                  <span>{new Date(report.date).toLocaleDateString()}</span>
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
              ))}
            </div>

            <div className="history-section">
              <h5>Previous Prescriptions ({patientHistory.prescriptions.length})</h5>
              {patientHistory.prescriptions.slice(0, 5).map(pres => (
                <div key={pres.id} className="history-item">
                  <span>{pres.medication}</span>
                  <span>{pres.dosage}</span>
                  <span>{new Date(pres.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Create/Update Prescription
  const CreatePrescription = ({ appointment, existing = null }) => {
    const [prescription, setPrescription] = useState({
      medication: existing?.medication || '',
      dosage: existing?.dosage || '',
      duration: existing?.duration || '',
      instructions: existing?.instructions || '',
      requiresLabTest: existing?.lab_test_required || false,
      labTestName: existing?.lab_test_name || '',
      labTestInstructions: existing?.lab_test_instructions || ''
    });

    const handleSave = async () => {
      try {
        const data = {
          patientId: appointment.patient_id,
          appointmentId: appointment.id,
          ...prescription
        };

        if (existing) {
          await apiService.updatePrescription(existing.id, data);
          showMessage('success', 'Prescription updated');
        } else {
          await apiService.createPrescription(data);
          showMessage('success', 'Prescription created');
        }

        // If lab test is required, create a request for receptionist
        if (prescription.requiresLabTest) {
          await apiService.createLabTestRequest({
            patientId: appointment.patient_id,
            doctorId: currentUser.id,
            testName: prescription.labTestName,
            instructions: prescription.labTestInstructions
          });
          showMessage('info', 'Lab test request sent to reception for pricing');
        }

        closeModal();
        triggerRefresh();
      } catch (error) {
        showMessage('error', 'Failed to save prescription');
      }
    };

    return (
      <div className="prescription-form">
        <h3>{existing ? 'Update' : 'Create'} Prescription</h3>
        
        <div className="form-group">
          <label>Medication:</label>
          <input
            type="text"
            value={prescription.medication}
            onChange={(e) => setPrescription({...prescription, medication: e.target.value})}
            placeholder="e.g., Paracetamol"
          />
        </div>

        <div className="form-group">
          <label>Dosage:</label>
          <input
            type="text"
            value={prescription.dosage}
            onChange={(e) => setPrescription({...prescription, dosage: e.target.value})}
            placeholder="e.g., 500mg twice daily"
          />
        </div>

        <div className="form-group">
          <label>Duration:</label>
          <input
            type="text"
            value={prescription.duration}
            onChange={(e) => setPrescription({...prescription, duration: e.target.value})}
            placeholder="e.g., 7 days"
          />
        </div>

        <div className="form-group">
          <label>Instructions:</label>
          <textarea
            value={prescription.instructions}
            onChange={(e) => setPrescription({...prescription, instructions: e.target.value})}
            placeholder="Special instructions for the patient"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={prescription.requiresLabTest}
              onChange={(e) => setPrescription({...prescription, requiresLabTest: e.target.checked})}
            />
            Requires Lab Test
          </label>
        </div>

        {prescription.requiresLabTest && (
          <>
            <div className="form-group">
              <label>Lab Test Name:</label>
              <input
                type="text"
                value={prescription.labTestName}
                onChange={(e) => setPrescription({...prescription, labTestName: e.target.value})}
                placeholder="e.g., Complete Blood Count"
              />
            </div>

            <div className="form-group">
              <label>Lab Test Instructions:</label>
              <textarea
                value={prescription.labTestInstructions}
                onChange={(e) => setPrescription({...prescription, labTestInstructions: e.target.value})}
                placeholder="Special instructions for lab technician"
                rows="2"
              />
            </div>

            <div className="lab-test-note">
              ℹ️ The receptionist will add the pricing for this lab test
            </div>
          </>
        )}

        <div className="form-actions">
          <button onClick={handleSave} className="btn-primary">
            {existing ? 'Update' : 'Create'} Prescription
          </button>
          <button onClick={closeModal} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Prescription Management View
  const PrescriptionManagement = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [filter, setFilter] = useState('today');

    useEffect(() => {
      fetchPrescriptions();
    }, [filter]);

    const fetchPrescriptions = async () => {
      try {
        let dateFilter = {};
        if (filter === 'today') {
          dateFilter.date = new Date().toISOString().split('T')[0];
        } else if (filter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter.startDate = weekAgo.toISOString().split('T')[0];
          dateFilter.endDate = new Date().toISOString().split('T')[0];
        }

        const pres = await apiService.getPrescriptions({
          doctorId: currentUser.id,
          ...dateFilter
        });
        setPrescriptions(pres || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };

    const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this prescription?')) {
        try {
          await apiService.deletePrescription(id);
          showMessage('success', 'Prescription deleted');
          fetchPrescriptions();
        } catch (error) {
          showMessage('error', 'Failed to delete prescription');
        }
      }
    };

    return (
      <div className="prescription-management">
        <div className="filter-bar">
          <button 
            className={filter === 'today' ? 'active' : ''}
            onClick={() => setFilter('today')}
          >
            Today
          </button>
          <button 
            className={filter === 'week' ? 'active' : ''}
            onClick={() => setFilter('week')}
          >
            This Week
          </button>
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>

        <div className="prescriptions-list">
          {prescriptions.map(pres => (
            <div key={pres.id} className="prescription-item">
              <div className="prescription-header">
                <h4>{pres.patient_name}</h4>
                <span className="date">{new Date(pres.date).toLocaleDateString()}</span>
              </div>
              <div className="prescription-content">
                <p><strong>Medication:</strong> {pres.medication}</p>
                <p><strong>Dosage:</strong> {pres.dosage}</p>
                <p><strong>Duration:</strong> {pres.duration}</p>
                <p><strong>Instructions:</strong> {pres.instructions}</p>
                {pres.lab_test_required && (
                  <p className="lab-test-indicator">
                    🔬 Lab Test: {pres.lab_test_name}
                  </p>
                )}
              </div>
              <div className="prescription-actions">
                <button 
                  onClick={() => openModal('Update Prescription',
                    <CreatePrescription 
                      appointment={{patient_id: pres.patient_id, id: pres.appointment_id}}
                      existing={pres}
                    />
                  )}
                  className="btn-secondary btn-small"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(pres.id)}
                  className="btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main Views
  if (view === 'calendar') {
    return (
      <div className="section">
        <h2>Appointment Calendar</h2>
        <CalendarView />
      </div>
    );
  }

  if (view === 'prescriptions') {
    return (
      <div className="section">
        <h2>Prescription Management</h2>
        <PrescriptionManagement />
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="section">
      <h2>Doctor Dashboard</h2>
      
      <div className="stats-grid">
        <div 
          className="stat-card clickable"
          onClick={() => setView('calendar')}
        >
          <div className="stat-icon">📅</div>
          <h3>Today's Appointments</h3>
          <p className="stat-number">{appointments.length}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <h3>Completed Today</h3>
          <p className="stat-number">
            {appointments.filter(a => a.status === 'Completed').length}
          </p>
        </div>
        
        <div 
          className="stat-card clickable"
          onClick={() => setView('prescriptions')}
        >
          <div className="stat-icon">💊</div>
          <h3>Prescriptions Today</h3>
          <p className="stat-number">
            {appointments.filter(a => a.status === 'Completed').length}
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <h3>Lab Tests Ordered</h3>
          <p className="stat-number">3</p>
        </div>
      </div>

      <div className="today-schedule">
        <h3>Today's Schedule - {new Date().toLocaleDateString()}</h3>
        {appointments.length === 0 ? (
          <p className="no-appointments">No appointments scheduled for today</p>
        ) : (
          <div className="schedule-list">
            {appointments.sort((a, b) => a.time.localeCompare(b.time)).map(apt => (
              <div key={apt.id} className="schedule-item">
                <div className="time">{apt.time}</div>
                <div className="patient-info">
                  <h4>{apt.patient_name}</h4>
                  <p>{apt.reason || 'General Consultation'}</p>
                </div>
                <div className="item-status">
                  <span className={`status ${apt.status}`}>{apt.status}</span>
                </div>
                <div className="item-actions">
                  <button 
                    onClick={() => setView('calendar')}
                    className="btn-primary btn-small"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button 
            onClick={() => setView('calendar')}
            className="action-btn"
          >
            View Calendar
          </button>
          <button 
            onClick={() => setView('prescriptions')}
            className="action-btn"
          >
            Manage Prescriptions
          </button>
        </div>
      </div>
    </div>
  );
};