import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const AppointmentBooking = () => {
  const { currentUser, showMessage, triggerRefresh } = useApp();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots] = useState([
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');


  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const data = await apiService.getDoctors();
      setDoctors(data);
    } catch (error) {
      showMessage('error', 'Failed to fetch doctors');
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const appointments = await apiService.getAppointments({ 
        doctorId: selectedDoctor, 
        date: selectedDate 
      });
      const booked = appointments.map(apt => apt.time);
      setBookedSlots(booked);
    } catch (error) {
      console.error('Failed to fetch booked slots');
    }
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      showMessage('error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await apiService.createAppointment({
        patientId: currentUser.id,
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        reason: reason || undefined

      });
      
      showMessage('success', 'Appointment booked successfully!');
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      triggerRefresh();
    } catch (error) {
      showMessage('error', error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum
 // Allow booking from today onward
const today = new Date();
const minDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;


  return (
    <div className="section">
      <h2>Book Appointment</h2>
      <div className="form-container">
        <div className="form-group">
          <label>Select Doctor</label>
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={loading}
          >
            <option value="">Choose a doctor</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            disabled={loading}
          />
        </div>
        
        {selectedDoctor && selectedDate && (
          <div className="form-group">
            <label>Available Time Slots</label>
            <div className="time-slots">
              {availableSlots
  .filter(slot => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // ❌ Hide booked slots
    if (bookedSlots.includes(slot)) return false;

    // ❌ Hide past slots for TODAY
    if (selectedDate === todayStr) {
      const [hh, mm] = slot.split(":");
      const slotTime = new Date();
      slotTime.setHours(Number(hh), Number(mm), 0, 0);

      if (slotTime <= today) return false;
    }

    return true;
  })
  .map(slot => (
    <button
      key={slot}
      className={`time-slot ${selectedTime === slot ? "selected" : ""}`}
      onClick={() => setSelectedTime(slot)}
      disabled={false}
    >
      {slot}
    </button>
  ))
}

            </div>
          </div>
        )}
        
        {selectedTime && (
          <div className="appointment-summary">
            <h3>Appointment Summary</h3>
            <p><strong>Doctor:</strong> {doctors.find(d => d.id == selectedDoctor)?.name}</p>
            <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            
            <button 
              onClick={handleBooking} 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};