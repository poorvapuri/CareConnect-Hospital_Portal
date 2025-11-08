import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const AppointmentManagement = () => {
  const { showMessage, triggerRefresh } = useApp();
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsData, appointmentsData] = await Promise.all([
        apiService.getDoctors(),
        apiService.getAppointments()
      ]);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch (error) {
      showMessage('error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create or find patient
      const patientData = {
        name: formData.patientName,
        email: formData.email || `${formData.contactNumber}@walkin.com`,
        password: 'temp123',
        role: 'Patient',
        contactNumber: formData.contactNumber
      };
      
      // In a real app, this would be handled by the backend
      await apiService.createAppointment({
        patientId: 'walk-in-patient',
        patientName: formData.patientName,
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason
      });
      
      showMessage('success', 'Appointment booked for walk-in patient');
      setShowForm(false);
      setFormData({
        patientName: '',
        contactNumber: '',
        email: '',
        doctorId: '',
        date: '',
        time: '',
        reason: ''
      });
      fetchData();
      triggerRefresh();
    } catch (error) {
      showMessage('error', error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = () => {
    if (!formData.doctorId || !formData.date) return [];
    
    const bookedSlots = appointments
      .filter(apt => 
        apt.doctor_id === formData.doctorId && 
        apt.date === formData.date
      )
      .map(apt => apt.time);
    
    return timeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const availableSlots = getAvailableSlots();

  // Get tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="section">
      <div className="section-header">
        <h2>Appointment Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Book Walk-in Appointment'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Book Walk-in Appointment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name*</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Contact Number*</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Reason for Visit</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="e.g., Consultation, Follow-up"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Select Doctor*</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Select Date*</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={minDate}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {formData.doctorId && formData.date && (
              <div className="form-group">
                <label>Available Time Slots*</label>
                <div className="time-slots">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${formData.time === slot ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, time: slot})}
                      disabled={loading}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <p className="no-slots">No available slots for this date</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || !formData.time}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    patientName: '',
                    contactNumber: '',
                    email: '',
                    doctorId: '',
                    date: '',
                    time: '',
                    reason: ''
                  });
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="appointments-list">
        <h3>Today's Appointments</h3>
        <div className="appointment-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter(apt => apt.date === new Date().toISOString().split('T')[0])
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.time}</td>
                    <td>{apt.patient_name}</td>
                    <td>Dr. {apt.doctor_name}</td>
                    <td>
                      <span className={`status ${apt.status}`}>{apt.status}</span>
                    </td>
                    <td>{apt.contact || 'N/A'}</td>
                    <td>
                      <button className="btn-small">View</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length === 0 && (
            <p className="no-data">No appointments for today</p>
          )}
        </div>
      </div>
    </div>
  );
};