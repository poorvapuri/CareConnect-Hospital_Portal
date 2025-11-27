


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

  // ⭐ CHANGE HERE — added labTests state to show real count instead of hardcoded value
  const [labTests, setLabTests] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchMonthAppointments();
    fetchLabTests(); // ⭐ CHANGE HERE — fetch lab tests as well
  }, [selectedDate, refresh]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toLocaleDateString('en-CA'); 

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

  // ⭐ CHANGE HERE — new function to fetch lab tests for the doctor
  const fetchLabTests = async () => {
    try {
      // try to request lab tests scoped to doctor (backend must support this query param)
      const tests = await apiService.getLabTests({ doctorId: currentUser.id });
      setLabTests(tests || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      // keep labTests as empty array on failure
      setLabTests([]);
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
  patient_id: appointment.patient_id,
  doctor_id: currentUser.id,
  appointment_id: appointment.id,

  medication: prescription.medication,
  dosage: prescription.dosage,
  dosage_unit: prescription.dosage_unit || "",   // add this field
  duration: prescription.duration,
  instructions: prescription.instructions,

  lab_test_required: prescription.requiresLabTest,
  lab_test_name: prescription.labTestName || "",
  lab_test_instructions: prescription.labTestInstructions || "",

  date: new Date().toISOString().split("T")[0],
};

    if (existing) {
      await apiService.updatePrescription(existing.id, data);
      showMessage("success", "Prescription updated");
    } else {
      await apiService.createPrescription(data);
      showMessage("success", "Prescription created");
    }

    if (prescription.requiresLabTest && prescription.labTestName) {
      await apiService.createLabTest({
        patientId: appointment.patient_id,
        doctorId: currentUser.id,
        testName: prescription.labTestName,
        date: new Date().toISOString().split("T")[0],
        notes: prescription.labTestInstructions || ""
      });
      showMessage("info", "Lab test created");
    }

    closeModal();
    triggerRefresh();
  } catch (error) {
    console.error("Prescription error:", error);
    showMessage("error", "Failed to save prescription");
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

        <div className="form-group" style={{ display: "flex", alignItems: "left", gap: "10px" }}>
  <label style={{ margin: 0 }}>Requires Lab Test</label>

  <input
    type="checkbox"
    checked={prescription.requiresLabTest}
    onChange={(e) =>
      setPrescription({
        ...prescription,
        requiresLabTest: e.target.checked
      })
    }
    style={{ display: "flex", width: "18px", height: "18px" }}
  />
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
          {/* <button 
            className={filter === 'today' ? 'active' : ''}
            onClick={() => setFilter('today')}
          >
            Today
          </button> */}
          {/* <button 
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
          </button> */}
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
          {/* ⭐ CHANGE HERE — replaced hardcoded 3 with dynamic lab test count */}
          <p className="stat-number">{labTests.length}</p>
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

      
    </div>
  );
};







































// // frontend/src/components/dashboard/DoctorDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { useApp } from '../../context/AppContext';
// import { apiService } from '../../services/api';

// /**
//  * DoctorDashboard.jsx
//  *
//  * Changes / Notes:
//  * - ⭐ CHANGE: Added `localTab` to render Dashboard / Calendar / Prescription Management inside this component.
//  * - ⭐ CHANGE: Added `labTests` state and `fetchLabTests()` for dynamic lab tests count.
//  * - ⭐ CHANGE: Added `prescriptionCount` state and `fetchPrescriptionCount()` - used by the Prescriptions Today card.
//  * - ⭐ CHANGE: Replaced some setView(...) calls with setLocalTab(...) so the tab UI is internal and consistent.
//  * - Styling for filter buttons added inline; you can move to CSS file later if required.
//  *
//  * Copy / paste this full file into frontend/src/components/dashboard/DoctorDashboard.jsx
//  */

// export const DoctorDashboard = () => {
//   const { /* global view not used for internal tabs but kept */ view, setView, currentUser, showMessage, refresh, openModal, closeModal, triggerRefresh } = useApp();

//   // -------------------------
//   // Local component state
//   // -------------------------
//   const [localTab, setLocalTab] = useState('dashboard'); // ⭐ CHANGE: local tab (dashboard | calendar | prescriptions)
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [appointments, setAppointments] = useState([]);
//   const [monthAppointments, setMonthAppointments] = useState([]);
//   const [labTests, setLabTests] = useState([]); // ⭐ CHANGE: dynamic lab tests count
//   const [prescriptionCount, setPrescriptionCount] = useState(0); // ⭐ CHANGE: shows number on card
//   const [loading, setLoading] = useState(false);

