// frontend/src/components/dashboard/ReceptionistDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const ReceptionistDashboard = () => {
  const { view, setView, showMessage, refresh, openModal, closeModal, triggerRefresh } = useApp();

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]); // filtered by selectedDate from backend call
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, selectedDate]);

  const fetchAllData = async () => {
  try {
    setLoading(true);

    // ✅ Use endpoints the receptionist has access to
    const [doctorsRes, appointmentsRes] = await Promise.all([
      apiService.getDoctors(), // receptionist can access this
      apiService.getAppointments({ date: selectedDate })
    ]);

    // ✅ Normalize doctor data (handle different backend response shapes)
    let doctorList = [];
    if (Array.isArray(doctorsRes)) {
      doctorList = doctorsRes;
    } else if (doctorsRes?.data) {
      doctorList = doctorsRes.data;
    } else if (doctorsRes?.doctors) {
      doctorList = doctorsRes.doctors;
    } else if (doctorsRes?.results) {
      doctorList = doctorsRes.results;
    }

    // ✅ Normalize appointments data
    let appointmentList = [];
    if (Array.isArray(appointmentsRes)) {
      appointmentList = appointmentsRes;
    } else if (appointmentsRes?.data) {
      appointmentList = appointmentsRes.data;
    } else if (appointmentsRes?.appointments) {
      appointmentList = appointmentsRes.appointments;
    }

    // ✅ Set states
    setDoctors(doctorList);
    setAppointments(appointmentList);
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    showMessage && showMessage('error', 'Failed to fetch receptionist data');
  } finally {
    setLoading(false);
  }
};


  // -------------------------
  // Helper formatting funcs (copied from Admin style)
  // -------------------------
  const formatDateOnlyIST = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }); // dd/mm/yyyy
    } catch {
      return dateString;
    }
  };

  const extractAndFormatTimeFromISO = (isoString) => {
    if (!isoString) return '';
    // if isoString looks like a time already, normalize it
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(isoString)) {
      const parts = isoString.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '';
    }
  };

  const cleanDoctorName = (raw) => {
    if (!raw) return '';
    const noPrefix = raw.replace(/^\s*(Dr\.?|dr\.?|DR\.?)\s*/i, '');
    const trimmed = noPrefix.trim();
    return trimmed ? `Dr. ${trimmed}` : '';
  };

  // -------------------------
  // Doctor Schedule & WalkIn (kept visually similar)
  // -------------------------
  const DoctorScheduleView = ({ doctorId }) => {
    const doctorAppointments = appointments.filter(a => (a.doctor_id === doctorId) || (a.doctor && a.doctor.id === doctorId));
    const doctor = doctors.find(d => d.id === doctorId);

    return (
      <div className="doctor-schedule">
        <h3>Dr. {doctor?.name} - Schedule for {formatDateOnlyIST(selectedDate)}</h3>

        <div className="schedule-timeline">
          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(time => {
            const appointment = doctorAppointments.find(a => {
              const aptTime = a.time || a.appointmentTime || '';
              return aptTime === time;
            });

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
          patientName: walkInData.patientName,
          contactNumber: walkInData.contactNumber,
          doctorId,
          date: selectedDate,
          time,
          is_walkin: true,
          status: 'Checked-In',
          payment_status: 'Pending'
        });
        showMessage('success', 'Walk-in appointment created');
        closeModal();
        triggerRefresh();
      } catch (error) {
        console.error('Walk-in create error', error);
        showMessage('error', 'Failed to create walk-in appointment');
      }
    };

    return (
      <div style={{ maxWidth: 600 }}>
        <h3>Register Walk-in Patient</h3>
        <div className="form-group">
          <label>Patient Name:</label>
          <input type="text" value={walkInData.patientName} onChange={(e) => setWalkInData({ ...walkInData, patientName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact Number:</label>
          <input type="tel" value={walkInData.contactNumber} onChange={(e) => setWalkInData({ ...walkInData, contactNumber: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Reason:</label>
          <textarea rows="3" value={walkInData.reason} onChange={(e) => setWalkInData({ ...walkInData, reason: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleWalkInBooking} className="btn-primary">Register Walk-in</button>
          <button onClick={() => closeModal()} className="btn-secondary">Cancel</button>
        </div>
      </div>
    );
  };

  // -------------------------
  // TodayAppointments View (styled like Admin's AllAppointmentsView)
  // -------------------------
  const TodayAppointmentsView = () => {
    return (
      <div style={{ maxWidth: 980, margin: '20px auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: 22,
          boxShadow: '0 12px 30px rgba(20,20,40,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{
              padding: '8px 18px',
              borderRadius: 10,
              background: '#fafaff',
              boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)'
            }}>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20, textAlign: 'center' }}>
                Today's Appointments
              </h2>
            </div>
          </div>

          <div style={{ height: 12 }} />

          {loading ? <p>Loading appointments...</p> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {appointments.length === 0 && <p>No appointments for selected date.</p>}
              {appointments.map((apt) => {
                const id = apt.id || apt._id || `${apt.patientId || apt.patient_name}-${apt.date || apt.appointmentDate}-${apt.time || apt.appointmentTime}`;

                const rawDate = apt.date || apt.appointmentDate || null;
                const dateDisplay = rawDate ? formatDateOnlyIST(rawDate) : '';

                let timeDisplay = apt.time || apt.appointmentTime || '';
                if (!timeDisplay && rawDate && /\dT\d/.test(rawDate)) {
                  timeDisplay = extractAndFormatTimeFromISO(rawDate);
                }

                const doctorRaw = apt.doctor_name || (apt.doctor && (apt.doctor.name || apt.doctor.fullName)) || '';
                const doctorDisplay = cleanDoctorName(doctorRaw);

                return (
                  <div key={id} style={{
                    borderRadius: 10,
                    padding: 14,
                    background: '#fbfbfb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ maxWidth: '78%' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                        {apt.patient_name || (apt.patient && (apt.patient.name || `${apt.patient.firstName || ''} ${apt.patient.lastName || ''}`)) || 'Unknown Patient'}
                      </div>
                      <div style={{ color: '#555', marginBottom: 6 }}>
                        {doctorDisplay || 'Doctor'}
                      </div>
                      <div style={{ color: '#777', fontSize: 13 }}>
                        {dateDisplay}{timeDisplay ? ` • ${timeDisplay}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setView && setView('dashboard')}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg,#6d6af0,#8b50c9)',
                color: '#fff',
                border: 'none',
                padding: '12px 26px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 8px 24px rgba(105,70,200,0.12)',
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------
  // Billing & Payments (styled like Admin cards)
  // -------------------------
  const BillingPaymentsView = () => {
    const [activeTab, setActiveTab] = useState('unpaid');
    const [processingIds, setProcessingIds] = useState([]);

    const unpaidAppointments = appointments.filter(a => (a.payment_status || 'Pending') !== 'Paid');
    const paidAppointments = appointments.filter(a => (a.payment_status || '') === 'Paid');

    const markAsPaid = async (apt) => {
      if (!apt || (!apt.id && !apt._id)) return;
      const id = apt.id || apt._id;

      // optimistic UI update
      setAppointments(prev => prev.map(a => ((a.id || a._id) === id ? { ...a, payment_status: 'Paid' } : a)));
      setProcessingIds(prev => [...prev, id]);

      try {
        if (apiService.processAppointmentPayment) {
          await apiService.processAppointmentPayment(id, { status: 'Paid', payment_status: 'Paid' });
        } else if (apiService.updateAppointmentStatus) {
          await apiService.updateAppointmentStatus(id, 'Paid');
        } else {
          await apiService.updateAppointment(id, { payment_status: 'Paid', status: 'Paid' });
        }
        showMessage && showMessage('success', 'Payment marked as paid');
        triggerRefresh && triggerRefresh();
      } catch (err) {
        console.error('Mark as paid error', err);
        // revert on error
        setAppointments(prev => prev.map(a => ((a.id || a._id) === id ? { ...a, payment_status: apt.payment_status || 'Pending' } : a)));
        showMessage && showMessage('error', 'Failed to mark as paid');
      } finally {
        setProcessingIds(prev => prev.filter(x => x !== id));
      }
    };

    return (
      <div style={{ maxWidth: 980, margin: '20px auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: 22,
          boxShadow: '0 12px 30px rgba(20,20,40,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontWeight: 700 }}>Billing & Payments</h2>
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <button onClick={() => setActiveTab('unpaid')} className={activeTab === 'unpaid' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', borderRadius: 8 }}>
              Unpaid
            </button>
            <button onClick={() => setActiveTab('paid')} className={activeTab === 'paid' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', borderRadius: 8 }}>
              Paid
            </button>
          </div>

          {activeTab === 'unpaid' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {loading ? <p>Loading...</p> : unpaidAppointments.length === 0 ? <p>No unpaid appointments for selected date.</p> :
                unpaidAppointments.map(appointment => {
                  const id = appointment.id || appointment._id;
                  const rawDate = appointment.date || appointment.appointmentDate || null;
                  const dateDisplay = rawDate ? formatDateOnlyIST(rawDate) : '';
                  const timeDisplay = appointment.time || appointment.appointmentTime || (rawDate && /\dT\d/.test(rawDate) ? extractAndFormatTimeFromISO(rawDate) : '');
                  const doctorDisplay = cleanDoctorName(appointment.doctor_name || (appointment.doctor && (appointment.doctor.name || appointment.doctor.fullName)) || '');

                  return (
  <div
    key={id}
    style={{
      borderRadius: 10,
      padding: 14,
      background: '#fbfbfb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 3px 8px rgba(0,0,0,0.02)'
    }}
  >
    <div style={{ maxWidth: '72%' }}>
      <div style={{ fontWeight: 700, fontSize: 15 }}>
        {appointment.patient_name ||
          (appointment.patient && appointment.patient.name) ||
          'Unknown'}
      </div>
      <div style={{ color: '#555', marginTop: 6 }}>
        {doctorDisplay || 'Doctor'}
      </div>
      <div style={{ color: '#777', marginTop: 6 }}>
        {dateDisplay}
        {timeDisplay ? ` • ${timeDisplay}` : ''}
      </div>
    </div>

    {/* ✅ Payment & Action buttons aligned horizontally */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'flex-end',
        minWidth: 180
      }}
    >
      <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
        ₹{appointment.payment_amount || 500}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 10px',
            borderRadius: 8,
            background: appointment.payment_status === 'Paid'
              ? '#e6f8f2'
              : '#fff7e6',
            color:
              appointment.payment_status === 'Paid'
                ? '#137333'
                : '#b36b00',
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          {appointment.payment_status || 'Pending'}
        </span>

        {appointment.payment_status !== 'Paid' && (
          <button
            onClick={() => markAsPaid(appointment)}
            disabled={processingIds.includes(id)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              backgroundColor: '#66bd60ff',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              opacity: processingIds.includes(id) ? 0.7 : 1
            }}
          >
            {processingIds.includes(id)
              ? 'Processing...'
              : 'Mark as Paid'}
          </button>
        )}
      </div>
    </div>
  </div>
);

                })
              }
            </div>
          )}

          {activeTab === 'paid' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {loading ? <p>Loading...</p> : paidAppointments.length === 0 ? <p>No paid appointments for selected date.</p> :
                paidAppointments.map(appointment => {
                  const id = appointment.id || appointment._id;
                  const rawDate = appointment.date || appointment.appointmentDate || null;
                  const dateDisplay = rawDate ? formatDateOnlyIST(rawDate) : '';
                  const timeDisplay = appointment.time || appointment.appointmentTime || (rawDate && /\dT\d/.test(rawDate) ? extractAndFormatTimeFromISO(rawDate) : '');
                  const doctorDisplay = cleanDoctorName(appointment.doctor_name || (appointment.doctor && (appointment.doctor.name || appointment.doctor.fullName)) || '');

                  return (
                    <div key={id} style={{
                      borderRadius: 10,
                      padding: 14,
                      background: '#fbfbfb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{appointment.patient_name || (appointment.patient && appointment.patient.name) || 'Unknown'}</div>
                        <div style={{ color: '#555', marginTop: 6 }}>{doctorDisplay || 'Doctor'}</div>
                        <div style={{ color: '#777', marginTop: 6 }}>{dateDisplay}{timeDisplay ? ` • ${timeDisplay}` : ''}</div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: 120 }}>
                        {/* <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', fontSize: 13, color: '#333' }}>
                          Paid
                        </div> */}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}

        </div>
      </div>
    );
  };

  // -------------------------
  // Doctors list view (kept)
  // -------------------------
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

  // -------------------------
  // Appointments Today view (replaces CRUD)
  // -------------------------
  if (view === 'appointments-today') {
    return <TodayAppointmentsView />;
  }

  // -------------------------
  // Billing view
  // -------------------------
  if (view === 'billing') {
    return <BillingPaymentsView />;
  }

  // -------------------------
  // Main Dashboard (default) — Admin style
  // -------------------------
  const todaysAppointmentsCount = appointments.filter(a => (a.date === selectedDate) || (a.appointmentDate === selectedDate)).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: 28,
        boxShadow: '0 10px 28px rgba(20,20,40,0.06)'
      }}>
        <h2 style={{ marginTop: 0 }}>Reception Dashboard</h2>
        <div style={{ color: '#666', marginBottom: 18 }}>Manage appointments, payments and quick receptionist actions.</div>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{
            minWidth: 220,
            maxWidth: 320,
            flex: '1 1 260px',
            borderRadius: 12,
            padding: '26px 20px',
            background: 'linear-gradient(135deg,#6d6af0,#8b50c9)',
            color: '#fff',
            boxShadow: '0 8px 28px rgba(70,50,120,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 12
          }}>
            <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>ALL DOCTORS</div>
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{doctors.filter(d => d.available).length}</div>
          </div>

          <div style={{
            minWidth: 220,
            maxWidth: 320,
            flex: '1 1 260px',
            borderRadius: 12,
            padding: '26px 20px',
            background: 'linear-gradient(135deg,#6d6af0,#8b50c9)',
            color: '#fff',
            boxShadow: '0 8px 28px rgba(70,50,120,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 12
          }}>
            <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>TODAY'S APPOINTMENTS</div>
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{todaysAppointmentsCount || 0}</div>
          </div>
        </div>

        <div style={{
          marginTop: 22,
          background: '#fbfbfe',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0' }}>Quick Actions</h3>
            <div style={{ color: '#666' }}>Open appointments or billing from the top menu.</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setView && setView('appointments-today')} className="btn-primary" style={{ padding: '10px 16px', borderRadius: 8 }}>View Today's Appointments</button>
            <button onClick={() => setView && setView('billing')} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>Open Billing</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
