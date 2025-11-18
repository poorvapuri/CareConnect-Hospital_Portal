import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const AppointmentManagement = () => {
  const { showMessage, triggerRefresh, currentUser } = useApp();
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

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointment: null,
    date: '',
    time: ''
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers: local "today" YYYY-MM-DD (avoid UTC mismatch)
  const getLocalDateString = (d = new Date()) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.toISOString().split('T')[0];
  };

  const localToday = getLocalDateString();

  // For walk-in form - minimum should be today (not tomorrow)
  const minDateForForm = localToday;

  // Get available slots for walk-in form (avoid past slots when date is today)
  const getAvailableSlots = () => {
    if (!formData.doctorId || !formData.date) return [];

    const bookedSlots = appointments
      .filter(apt =>
        String(apt.doctor_id) === String(formData.doctorId) &&
        apt.date === formData.date
      )
      .map(apt => apt.time);

    // If date === today, filter out slots that have already passed
    const isToday = formData.date === localToday;
    const now = new Date();

    return timeSlots.filter(slot => {
      if (bookedSlots.includes(slot)) return false;
      if (isToday) {
        const [h, m] = slot.split(':').map(Number);
        const slotDt = new Date();
        slotDt.setHours(h, m, 0, 0);
        if (slotDt <= now) return false; // passed or equal -> blocked
      }
      return true;
    });
  };

  const availableSlots = getAvailableSlots();

  // ------- RESCHEDULE / CANCEL HANDLERS --------

  const openReschedule = (appointment) => {
    setRescheduleModal({
      open: true,
      appointment,
      date: appointment.date,
      time: appointment.time
    });
  };

  const closeReschedule = () => {
    setRescheduleModal({ open: false, appointment: null, date: '', time: '' });
  };

  // helper to check if a slot is already passed for a given date (local)
  const isPastTimeSlot = (dateStr, slot) => {
    if (!dateStr || !slot) return false;
    const [h, m] = slot.split(':').map(Number);
    const slotDt = new Date(dateStr + 'T' + `${slot}:00`);
    // Ensure we use local timezone: create from parts instead
    const parts = dateStr.split('-').map(Number); // yyyy-mm-dd
    const slotLocal = new Date(parts[0], parts[1] - 1, parts[2], h, m, 0, 0);
    return slotLocal <= new Date();
  };

  const availableSlotsForReschedule = () => {
    if (!rescheduleModal.date || !rescheduleModal.appointment) return [];
    const docId = rescheduleModal.appointment.doctor_id || rescheduleModal.appointment.doctorId;
    const booked = appointments
      .filter(apt => String(apt.doctor_id) === String(docId) && apt.date === rescheduleModal.date)
      .map(apt => apt.time);

    return timeSlots.filter(slot => {
      if (booked.includes(slot)) return false;
      if (rescheduleModal.date === localToday) {
        if (isPastTimeSlot(rescheduleModal.date, slot)) return false;
      }
      return true;
    });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();

    const apt = rescheduleModal.appointment;
    if (!apt) return;

    // Basic validation
    if (!rescheduleModal.date || !rescheduleModal.time) {
      showMessage('error', 'Please choose new date and time');
      return;
    }

    // disallow setting to a past slot
    if (isPastTimeSlot(rescheduleModal.date, rescheduleModal.time)) {
      showMessage('error', 'Cannot reschedule into a past time slot');
      return;
    }

    try {
      setLoading(true);
      await apiService.updateAppointment(apt.id, {
        date: rescheduleModal.date,
        time: rescheduleModal.time,
        reason: apt.reason || undefined
      });

      showMessage('success', 'Appointment rescheduled successfully');
      closeReschedule();
      fetchData();
      triggerRefresh();
    } catch (error) {
      // show server message if exists
      showMessage('error', error.message || 'Failed to reschedule appointment');
      console.error('Reschedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setLoading(true);
      await apiService.deleteAppointment(appointmentId);
      showMessage('success', 'Appointment cancelled successfully');
      fetchData();
      triggerRefresh();
    } catch (error) {
      showMessage('error', error.message || 'Failed to cancel appointment');
      console.error('Cancel error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ------- DISPLAY / TABLE --------

  // Today's appointments (use localToday to avoid UTC mismatch)
  const todaysApts = appointments
    .filter(apt => apt.date === localToday)
    .sort((a, b) => a.time.localeCompare(b.time));

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
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Contact Number*</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Reason for Visit</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={minDateForForm}
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
                      onClick={() => setFormData({ ...formData, time: slot })}
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
              {todaysApts.map(apt => (
                <tr key={apt.id}>
                  <td>{apt.time}</td>
                  <td>{apt.patient_name}</td>
                  <td>Dr. {apt.doctor_name}</td>
                  <td>
                    <span className={`status ${apt.status}`}>{apt.status}</span>
                  </td>
                  <td>{apt.contact || 'N/A'}</td>
                  <td>
                    <button className="btn-small" onClick={() => {/* view details */}}>View</button>

                    {/* Cancel allowed for Patients / Receptionists / Admins (adjust by role if needed) */}
                    <button
                      className="btn-small danger"
                      onClick={() => handleCancel(apt.id)}
                      disabled={loading || apt.status === 'Cancelled'}
                      title="Cancel appointment"
                    >
                      Cancel
                    </button>

                    {/* Show reschedule for upcoming/scheduled appointments */}
                    <button
                      className="btn-small"
                      onClick={() => openReschedule(apt)}
                      disabled={loading || apt.status !== 'Scheduled'}
                      title="Reschedule appointment"
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {todaysApts.length === 0 && (
            <p className="no-data">No appointments for today</p>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.open && rescheduleModal.appointment && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reschedule Appointment</h3>
            <p>
              Patient: <strong>{rescheduleModal.appointment.patient_name}</strong><br />
              Current: <strong>{rescheduleModal.appointment.date} {rescheduleModal.appointment.time}</strong>
            </p>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group">
                <label>New Date</label>
                <input
                  type="date"
                  value={rescheduleModal.date}
                  onChange={(e) => setRescheduleModal({...rescheduleModal, date: e.target.value, time: ''})}
                  min={localToday}
                />
              </div>

              {rescheduleModal.date && (
                <div className="form-group">
                  <label>Available Time Slots</label>
                  <div className="time-slots">
                    {availableSlotsForReschedule().map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot ${rescheduleModal.time === slot ? 'selected' : ''}`}
                        onClick={() => setRescheduleModal({...rescheduleModal, time: slot})}
                      >
                        {slot}
                      </button>
                    ))}

                    {availableSlotsForReschedule().length === 0 && (
                      <p className="no-slots">No available slots for this date</p>
                    )}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading || !rescheduleModal.time}>
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" className="btn-secondary" onClick={closeReschedule} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