//   // -------------------------
//   // Fetchers
//   // -------------------------
//   useEffect(() => {
//     fetchAppointments();
//     fetchMonthAppointments();
//     fetchLabTests();
//     fetchPrescriptionCount();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedDate, refresh]);

//   // Fetch appointments for selectedDate (doctor-scoped)
//   const fetchAppointments = async () => {
//     try {
//       setLoading(true);
//       const dateStr = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd
//       const apts = await apiService.getAppointments({
//         doctorId: currentUser?.id,
//         date: dateStr
//       });
//       setAppointments(apts || []);
//     } catch (err) {
//       console.error('Error fetching appointments:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch month appointments for calendar
//   const fetchMonthAppointments = async () => {
//     try {
//       const year = selectedDate.getFullYear();
//       const month = selectedDate.getMonth();
//       const startDate = new Date(year, month, 1).toISOString().split('T')[0];
//       const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
//       const apts = await apiService.getAppointments({
//         doctorId: currentUser?.id,
//         startDate,
//         endDate
//       });
//       setMonthAppointments(apts || []);
//     } catch (err) {
//       console.error('Error fetching month appointments:', err);
//     }
//   };

//   // ⭐ CHANGE: fetch lab tests for this doctor (backend must support ?doctorId=)
//   const fetchLabTests = async () => {
//     try {
//       const tests = await apiService.getLabTests({ doctorId: currentUser?.id });
//       setLabTests(tests || []);
//     } catch (err) {
//       console.error('Error fetching lab tests:', err);
//       setLabTests([]);
//     }
//   };

//   // ⭐ CHANGE: fetch today's prescription count for this doctor
//   const fetchPrescriptionCount = async () => {
//     try {
//       const today = new Date().toISOString().split('T')[0];
//       const pres = await apiService.getPrescriptions({
//         doctorId: currentUser?.id,
//         date: today
//       });
//       setPrescriptionCount(Array.isArray(pres) ? pres.length : (pres?.length || 0));
//     } catch (err) {
//       console.error('Error fetching prescription count:', err);
//       setPrescriptionCount(0);
//     }
//   };

//   // -------------------------
//   // Helper UI utilities
//   // -------------------------
//   const formatDateOnlyIST = (dateString) => {
//     if (!dateString) return '';
//     try {
//       const d = new Date(dateString);
//       return d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }); // dd/mm/yyyy
//     } catch {
//       return dateString;
//     }
//   };

//   const extractAndFormatTimeFromISO = (isoString) => {
//     if (!isoString) return '';
//     if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(isoString)) {
//       const parts = isoString.split(':');
//       return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
//     }
//     try {
//       const d = new Date(isoString);
//       return d.toLocaleTimeString('en-GB', {
//         timeZone: 'Asia/Kolkata',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: false
//       });
//     } catch {
//       return '';
//     }
//   };

//   const cleanDoctorName = (raw) => {
//     if (!raw) return '';
//     const noPrefix = raw.replace(/^\s*(Dr\.?|dr\.?|DR\.?)\s*/i, '');
//     const trimmed = noPrefix.trim();
//     return trimmed ? `Dr. ${trimmed}` : '';
//   };

//   // -------------------------
//   // Calendar View (kept)
//   // -------------------------
//   const CalendarView = () => {
//     const getDaysInMonth = () => {
//       const year = selectedDate.getFullYear();
//       const month = selectedDate.getMonth();
//       const firstDay = new Date(year, month, 1);
//       const lastDay = new Date(year, month + 1, 0);
//       const startingDayOfWeek = firstDay.getDay();
//       const days = [];
//       for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
//       for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
//       return days;
//     };

//     const days = getDaysInMonth();

//     return (
//       <div className="calendar-container">
//         <div className="calendar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div>
//             <button
//               onClick={() => {
//                 const newDate = new Date(selectedDate);
//                 newDate.setMonth(newDate.getMonth() - 1);
//                 setSelectedDate(newDate);
//               }}
//               className="calendar-nav"
//             >←</button>
//             <span style={{ marginLeft: 12, fontWeight: 700 }}>
//               {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
//             </span>
//           </div>

