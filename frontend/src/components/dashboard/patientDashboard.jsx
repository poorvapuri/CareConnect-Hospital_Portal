// frontend/src/components/dashboard/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const PatientDashboard = () => {
  const { view, setView, currentUser, showMessage, refresh, openModal, closeModal, triggerRefresh } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchAllData();
  }, [refresh, view]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes, labReportsRes, prescriptionsRes] = await Promise.all([
        apiService.getAppointments({ patientId: currentUser.id }),
        apiService.getDoctors(),
        apiService.getLabTests({ patientId: currentUser.id }),
        apiService.getPrescriptions({ patientId: currentUser.id })
      ]);

      setAppointments(appointmentsRes || []);
      setDoctors(doctorsRes || []);
      setLabReports(labReportsRes || []);
      setPrescriptions(prescriptionsRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE Appointment
  const BookAppointment = () => {
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
      if (selectedDoctor && selectedDate) {
        fetchAvailableSlots();
      }
    }, [selectedDoctor, selectedDate]);

    const fetchAvailableSlots = async () => {
      try {
        const slots = await apiService.getAvailableSlots(selectedDoctor, selectedDate);
        setAvailableSlots(slots);
      } catch (error) {
        setAvailableSlots(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
      }
    };

    const handleBooking = async () => {
      try {
        await apiService.createAppointment({
          patientId: currentUser.id,
          doctorId: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
          reason: reason,
          status: 'Scheduled'
        });
        showMessage('success', 'Appointment booked successfully!');
        triggerRefresh();
        setView('my-appointments');
      } catch (error) {
        showMessage('error', 'Failed to book appointment');
      }
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
      <div className="section">
        <h2>Book New Appointment</h2>
        <div className="booking-form">
          <div className="form-group">
            <label>Select Doctor:</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} - {<html lang="en" className="specialization">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Document</title>
                  </head>
                  <body>
                    
                  </body>
                  </html> || 'General Medicine'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
            />
          </div>

          {selectedDoctor && selectedDate && (
            <div className="form-group">
              <label>Available Time Slots:</label>
              <div className="time-slots">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Reason for Visit:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for visit"
              rows="3"
            />
          </div>

          {selectedTime && (
            <div className="booking-summary">
              <h3>Appointment Summary</h3>
              <p><strong>Doctor:</strong> {doctors.find(d => d.id == selectedDoctor)?.name}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <button 
                onClick={handleBooking} 
                className="btn-primary"
              >
                Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // UPDATE Appointment
  const UpdateAppointment = ({ appointment }) => {
    const [date, setDate] = useState(appointment.date);
    const [time, setTime] = useState(appointment.time);
    const [reason, setReason] = useState(appointment.reason || '');

    const handleUpdate = async () => {
      try {
        await apiService.updateAppointment(appointment.id, {
          date,
          time,
          reason
        });
        showMessage('success', 'Appointment updated successfully');
        closeModal();
        triggerRefresh();
      } catch (error) {
        showMessage('error', 'Failed to update appointment');
      }
    };

    return (
      <div className="update-form">
        <h3>Update Appointment</h3>
        <div className="form-group">
          <label>Date:</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label>Time:</label>
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
          </select>
        </div>
        <div className="form-group">
          <label>Reason:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
          />
        </div>
        <div className="form-actions">
          <button onClick={handleUpdate} className="btn-primary">
            Update Appointment
          </button>
          <button onClick={closeModal} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // DELETE Appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await apiService.deleteAppointment(appointmentId);
        showMessage('success', 'Appointment cancelled successfully');
        triggerRefresh();
      } catch (error) {
        showMessage('error', 'Failed to cancel appointment');
      }
    }
  };

  // View Handlers
  if (view === 'book-appointment') {
    return <BookAppointment />;
  }

  if (view === 'available-doctors') {
    return (
      <div className="section">
        <h2>All Doctors</h2>
        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-avatar">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3>{doctor.name}</h3>
              <p className="specialization">{doctors.specialization || 'General Medicine'}</p>
              <p className="qualification">{doctors.qualification || 'MBBS'}</p>
              <div className="availability-status">
                {doctor.available ? '🟢 Available Today' : '🔴 Not Available'}
              </div>
              <div className="doctor-schedule">
                <p><strong>Working Hours:</strong></p>
                <p>Mon-Fri: 9:00 AM - 5:00 PM</p>
                <p>Sat: 9:00 AM - 1:00 PM</p>
              </div>
              <button 
                onClick={() => setView('book-appointment')}
                className="btn-primary"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'my-appointments') {
    const upcomingAppointments = appointments.filter(a => 
      new Date(a.date) >= new Date() && a.status !== 'Cancelled'
    );
    const pastAppointments = appointments.filter(a => 
      new Date(a.date) < new Date() || a.status === 'Completed'
    );
    const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled');

    return (
      <div className="section">
        <h2>My Appointments</h2>
        
        <div className="appointment-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({pastAppointments.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({cancelledAppointments.length})
          </button>
        </div>

        <div className="appointments-list">
          {activeTab === 'upcoming' && upcomingAppointments.map(apt => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-header">
                <h3>Dr. {apt.doctor_name}</h3>
                <span className={`status ${apt.status}`}>{apt.status}</span>
              </div>
              <div className="appointment-body">
                <p>📅 {new Date(apt.date).toLocaleDateString()}</p>
                <p>⏰ {apt.time}</p>
                <p>📝 {apt.reason || 'General Consultation'}</p>
                <p>💰 Payment: {apt.payment_status || 'Pending'}</p>
              </div>
              <div className="appointment-actions">
                <button 
                  onClick={() => openModal('Update Appointment', 
                    <UpdateAppointment appointment={apt} />
                  )}
                  className="btn-secondary btn-small"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => handleDeleteAppointment(apt.id)}
                  className="btn-danger btn-small"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'past' && pastAppointments.map(apt => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-header">
                <h3>Dr. {apt.doctor_name}</h3>
                <span className={`status ${apt.status}`}>{apt.status}</span>
              </div>
              <div className="appointment-body">
                <p>📅 {new Date(apt.date).toLocaleDateString()}</p>
                <p>⏰ {apt.time}</p>
                <p>📝 {apt.reason || 'General Consultation'}</p>
              </div>
              <div className="appointment-actions">
                <button className="btn-primary btn-small">
                  View Details
                </button>
                <button 
                  onClick={() => setView('prescriptions')}
                  className="btn-secondary btn-small"
                >
                  View Prescription
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'cancelled' && cancelledAppointments.map(apt => (
            <div key={apt.id} className="appointment-card cancelled">
              <div className="appointment-header">
                <h3>Dr. {apt.doctor_name}</h3>
                <span className="status Cancelled">Cancelled</span>
              </div>
              <div className="appointment-body">
                <p>📅 {new Date(apt.date).toLocaleDateString()}</p>
                <p>⏰ {apt.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'prescriptions') {
    return (
      <div className="section">
        <h2>My Prescriptions</h2>
        <div className="prescriptions-list">
          {prescriptions.map(pres => (
            <div key={pres.id} className="prescription-card">
              <div className="prescription-header">
                <h3>{pres.medication}</h3>
                <span className="date">{new Date(pres.date).toLocaleDateString()}</span>
              </div>
              <div className="prescription-body">
                <p><strong>Prescribed by:</strong> Dr. {pres.doctor_name}</p>
                <p><strong>Dosage:</strong> {pres.dosage}</p>
                <p><strong>Duration:</strong> {pres.duration || '7 days'}</p>
                <p><strong>Instructions:</strong> {pres.instructions}</p>
                {pres.lab_test_required && (
                  <div className="lab-test-alert">
                    ⚠️ Lab Test Required: {pres.lab_test_name}
                  </div>
                )}
              </div>
              <div className="prescription-actions">
                <button className="btn-primary btn-small">Print</button>
                <button className="btn-secondary btn-small">Download PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'lab-reports') {
    return (
      <div className="section">
        <h2>Lab Reports</h2>
        <div className="lab-reports-list">
          {labReports.map(report => (
            <div key={report.id} className="lab-report-card">
              <div className="report-header">
                <h3>{report.test_name}</h3>
                <span className={`status ${report.status}`}>{report.status}</span>
              </div>
              <div className="report-body">
                <p>📅 Test Date: {new Date(report.date).toLocaleDateString()}</p>
                <p>👨‍⚕️ Ordered by: Dr. {report.doctor_name}</p>
                <p>💰 Payment: {report.payment_status}</p>
              </div>
              <div className="report-actions">
                {report.status === 'Report Sent' && report.report_url ? (
                  <a 
                    href={report.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-small"
                  >
                    📄 Download Report
                  </a>
                ) : (
                  <span className="pending-status">Report Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="section">
      <h2>Welcome, {currentUser?.name}!</h2>
      
      <div className="stats-grid">
        <div 
          className="stat-card clickable" 
          onClick={() => setView('my-appointments')}
        >
          <div className="stat-icon">📅</div>
          <h3>Upcoming Appointments</h3>
          <p className="stat-number">
            {appointments.filter(a => 
              new Date(a.date) >= new Date() && a.status === 'Scheduled'
            ).length}
          </p>
        </div>
        
        <div 
          className="stat-card clickable" 
          onClick={() => setView('available-doctors')}
        >
          <div className="stat-icon">👨‍⚕️</div>
          <h3>All Doctors</h3>
          <p className="stat-number">{doctors.length}</p>
        </div>
        
        <div 
          className="stat-card clickable" 
          onClick={() => setView('lab-reports')}
        >
          <div className="stat-icon">🔬</div>
          <h3>Lab Reports</h3>
          <p className="stat-number">{labReports.length}</p>
        </div>
        
        <div 
          className="stat-card clickable" 
          onClick={() => setView('prescriptions')}
        >
          <div className="stat-icon">💊</div>
          <h3>Active Prescriptions</h3>
          <p className="stat-number">{prescriptions.length}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button 
            onClick={() => setView('book-appointment')}
            className="action-btn"
          >
            <span>➕</span> Book Appointment
          </button>
          <button 
            onClick={() => setView('available-doctors')}
            className="action-btn"
          >
            <span>👨‍⚕️</span> Find Doctor
          </button>
          <button 
            onClick={() => setView('my-appointments')}
            className="action-btn"
          >
            <span>📋</span> My Appointments
          </button>
          <button 
            onClick={() => setView('lab-reports')}
            className="action-btn"
          >
            <span>📄</span> View Reports
          </button>
        </div>
      </div>
    </div>
  );
};