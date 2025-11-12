// frontend/src/components/dashboard/ReceptionistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const ReceptionistDashboard = () => {
  const { view, setView, showMessage, refresh, openModal, closeModal, triggerRefresh } = useApp();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [refresh, selectedDate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, appointmentsRes, paymentsRes, labTestsRes, prescriptionsRes] = await Promise.all([
        apiService.getDoctors(),
        apiService.getAppointments({ date: selectedDate }),
        apiService.getPayments({ date: selectedDate }),
        apiService.getLabTests(),
        apiService.getPrescriptions()
      ]);
      
      setDoctors(doctorsRes || []);
      setAppointments(appointmentsRes || []);
      setPayments(paymentsRes || []);
      setLabTests(labTestsRes || []);
      setPrescriptions(prescriptionsRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Doctor Schedule View
  const DoctorScheduleView = ({ doctorId }) => {
    const doctorAppointments = appointments.filter(a => a.doctor_id === doctorId);
    const doctor = doctors.find(d => d.id === doctorId);

    return (
      <div className="doctor-schedule">
        <h3>Dr. {doctor?.name} - Schedule for {new Date(selectedDate).toLocaleDateString()}</h3>
        
        <div className="schedule-timeline">
          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(time => {
            const appointment = doctorAppointments.find(a => a.time === time);
            
            return (
              <div key={time} className={`time-slot ${appointment ? 'booked' : 'available'}`}>
                <div className="slot-time">{time}</div>
                {appointment ? (
                  <div className="slot-details">
                    <p className="patient-name">{appointment.patient_name}</p>
                    <p className="appointment-reason">{appointment.reason || 'Consultation'}</p>
                    <div className="slot-actions">
                      <span className={`status ${appointment.status}`}>{appointment.status}</span>
                      <span className={`payment ${appointment.payment_status}`}>
                        {appointment.payment_status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="slot-available">
                    <button 
                      onClick={() => openModal('Book Walk-in', 
                        <WalkInBooking doctorId={doctorId} time={time} />
                      )}
                      className="btn-small"
                    >
                      Book Slot
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Walk-in Booking
  const WalkInBooking = ({ doctorId, time }) => {
    const [walkInData, setWalkInData] = useState({
      patientName: '',
      contactNumber: '',
      email: '',
      reason: '',
      isEmergency: false
    });

    const handleWalkInBooking = async () => {
      try {
        await apiService.createWalkInAppointment({
          ...walkInData,
          doctorId,
          date: selectedDate,
          time,
          is_walkin: true,
          status: 'Checked-In'
        });
        showMessage('success', 'Walk-in appointment created');
        closeModal();
        triggerRefresh();
      } catch (error) {
        showMessage('error', 'Failed to create walk-in appointment');
      }
    };

    return (
      <div className="walkin-form">
        <h3>Register Walk-in Patient</h3>
        <div className="form-group">
          <label>Patient Name:</label>
          <input
            type="text"
            value={walkInData.patientName}
            onChange={(e) => setWalkInData({...walkInData, patientName: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Contact Number:</label>
          <input
            type="tel"
            value={walkInData.contactNumber}
            onChange={(e) => setWalkInData({...walkInData, contactNumber: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Email (Optional):</label>
          <input
            type="email"
            value={walkInData.email}
            onChange={(e) => setWalkInData({...walkInData, email: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Reason for Visit:</label>
          <textarea
            value={walkInData.reason}
            onChange={(e) => setWalkInData({...walkInData, reason: e.target.value})}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={walkInData.isEmergency}
              onChange={(e) => setWalkInData({...walkInData, isEmergency: e.target.checked})}
            />
            Emergency Case
          </label>
        </div>
        <button onClick={handleWalkInBooking} className="btn-primary">
          Register Walk-in
        </button>
      </div>
    );
  };

  // Payment Processing
  const PaymentDesk = () => {
    const [activePaymentTab, setActivePaymentTab] = useState('pending');
    
    const pendingPayments = appointments.filter(a => a.payment_status !== 'Paid');
    const pendingLabPayments = labTests.filter(l => l.payment_status !== 'Payment Verified');
    
    const ProcessPayment = ({ item, type }) => {
      const [paymentData, setPaymentData] = useState({
        amount: item.payment_amount || 0,
        method: 'Cash',
        notes: ''
      });

      const handlePayment = async () => {
        try {
          if (type === 'appointment') {
            await apiService.processAppointmentPayment(item.id, {
              ...paymentData,
              status: 'Paid'
            });
          } else {
            await apiService.updateLabTestPayment(item.id, 'Payment Verified');
          }
          showMessage('success', `Payment of $${paymentData.amount} processed`);
          closeModal();
          triggerRefresh();
        } catch (error) {
          showMessage('error', 'Payment processing failed');
        }
      };

      return (
        <div className="payment-form">
          <h3>Process Payment</h3>
          <div className="payment-details">
            <p><strong>Patient:</strong> {item.patient_name}</p>
            <p><strong>Service:</strong> {type === 'appointment' ? 'Consultation' : item.test_name}</p>
          </div>
          <div className="form-group">
            <label>Amount ($):</label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Payment Method:</label>
            <select 
              value={paymentData.method}
              onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Credit/Debit Card</option>
              <option value="Insurance">Insurance</option>
              <option value="Online">Online Transfer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
              rows="2"
            />
          </div>
          <button onClick={handlePayment} className="btn-primary">
            Process Payment
          </button>
        </div>
      );
    };

    return (
      <div className="payment-desk">
        <div className="payment-tabs">
          <button 
            className={activePaymentTab === 'pending' ? 'active' : ''}
            onClick={() => setActivePaymentTab('pending')}
          >
            Pending Payments
          </button>
          <button 
            className={activePaymentTab === 'completed' ? 'active' : ''}
            onClick={() => setActivePaymentTab('completed')}
          >
            Completed Today
          </button>
          <button 
            className={activePaymentTab === 'lab' ? 'active' : ''}
            onClick={() => setActivePaymentTab('lab')}
          >
            Lab Test Payments
          </button>
        </div>

        <div className="payment-content">
          {activePaymentTab === 'pending' && (
            <div className="pending-payments">
              <h3>Pending Consultation Payments</h3>
              {pendingPayments.map(appointment => (
                <div key={appointment.id} className="payment-item">
                  <div className="payment-info">
                    <h4>{appointment.patient_name}</h4>
                    <p>Dr. {appointment.doctor_name}</p>
                    <p>Time: {appointment.time}</p>
                  </div>
                  <div className="payment-amount">
                    <p className="amount">${appointment.payment_amount || 50}</p>
                    <button 
                      onClick={() => openModal('Process Payment', 
                        <ProcessPayment item={appointment} type="appointment" />
                      )}
                      className="btn-primary btn-small"
                    >
                      Process Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePaymentTab === 'lab' && (
            <div className="lab-payments">
              <h3>Pending Lab Test Payments</h3>
              {pendingLabPayments.map(test => (
                <div key={test.id} className="payment-item">
                  <div className="payment-info">
                    <h4>{test.patient_name}</h4>
                    <p>{test.test_name}</p>
                  </div>
                  <div className="payment-amount">
                    <p className="amount">${test.amount || 100}</p>
                    <button 
                      onClick={() => openModal('Process Payment', 
                        <ProcessPayment item={test} type="lab" />
                      )}
                      className="btn-primary btn-small"
                    >
                      Process Payment
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

  // Create Lab Test from Prescription
  const CreateLabTestFromPrescription = () => {
    const [selectedPrescription, setSelectedPrescription] = useState('');
    const [testAmount, setTestAmount] = useState('');

    const handleCreateLabTest = async () => {
      try {
        const prescription = prescriptions.find(p => p.id === selectedPrescription);
        await apiService.createLabTest({
          patientId: prescription.patient_id,
          testName: prescription.lab_test_name,
          amount: testAmount,
          date: new Date().toISOString().split('T')[0],
          prescription_id: prescription.id
        });
        showMessage('success', 'Lab test created from prescription');
        closeModal();
        triggerRefresh();
      } catch (error) {
        showMessage('error', 'Failed to create lab test');
      }
    };

    const prescriptionsWithLabTests = prescriptions.filter(p => p.lab_test_required);

    return (
      <div className="create-lab-test">
        <h3>Create Lab Test from Prescription</h3>
        <div className="form-group">
          <label>Select Prescription:</label>
          <select
            value={selectedPrescription}
            onChange={(e) => setSelectedPrescription(e.target.value)}
          >
            <option value="">Choose prescription</option>
            {prescriptionsWithLabTests.map(pres => (
              <option key={pres.id} value={pres.id}>
                {pres.patient_name} - {pres.lab_test_name} - {pres.date}
              </option>
            ))}
          </select>
        </div>
        {selectedPrescription && (
          <>
            <div className="prescription-details">
              <p><strong>Test:</strong> {prescriptions.find(p => p.id === selectedPrescription)?.lab_test_name}</p>
              <p><strong>Doctor's Instructions:</strong> {prescriptions.find(p => p.id === selectedPrescription)?.lab_test_instructions}</p>
            </div>
            <div className="form-group">
              <label>Test Amount ($):</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="Enter test cost"
              />
            </div>
            <button onClick={handleCreateLabTest} className="btn-primary">
              Create Lab Test
            </button>
          </>
        )}
      </div>
    );
  };

  // Main Views
  if (view === 'doctors-list') {
    return (
      <div className="section">
        <h2>Doctors & Their Schedules</h2>
        
        <div className="date-selector">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="doctors-list">
          {doctors.map(doctor => {
            const doctorApts = appointments.filter(a => a.doctor_id === doctor.id);
            
            return (
              <div key={doctor.id} className="doctor-item">
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialty || 'General Medicine'}</p>
                </div>
                <div className="doctor-stats">
                  <span className="appointment-count">
                    {doctorApts.length} appointments
                  </span>
                  <span className="availability">
                    {doctor.available ? '🟢 Available' : '🔴 Busy'}
                  </span>
                </div>
                <button 
                  onClick={() => openModal(`Dr. ${doctor.name} Schedule`, 
                    <DoctorScheduleView doctorId={doctor.id} />
                  )}
                  className="btn-primary btn-small"
                >
                  View Schedule
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'payment-desk') {
    return (
      <div className="section">
        <h2>Payment Desk</h2>
        <PaymentDesk />
      </div>
    );
  }

  if (view === 'appointments-crud') {
    return (
      <div className="section">
        <h2>Appointment Management</h2>
        
        <div className="action-bar">
          <button 
            onClick={() => openModal('Walk-in Registration', 
              <WalkInBooking doctorId={doctors[0]?.id} time="10:00" />
            )}
            className="btn-primary"
          >
            + Register Walk-in
          </button>
          <button 
            onClick={() => openModal('Create Lab Test', 
              <CreateLabTestFromPrescription />
            )}
            className="btn-secondary"
          >
            Create Lab Test from Prescription
          </button>
        </div>

        <div className="appointments-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>{apt.time}</td>
                  <td>{apt.patient_name}</td>
                  <td>Dr. {apt.doctor_name}</td>
                  <td>
                    <span className={`status ${apt.status}`}>{apt.status}</span>
                  </td>
                  <td>
                    <span className={`payment-status ${apt.payment_status}`}>
                      {apt.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td>{apt.is_walkin ? '🚶 Walk-in' : '📅 Scheduled'}</td>
                  <td>
                    <select 
                      value={apt.status}
                      onChange={async (e) => {
                        await apiService.updateAppointmentStatus(apt.id, e.target.value);
                        triggerRefresh();
                      }}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Checked-In">Checked-In</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button className="btn-small">Edit</button>
                    <button className="btn-danger btn-small">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Main Dashboard
 // Main Dashboard
return (
  <div className="section receptionist-dashboard">
    <h2>Reception Dashboard</h2>

    <div className="stats-grid two-cards">
      {/* 👨‍⚕️ Doctors on Duty */}
      <div
        className="stat-card clickable"
        onClick={() => setView('doctors-list')}
      >
        <div className="stat-icon">👨‍⚕️</div>
        <h3>Doctors On Duty</h3>
        <p className="stat-number">
          {doctors.filter((d) => d.available).length}
        </p>
      </div>

      {/* 📅 Today's Appointments */}
      <div
        className="stat-card clickable"
        onClick={() => setView('appointments-crud')}
      >
        <div className="stat-icon">📅</div>
        <h3>Today's Appointments</h3>
        <p className="stat-number">{appointments.length}</p>
      </div>
    </div>

    {/* <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="action-grid">
        <button
          onClick={() => setView('doctors-list')}
          className="action-btn"
        >
          View Doctor Schedules
        </button>
        <button
          onClick={() =>
            openModal(
              'Walk-in Registration',
              <WalkInBooking doctorId={doctors[0]?.id} time="10:00" />
            )
          }
          className="action-btn"
        >
          Register Walk-in
        </button>
        <button
          onClick={() => setView('payment-desk')}
          className="action-btn"
        >
          Process Payments
        </button>
        <button
          onClick={() =>
            openModal('Create Lab Test', <CreateLabTestFromPrescription />)
          }
          className="action-btn"
        >
          Create Lab Test
        </button>
      </div>
    </div> */}
  </div>
);

};