//           <div>
//             <button
//               onClick={() => {
//                 const newDate = new Date(selectedDate);
//                 newDate.setMonth(newDate.getMonth() + 1);
//                 setSelectedDate(newDate);
//               }}
//               className="calendar-nav"
//             >→</button>
//           </div>
//         </div>

//         <div className="calendar-weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 12 }}>
//           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//             <div key={day} className="weekday" style={{ textAlign: 'center', fontWeight: 600 }}>{day}</div>
//           ))}
//         </div>

//         <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 10 }}>
//           {days.map((day, index) => {
//             if (!day) return <div key={`empty-${index}`} className="calendar-day empty" style={{ height: 72 }} />;
//             const dayStr = day.toISOString().split('T')[0];
//             const dayAppointments = monthAppointments.filter(a => a.date === dayStr);
//             const isToday = day.toDateString() === new Date().toDateString();
//             const isSelected = day.toDateString() === selectedDate.toDateString();
//             return (
//               <div
//                 key={day.toISOString()}
//                 className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
//                 onClick={() => setSelectedDate(day)}
//                 style={{
//                   borderRadius: 8,
//                   padding: 8,
//                   minHeight: 72,
//                   background: isSelected ? '#eef2ff' : '#fff',
//                   border: isSelected ? '1px solid #c7d2fe' : '1px solid #f0f0f0',
//                   boxShadow: isToday ? '0 6px 18px rgba(99,102,241,0.06)' : 'none'
//                 }}
//               >
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <span className="day-number" style={{ fontWeight: 700 }}>{day.getDate()}</span>
//                   {dayAppointments.length > 0 && <span className="appointment-count" style={{ background: '#f3f4f6', borderRadius: 12, padding: '2px 8px', fontSize: 12 }}>{dayAppointments.length}</span>}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="selected-day-details" style={{ marginTop: 16 }}>
//           <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
//           {appointments.length === 0 ? (
//             <p className="no-appointments">No appointments scheduled</p>
//           ) : (
//             <div className="day-appointments">
//               {appointments.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(apt => (
//                 <div key={apt.id} className="appointment-slot" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 10, border: '1px solid #eee', marginBottom: 10 }}>
//                   <div className="slot-time" style={{ minWidth: 86, color: '#3b82f6', fontWeight: 700 }}>{apt.time}</div>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontWeight: 700 }}>{apt.patient_name}</div>
//                     <div style={{ color: '#666' }}>{apt.reason || 'General Consultation'}</div>
//                   </div>
//                   <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                     <span className={`status ${apt.status}`}>{apt.status}</span>
//                     <button onClick={() => openModal('Patient Details', <PatientDetails patient={apt} />)} className="btn-secondary btn-small">View Patient</button>
//                     <button onClick={() => openModal('Create Prescription', <CreatePrescription appointment={apt} />)} className="btn-primary btn-small">Prescribe</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // -------------------------
//   // Patient Details (kept)
//   // -------------------------
//   const PatientDetails = ({ patient }) => {
//     const [patientHistory, setPatientHistory] = useState({
//       appointments: [],
//       prescriptions: [],
//       labReports: []
//     });

//     useEffect(() => {
//       fetchPatientHistory();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     const fetchPatientHistory = async () => {
//       try {
//         const [apts, pres, labs] = await Promise.all([
//           apiService.getAppointments({ patientId: patient.patient_id }),
//           apiService.getPrescriptions({ patientId: patient.patient_id }),
//           apiService.getLabTests({ patientId: patient.patient_id })
//         ]);
//         setPatientHistory({
//           appointments: apts || [],
//           prescriptions: pres || [],
//           labReports: labs || []
//         });
//       } catch (err) {
//         console.error('Error fetching patient history:', err);
//       }
//     };

//     return (
//       <div className="patient-details" style={{ maxWidth: 800 }}>
//         <h3>{patient.patient_name}</h3>
//         <div className="detail-tabs">
//           <div className="tab-content">
//             <h4>Medical History</h4>

//             <div className="history-section">
//               <h5>Previous Appointments ({patientHistory.appointments.length})</h5>
//               {patientHistory.appointments.slice(0, 5).map(apt => (
//                 <div key={apt.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
//                   <span>{new Date(apt.date).toLocaleDateString()}</span>
//                   <span>{apt.reason || 'Consultation'}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="history-section">
//               <h5>Lab Reports ({patientHistory.labReports.length})</h5>
//               {patientHistory.labReports.map(report => (
//                 <div key={report.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
//                   <span>{report.test_name}</span>
//                   <span>{new Date(report.date).toLocaleDateString()}</span>
//                   {report.report_url && <a href={report.report_url} target="_blank" rel="noopener noreferrer" className="btn-small">View Report</a>}
//                 </div>
//               ))}
//             </div>

//             <div className="history-section">
//               <h5>Previous Prescriptions ({patientHistory.prescriptions.length})</h5>
//               {patientHistory.prescriptions.slice(0, 5).map(pres => (
//                 <div key={pres.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
//                   <span>{pres.medication}</span>
//                   <span>{new Date(pres.date).toLocaleDateString()}</span>
//                 </div>
//               ))}
//             </div>

//           </div>
//         </div>
//       </div>
//     );
//   };

//   // -------------------------
//   // Create / Update Prescription (kept, minor alignment)
//   // -------------------------
//   const CreatePrescription = ({ appointment, existing = null }) => {
//     const [prescription, setPrescription] = useState({
//       medication: existing?.medication || '',
//       dosage: existing?.dosage || '',
//       duration: existing?.duration || '',
//       instructions: existing?.instructions || '',
//       requiresLabTest: existing?.lab_test_required || false,
//       labTestName: existing?.lab_test_name || '',
//       labTestInstructions: existing?.lab_test_instructions || ''
//     });

//     const handleSave = async () => {
//       try {
//         const data = {
//           patientId: appointment.patient_id,
//           appointmentId: appointment.id,
//           ...prescription
//         };

//         if (existing) {
//           await apiService.updatePrescription(existing.id, data);
//           showMessage('success', 'Prescription updated');
//         } else {
//           await apiService.createPrescription(data);
//           showMessage('success', 'Prescription created');
//         }

//         if (prescription.requiresLabTest && prescription.labTestName) {
//           await apiService.createLabTest({
//             patientId: appointment.patient_id,
//             testName: prescription.labTestName,
//             date: new Date().toISOString().split('T')[0],
//             notes: prescription.labTestInstructions
//           });
//           showMessage('info', 'Lab test added successfully');
//         }

//         closeModal();
//         triggerRefresh && triggerRefresh();
//       } catch (err) {
//         console.error('Error saving prescription or lab test:', err);
//         showMessage('error', 'Failed to save prescription or lab test');
//       }
//     };

//     return (
//       <div className="prescription-form" style={{ maxWidth: 700 }}>
//         <h3>{existing ? 'Update' : 'Create'} Prescription</h3>

//         <div className="form-group">
//           <label>Medication:</label>
//           <input type="text" value={prescription.medication} onChange={(e) => setPrescription({ ...prescription, medication: e.target.value })} placeholder="e.g., Paracetamol" />
//         </div>

//         <div className="form-group">
//           <label>Dosage:</label>
//           <input type="text" value={prescription.dosage} onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })} placeholder="e.g., 500mg twice daily" />
//         </div>

//         <div className="form-group">
//           <label>Duration:</label>
//           <input type="text" value={prescription.duration} onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })} placeholder="e.g., 7 days" />
//         </div>

//         <div className="form-group">
//           <label>Instructions:</label>
//           <textarea value={prescription.instructions} onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })} rows="3" />
//         </div>

//         <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <label style={{ margin: 0 }}>Requires Lab Test</label>
//           <input type="checkbox" checked={prescription.requiresLabTest} onChange={(e) => setPrescription({ ...prescription, requiresLabTest: e.target.checked })} style={{ width: 18, height: 18 }} />
//         </div>

//         {prescription.requiresLabTest && (
//           <>
//             <div className="form-group">
//               <label>Lab Test Name:</label>
//               <input type="text" value={prescription.labTestName} onChange={(e) => setPrescription({ ...prescription, labTestName: e.target.value })} placeholder="e.g., Complete Blood Count" />
//             </div>

//             <div className="form-group">
//               <label>Lab Test Instructions:</label>
//               <textarea value={prescription.labTestInstructions} onChange={(e) => setPrescription({ ...prescription, labTestInstructions: e.target.value })} rows="2" />
//             </div>
//           </>
//         )}

//         <div className="form-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
//           <button onClick={handleSave} className="btn-primary">{existing ? 'Update' : 'Create'} Prescription</button>
//           <button onClick={closeModal} className="btn-secondary">Cancel</button>
//         </div>
//       </div>
//     );
//   };

//   // -------------------------
//   // Prescription Management View
//   // -------------------------
//   const PrescriptionManagement = () => {
//     const [prescriptions, setPrescriptions] = useState([]);
//     const [filter, setFilter] = useState('today');
//     const [loadingPres, setLoadingPres] = useState(false);

//     useEffect(() => {
//       fetchPrescriptions();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [filter]);

//     const fetchPrescriptions = async () => {
//       try {
//         setLoadingPres(true);
//         const dateFilter = {};
//         if (filter === 'today') {
//           dateFilter.date = new Date().toISOString().split('T')[0];
//         } else if (filter === 'week') {
//           const weekAgo = new Date();
//           weekAgo.setDate(weekAgo.getDate() - 7);
//           dateFilter.startDate = weekAgo.toISOString().split('T')[0];
//           dateFilter.endDate = new Date().toISOString().split('T')[0];
//         }
//         const pres = await apiService.getPrescriptions({
//           doctorId: currentUser?.id,
//           ...dateFilter
//         });
//         setPrescriptions(pres || []);
//       } catch (err) {
//         console.error('Error fetching prescriptions:', err);
//       } finally {
//         setLoadingPres(false);
//       }
//     };

//     const handleDelete = async (id) => {
//       if (!window.confirm('Are you sure you want to delete this prescription?')) return;
//       try {
//         await apiService.deletePrescription(id);
//         showMessage('success', 'Prescription deleted');
//         fetchPrescriptions();
//       } catch (err) {
//         showMessage('error', 'Failed to delete prescription');
//       }
//     };

//     // Styled filter buttons
//     const FilterButton = ({ active, onClick, children }) => (
//       <button
//         onClick={onClick}
//         style={{
//           padding: '8px 14px',
//           borderRadius: 8,
//           border: active ? 'none' : '1px solid #e6e6e6',
//           background: active ? 'linear-gradient(90deg,#6d6af0,#8b50c9)' : '#fff',
//           color: active ? '#fff' : '#333',
//           fontWeight: 600,
//           cursor: 'pointer'
//         }}
//       >
//         {children}
//       </button>
//     );

//     return (
//       <div className="prescription-management" style={{ maxWidth: 980, margin: '0 auto' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//           <h2 style={{ margin: 0 }}>Prescription Management</h2>
//           <div style={{ display: 'flex', gap: 8 }}>
//             <FilterButton active={filter === 'today'} onClick={() => setFilter('today')}>Today</FilterButton>
//             <FilterButton active={filter === 'week'} onClick={() => setFilter('week')}>This Week</FilterButton>
//             <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
//           </div>
//         </div>

//         <div style={{ marginTop: 8 }}>
//           {loadingPres ? <p>Loading...</p> : prescriptions.length === 0 ? <p>No prescriptions found.</p> :
//             prescriptions.map(pres => (
//               <div key={pres.id} style={{ borderRadius: 10, padding: 16, background: '#fff', border: '1px solid #f1f1f1', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                 <div>
//                   <div style={{ fontWeight: 700 }}>{pres.patient_name} <span style={{ fontWeight: 700, marginLeft: 8 }}>{new Date(pres.date).toLocaleDateString()}</span></div>
//                   <div style={{ marginTop: 8 }}>
//                     <p style={{ margin: 0 }}><strong>Medication:</strong> {pres.medication}</p>
//                     <p style={{ margin: 0 }}><strong>Dosage:</strong> {pres.dosage}</p>
//                     <p style={{ margin: 0 }}><strong>Duration:</strong> {pres.duration}</p>
//                     <p style={{ margin: 0 }}><strong>Instructions:</strong> {pres.instructions}</p>
//                     {pres.lab_test_required && <p style={{ margin: 0 }}>🔬 Lab Test: {pres.lab_test_name}</p>}
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   <button onClick={() => openModal('Update Prescription', <CreatePrescription appointment={{ patient_id: pres.patient_id, id: pres.appointment_id }} existing={pres} />)} className="btn-secondary">Edit</button>
//                   <button onClick={() => handleDelete(pres.id)} className="btn-danger">Delete</button>
//                 </div>
//               </div>
//             ))
//           }
//         </div>
//       </div>
//     );
//   };

//   // -------------------------
//   // Main rendering
//   // -------------------------
//   // Top internal nav tabs (Dashboard | Calendar | Prescription Management)
//   const TopTabs = () => (
//     <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 18 }}>
//       {['dashboard', 'calendar', 'prescriptions'].map(tab => {
//         const label = tab === 'dashboard' ? 'Dashboard' : tab === 'calendar' ? 'Calendar' : 'Prescription Management';
//         const active = localTab === tab;
//         return (
//           <button
//             key={tab}
//             onClick={() => setLocalTab(tab)}
//             style={{
//               background: 'transparent',
//               border: 'none',
//               padding: '8px 12px',
//               fontSize: 16,
//               fontWeight: active ? 700 : 600,
//               color: active ? '#4f46e5' : '#444',
//               borderBottom: active ? '3px solid #6d6af0' : '3px solid transparent',
//               cursor: 'pointer'
//             }}
//           >
//             {label}
//           </button>
//         );
//       })}
//     </div>
//   );

//   // -------------------------
//   // Stat card component
//   // -------------------------
//   const StatCard = ({ icon, title, value, onClick }) => (
//     <div
//       onClick={onClick}
//       className="stat-card"
//       style={{
//         flex: 1,
//         borderRadius: 14,
//         padding: 28,
//         background: 'linear-gradient(135deg,#6d6af0,#8b50c9)',
//         color: '#fff',
//         boxShadow: '0 12px 30px rgba(20,20,40,0.06)',
//         cursor: onClick ? 'pointer' : 'default',
//         minWidth: 220,
//         marginRight: 12
//       }}
//     >
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ fontSize: 28 }}>{icon}</div>
//         <div style={{ marginTop: 8, opacity: 0.95, letterSpacing: 1.2 }}>{title}</div>
//         <div style={{ marginTop: 18, fontSize: 42, fontWeight: 800 }}>{value}</div>
//       </div>
//     </div>
//   );

//   // Render local tab view
//   if (localTab === 'calendar') {
//     return (
//       <div className="section">
//         <TopTabs />
//         <div style={{ marginTop: 8 }}>
//           <CalendarView />
//         </div>
//       </div>
//     );
//   }

//   if (localTab === 'prescriptions') {
//     return (
//       <div className="section">
//         <TopTabs />
//         <div style={{ marginTop: 8 }}>
//           <PrescriptionManagement />
//         </div>
//       </div>
//     );
//   }

//   // Default: Dashboard (localTab === 'dashboard')
//   return (
//     <div className="section" style={{ paddingBottom: 40 }}>
//       <TopTabs />

//       <div className="stats-grid" style={{ display: 'flex', gap: 12, marginTop: 10 }}>
//         <StatCard
//           icon="📅"
//           title="Today's Appointments"
//           value={appointments.length}
//           onClick={() => setLocalTab('calendar')} // ⭐ CHANGE: now switches local tab
//         />

//         <StatCard
//           icon="💊"
//           title="Prescriptions Today"
//           value={prescriptionCount} // ⭐ CHANGE: uses prescriptionCount
//           onClick={() => setLocalTab('prescriptions')}
//         />

//         <StatCard
//           icon="🔬"
//           title="Lab Tests Ordered"
//           value={labTests.length}
//         />
//       </div>

//       <div className="today-schedule" style={{ marginTop: 24 }}>
//         <h3 style={{ marginBottom: 12 }}>Today's Schedule - {new Date().toLocaleDateString()}</h3>

//         {loading ? <p>Loading appointments...</p> : appointments.length === 0 ? (
//           <p className="no-appointments">No appointments scheduled for today</p>
//         ) : (
//           <div className="schedule-list" style={{ display: 'grid', gap: 12 }}>
//             {appointments.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(apt => (
//               <div key={apt.id} className="schedule-item" style={{ borderRadius: 10, padding: 14, background: '#fbfbfb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 3px 8px rgba(0,0,0,0.02)' }}>
//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                   <div style={{ color: '#3b82f6', fontWeight: 700, minWidth: 90 }}>{apt.time}</div>
//                   <div>
//                     <div style={{ fontWeight: 700 }}>{apt.patient_name}</div>
//                     <div style={{ color: '#666' }}>{apt.reason || 'General Consultation'}</div>
//                   </div>
//                 </div>

//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                   <div>
//                     <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 8, background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', fontSize: 13 }}>
//                       {apt.payment_status || apt.status || 'N/A'}
//                     </div>
//                   </div>

//                   <div>
//                     <button onClick={() => setLocalTab('calendar')} className="btn-primary btn-small" style={{ padding: '8px 12px', borderRadius: 8 }}>
//                       View Details
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;
