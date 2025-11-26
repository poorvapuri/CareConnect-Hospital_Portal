// // frontend/src/components/dashboard/PatientDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { useApp } from "../../context/AppContext";
// import { apiService } from "../../services/api";

// export const PatientDashboard = () => {
//   const {
//     view,
//     setView,
//     currentUser,
//     showMessage,
//     refresh,
//     openModal,
//     closeModal,
//     triggerRefresh,
//   } = useApp();
//   const [appointments, setAppointments] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [labReports, setLabReports] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("upcoming");

//   useEffect(() => {
//   const fetchBookedSlots = async () => {
//     if (!selectedDoctor || !selectedDate) return;

//     try {
//       const appts = await apiService.getAppointments({
//         doctorId: selectedDoctor,
//         date: selectedDate,
//       });
//       setBookedSlots(appts.map(a => a.time));
//     } catch (e) {
//       setBookedSlots([]);
//     }
//   };

//   fetchBookedSlots();
//   fetchAvailableSlots();   //  <-- ADD THIS LINE
// }, [selectedDoctor, selectedDate]);


//   const fetchAllData = async () => {
//   try {
//     setLoading(true);

//     const [appointmentsRes, doctorsRes, labReportsRes, prescriptionsRes] =
//       await Promise.all([
//         apiService.getAppointments({ patientId: currentUser.id }),
//         apiService.getDoctors(),
//         apiService.getLabTests({ patientId: currentUser.id }),
//         apiService.getPrescriptions({ patientId: currentUser.id }),
//       ]);

//     setAppointments(appointmentsRes || []);

//     // ✅ FIX: handle both array and object response formats for doctors
//     setDoctors(
//       Array.isArray(doctorsRes)
//         ? doctorsRes
//         : doctorsRes?.doctors || doctorsRes?.data || []
//     );

//     setLabReports(labReportsRes || []);
//     setPrescriptions(prescriptionsRes || []);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   } finally {
//     setLoading(false);
//   }
// };


//   // CREATE Appointment
//   const BookAppointment = () => {
//     const [selectedDoctor, setSelectedDoctor] = useState("");
//     const [selectedDate, setSelectedDate] = useState("");
//     const [selectedTime, setSelectedTime] = useState("");
//     const [reason, setReason] = useState("");
//     const [availableSlots, setAvailableSlots] = useState([]);

//     useEffect(() => {
//   const fetchBookedSlots = async () => {
//     if (!selectedDoctor || !selectedDate) return;

//     try {
//       const appts = await apiService.getAppointments({
//         doctorId: selectedDoctor,
//         date: selectedDate,
//       });
//       setBookedSlots(appts.map(a => a.time));
//     } catch (e) {
//       setBookedSlots([]);
//     }
//   };

//   fetchBookedSlots();
//   fetchAvailableSlots();   //  <-- ADD THIS LINE
// }, [selectedDoctor, selectedDate]);


//     const fetchAvailableSlots = async () => {
//       try {
//         const slots = await apiService.getAvailableSlots(
//           selectedDoctor,
//           selectedDate
//         );
//         setAvailableSlots(slots);
//       } catch (error) {
//         setAvailableSlots([
//           "09:00",
//           "10:00",
//           "11:00",
//           "14:00",
//           "15:00",
//           "16:00",
//         ]);
//       }
//     };


//     const handleBooking = async () => {
//       try {
//         await apiService.createAppointment({
//           patientId: currentUser.id,
//           doctorId: selectedDoctor,
//           date: selectedDate,
//           time: selectedTime,
//           reason: reason || undefined,
//           status: "Scheduled",
//         });
//         showMessage("success", "Appointment booked successfully!");
//         triggerRefresh();
//         setView("my-appointments");
//       } catch (error) {
//         showMessage("error", "Failed to book appointment");
//       }
//     };

    


//     const today = new Date();
// const minDate = today.toISOString().split("T")[0];

//     return (
//       <div className="section">
//         <h2>Book New Appointment</h2>
//         <div className="booking-form">
//           <div className="form-group">
//             <label>Select Doctor:</label>
//             <select
//               value={selectedDoctor}
//               onChange={(e) => setSelectedDoctor(e.target.value)}
//             >
//               <option value="">Choose a doctor</option>
//               {doctors.map((doc) => (
//                 <option key={doc.id} value={doc.id}>
//                   {doc.name} - {doc.specialization || "General Medicine"}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Select Date:</label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               min={minDate}
//             />
//           </div>

//           {selectedDoctor && selectedDate && (
//             <div className="form-group">
//               <label>Available Time Slots:</label>
//               <div className="time-slots">
//                 {getFilteredSlots().length === 0 && (
//   <p className="no-slots">No available slots</p>
// )}

// {getFilteredSlots().map(slot => (
//   <button
//     key={slot}
//     className={`slot-btn ${selectedTime === slot ? "selected" : ""}`}
//     onClick={() => setSelectedTime(slot)}
//   >
//     {slot}
//   </button>
// ))}

//               </div>
//             </div>
//           )}

//           <div className="form-group">
//             <label>Reason for Visit:</label>
//             <textarea
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Describe your symptoms or reason for visit"
//               rows="3"
//             />
//           </div>

//           {selectedTime && (
//             <div className="booking-summary">
//               <h3>Appointment Summary</h3>
//               <p>
//                 <strong>Doctor:</strong>{" "}
//                 {doctors.find((d) => d.id == selectedDoctor)?.name}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {new Date(selectedDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Time:</strong> {selectedTime}
//               </p>
//               <button onClick={handleBooking} className="btn-primary">
//                 Confirm Booking
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // UPDATE Appointment
//   const UpdateAppointment = ({ appointment }) => {
//     const [date, setDate] = useState(appointment.date);
//     const [time, setTime] = useState(appointment.time);
//     const [reason, setReason] = useState(appointment.reason || "");

//     const handleUpdate = async () => {
//       try {
//         await apiService.updateAppointment(appointment.id, {
//           date,
//           time,
//           reason: reason || undefined
//         });
//         showMessage("success", "Appointment updated successfully");
//         closeModal();
//         triggerRefresh();
//       } catch (error) {
//         showMessage("error", "Failed to update appointment");
//       }
//     };

//     return (
//       <div className="update-form">
//         <h3>Update Appointment</h3>
//         <div className="form-group">
//           <label>Date:</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             min={new Date().toISOString().split("T")[0]}
//           />
//         </div>
//         <div className="form-group">
//           <label>Time:</label>
//           <select value={time} onChange={(e) => setTime(e.target.value)}>
//             <option value="09:00">09:00 AM</option>
//             <option value="10:00">10:00 AM</option>
//             <option value="11:00">11:00 AM</option>
//             <option value="14:00">02:00 PM</option>
//             <option value="15:00">03:00 PM</option>
//             <option value="16:00">04:00 PM</option>
//           </select>
//         </div>
//         <div className="form-group">
//           <label>Reason:</label>
//           <textarea
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             rows="3"
//           />
//         </div>
//         <div className="form-actions">
//           <button onClick={handleUpdate} className="btn-primary">
//             Update Appointment
//           </button>
//           <button onClick={closeModal} className="btn-secondary">
//             Cancel
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // DELETE Appointment
//   const handleDeleteAppointment = async (appointmentId) => {
//     if (window.confirm("Are you sure you want to cancel this appointment?")) {
//       try {
//         await apiService.deleteAppointment(appointmentId);
//         showMessage("success", "Appointment cancelled successfully");
//         triggerRefresh();
//       } catch (error) {
//         showMessage("error", "Failed to cancel appointment");
//       }
//     }
//   };

//   // View Handlers
//   if (view === "book-appointment") {
//     const [selectedDoctor, setSelectedDoctor] = useState("");
//     const [selectedDate, setSelectedDate] = useState("");
//     const [selectedTime, setSelectedTime] = useState("");
//     const [reason, setReason] = useState("");
//     const [availableSlots, setAvailableSlots] = useState([]);
  
//    const [bookedSlots, setBookedSlots] = useState([]);
// useEffect(() => {
//   if (!selectedDoctor || !selectedDate) return;

//   const fetchBookedSlots = async () => {
//     try {
//       const appts = await apiService.getAppointments({
//         doctorId: selectedDoctor,
//         date: selectedDate,
//       });
//       setBookedSlots(appts.map(a => a.time));
//     } catch {
//       setBookedSlots([]);
//     }
//   };

//   fetchBookedSlots();
//   fetchAvailableSlots();  // <-- THIS FIXES YOUR ENTIRE ISSUE
// }, [selectedDoctor, selectedDate]);



//    const fetchAvailableSlots = async () => {
//   try {
//     const slots = await apiService.getAvailableSlots(
//       selectedDoctor,
//       selectedDate
//     );
//     setAvailableSlots(slots);
//   } catch {
//     setAvailableSlots([
//       "09:00",
//       "10:00",
//       "11:00",
//       "14:00",
//       "15:00",
//       "16:00",
//     ]);
//   }
// };


//     const handleBooking = async () => {
//       try {
//         await apiService.createAppointment({
//           patientId: currentUser.id,
//           doctorId: selectedDoctor,
//           date: selectedDate,
//           time: selectedTime,
//           reason,
//           status: "Scheduled",
//         });
//         showMessage("success", "Appointment booked successfully!");
//         triggerRefresh();
//         setView("my-appointments");
//       } catch {
//         showMessage("error", "Failed to book appointment");
//       }
//     };

//     const today = new Date();
// const minDate = today.toISOString().split("T")[0];

//     // --- FILTER SLOTS (REMOVE PAST + BOOKED) ---
//     const getFilteredSlots = () => {
//       // 1. Remove booked slots
//       let filtered = availableSlots.filter(
//         (slot) => !bookedSlots.includes(slot)
//       );

//       // 2. Remove past slots only if selectedDate == today
//       const today = new Date().toISOString().split("T")[0];
//       if (selectedDate !== today) return filtered;

//       const now = new Date();

//       filtered = filtered.filter((slot) => {
//         const [h, m] = slot.split(":");
//         const slotTime = new Date();
//         slotTime.setHours(h, m, 0, 0);
//         return slotTime > now;
//       });

//       return filtered;
//     };




//     return (
//       <div className="section book-appointment-page">
//         <h2 className="page-title">🩺 Book New Appointment</h2>

//         <div className="booking-card glass-card">
//           <div className="form-group">
//             <label>Select Doctor</label>
//             <select
//               value={selectedDoctor}
//               onChange={(e) => setSelectedDoctor(e.target.value)}
//               className="styled-select"
//             >
//               <option value="">Choose a Doctor</option>
//               {doctors.map((doc) => (
//                 <option key={doc.id} value={doc.id}>
//                   Dr. {doc.name} — {doc.specialization || "General Medicine"}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Select Date</label>
//             <input
//               type="date"
//               className="styled-input"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               min={minDate}
//             />
//           </div>

//           {selectedDoctor && selectedDate && (
//             <div className="form-group">
//               <label>Available Time Slots</label>
//               <div className="slot-grid">
//                 {getFilteredSlots().length === 0 && (
//   <p className="no-slots">No available slots</p>
// )}
// {getFilteredSlots().map(slot => (
//   <button
//     key={slot}
//     className={`slot-btn ${selectedTime === slot ? "selected" : ""}`}
//     onClick={() => setSelectedTime(slot)}
//   >
//     {slot}
//   </button>
// ))}

//               </div>
//             </div>
//           )}

//           <div className="form-group">
//             <label>Reason for Visit</label>
//             <textarea
//               className="styled-textarea"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Describe your symptoms or reason for visit"
//               rows="3"
//             />
//           </div>

//           {selectedTime && (
//             <div className="booking-summary">
//               <h3>Appointment Summary</h3>
//               <p>
//                 <strong>Doctor:</strong>{" "}
//                 {doctors.find((d) => d.id == selectedDoctor)?.name}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {new Date(selectedDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Time:</strong> {selectedTime}
//               </p>
//               <button
//                 onClick={handleBooking}
//                 className="btn btn-primary confirm-btn"
//               >
//                 ✅ Confirm Booking
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (view === "available-doctors") {
//     return (
//       <div className="section doctors-page">
//         <div className="doctors-grid">
//           {doctors.length === 0 && (
//             <p className="no-data">No doctors available right now.</p>
//           )}

//           {doctors.map((doctor) => (
//             <div key={doctor.id} className="doctor-card glass-card">
//               <div className="doctor-avatar">
//                 {doctor.name
//                   .split(" ")
//                   .map((n) => n[0])
//                   .join("")
//                   .toUpperCase()}
//               </div>

//               <div className="doctor-info">
//                 <h3 className="doctor-name">{doctor.name}</h3>
//                 <p className="specialization">
//                   🩺 {doctor.specialization || "General Medicine"}
//                 </p>
//                 <p className="qualification">
//                   🎓 {doctor.qualification || "MBBS"}
//                 </p>

//                 <div className="working-hours">
//                   <p>
//                     <strong>Working Hours:</strong>
//                   </p>
//                   <p>Mon – Fri : 9 AM – 5 PM</p>
//                   <p>Sat : 9 AM – 1 PM</p>
//                 </div>

//                 <button
//                   onClick={() => setView("book-appointment")}
//                   className="btn btn-primary book-btn"
//                 >
//                   Book Appointment
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (view === "my-appointments") {
//     const upcomingAppointments = appointments.filter(
//       (a) => new Date(a.date) >= new Date() && a.status !== "Cancelled"
//     );
//     const pastAppointments = appointments.filter(
//       (a) => new Date(a.date) < new Date() || a.status === "Completed"
//     );
//     const cancelledAppointments = appointments.filter(
//       (a) => a.status === "Cancelled"
//     );

//     return (
//       <div className="section appointments-page">
//         <h2 className="page-title">📅 My Appointments</h2>

//         <div className="appointment-tabs">
//           <button
//             className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
//             onClick={() => setActiveTab("upcoming")}
//           >
//             Upcoming ({upcomingAppointments.length})
//           </button>
//           <button
//             className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
//             onClick={() => setActiveTab("past")}
//           >
//             Past ({pastAppointments.length})
//           </button>
//           <button
//             className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
//             onClick={() => setActiveTab("cancelled")}
//           >
//             Cancelled ({cancelledAppointments.length})
//           </button>
//         </div>

//         <div className="appointments-list">
//           {loading ? (
//             <p className="loading-text">Loading appointments...</p>
//           ) : (
//             <>
//               {activeTab === "upcoming" &&
//                 upcomingAppointments.length === 0 && (
//                   <p className="no-data">No upcoming appointments</p>
//                 )}
//               {activeTab === "past" && pastAppointments.length === 0 && (
//                 <p className="no-data">No past appointments</p>
//               )}
//               {activeTab === "cancelled" &&
//                 cancelledAppointments.length === 0 && (
//                   <p className="no-data">No cancelled appointments</p>
//                 )}

//               {activeTab === "upcoming" &&
//                 upcomingAppointments.map((apt) => (
//                   <div key={apt.id} className="appointment-card glass-card">
//                     <div className="appointment-header">
//                       <h3>🩺 Dr. {apt.doctor_name}</h3>
//                       <span
//                         className={`status-badge ${apt.status.toLowerCase()}`}
//                       >
//                         {apt.status}
//                       </span>
//                     </div>
//                     <div className="appointment-body">
//                       <p>
//                         📆 <strong>Date:</strong>{" "}
//                         {new Date(apt.date).toLocaleDateString()}
//                       </p>
//                       <p>
//                         ⏰ <strong>Time:</strong> {apt.time}
//                       </p>
//                       <p>
//                         📝 <strong>Reason:</strong>{" "}
//                         {apt.reason || "General Consultation"}
//                       </p>
//                       <p>
//                         💰 <strong>Payment:</strong>{" "}
//                         {apt.payment_status || "Pending"}
//                       </p>
//                     </div>
//                     <div className="appointment-actions">
//                       <button
//                         onClick={() =>
//                           openModal(
//                             "Update Appointment",
//                             <UpdateAppointment appointment={apt} />
//                           )
//                         }
//                         className="btn btn-edit"
//                       >
//                         Reschedule
//                       </button>
//                       <button
//                         onClick={() => handleDeleteAppointment(apt.id)}
//                         className="btn btn-danger"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ))}

//               {activeTab === "past" &&
//                 pastAppointments.map((apt) => (
//                   <div
//                     key={apt.id}
//                     className="appointment-card glass-card past"
//                   >
//                     <div className="appointment-header">
//                       <h3>Dr. {apt.doctor_name}</h3>
//                       <span className="status-badge completed">
//                         {apt.status}
//                       </span>
//                     </div>
//                     <div className="appointment-body">
//                       <p>📆 {new Date(apt.date).toLocaleDateString()}</p>
//                       <p>⏰ {apt.time}</p>
//                       <p>📝 {apt.reason || "General Consultation"}</p>
//                     </div>
//                     <div className="appointment-actions">              
//                     </div>
//                   </div>
//                 ))}

//               {activeTab === "cancelled" &&
//                 cancelledAppointments.map((apt) => (
//                   <div
//                     key={apt.id}
//                     className="appointment-card glass-card cancelled"
//                   >
//                     <div className="appointment-header">
//                       <h3>Dr. {apt.doctor_name}</h3>
//                       <span className="status-badge cancelled">Cancelled</span>
//                     </div>
//                     <div className="appointment-body">
//                       <p>📆 {new Date(apt.date).toLocaleDateString()}</p>
//                       <p>⏰ {apt.time}</p>
//                     </div>
//                   </div>
//                 ))}
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (view === "prescriptions") {
//     return (
//       <div className="section prescriptions-page">
//         <h2 className="page-title"> My Prescriptions</h2>

//         <div className="prescriptions-grid">
//           {prescriptions.length === 0 && (
//             <p className="no-data">No prescriptions found.</p>
//           )}

//           {prescriptions.map((pres) => (
//             <div key={pres.id} className="prescription-card glass-card">
//               <div className="prescription-header">
//                 <div className="pill-icon"></div>
//                 <div className="prescription-title">
//                   <h3>{pres.medication}</h3>
//                   <span className="date">
//                     {new Date(pres.date).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>

//               <div className="prescription-body">
//                 <p>
//                   <strong>👨‍⚕️ Prescribed by:</strong> Dr. {pres.doctor_name}
//                 </p>
//                 <p>
//                   <strong>💉 Dosage:</strong> {pres.dosage}
//                 </p>
//                 <p>
//                   <strong>🕒 Duration:</strong> {pres.duration || "7 days"}
//                 </p>
//                 <p>
//                   <strong>📋 Instructions:</strong> {pres.instructions}
//                 </p>

//                 {pres.lab_test_required && (
//                   <div className="lab-test-alert">
//                     ⚠️ <strong>Lab Test Required:</strong> {pres.lab_test_name}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (view === "lab-reports") {
//   return (
//     <div className="section">
//       <h2
//         style={{
//           fontSize: "1.8rem",
//           marginBottom: "1.5rem",
//           color: "#333",
//           fontWeight: "700",
//           textAlign: "center",
//         }}
//       >
//         Lab Reports
//       </h2>

//       <div
//         className="lab-reports-list"
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: "20px", // spacing between cards
//           maxWidth: "800px",
//           margin: "0 auto",
//         }}
//       >
//         {labReports.length === 0 && (
//           <p
//             style={{
//               textAlign: "center",
//               color: "#777",
//               fontSize: "1rem",
//               marginTop: "2rem",
//             }}
//           >
//             No lab reports available.
//           </p>
//         )}

//         {labReports.map((report) => (
//           <div
//             key={report.id}
//             className="lab-report-card"
//             style={{
//               background: "#fff",
//               borderRadius: "12px",
//               padding: "20px 24px",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//               border: "1px solid #eee",
//               transition: "transform 0.2s ease, box-shadow 0.2s ease",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = "translateY(-3px)";
//               e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.08)";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = "translateY(0)";
//               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
//             }}
//           >
//             <div
//               className="report-header"
//               style={{
//                 borderBottom: "1px solid #f1f1f1",
//                 paddingBottom: "8px",
//                 marginBottom: "12px",
//               }}
//             >
//               <h3
//                 style={{
//                   margin: 0,
//                   fontSize: "1.2rem",
//                   fontWeight: "600",
//                   color: "#4b4b4b",
//                 }}
//               >
//                 {report.test_name}
//               </h3>
//             </div>

//             <div
//               className="report-body"
//               style={{ color: "#555", lineHeight: "1.6" }}
//             >
//               <p>
//                 <strong>Test Date:</strong>{" "}
//                 {new Date(report.date).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Ordered by:</strong> Dr.{" "}
//                 {doctors.find(
//                   (d) =>
//                     d.id === report.doctor_id || d.name === report.doctor_name
//                 )?.name ||
//                   report.doctor_name ||
//                   "Unknown Doctor"}
//               </p>
//               {(report.notes || report.report_notes || report.lab_notes) && (
//                 <p style={{ marginTop: "8px" }}>
//                   <strong>Doctor’s Notes:</strong>{" "}
//                   {report.notes || report.report_notes || report.lab_notes}
//                 </p>
//               )}
//             </div>

//             {/* ✅ Only show Download button if report is sent */}
//             {report.status === "Report Sent" && report.report_url && (
//               <div
//                 className="report-actions"
//                 style={{
//                   marginTop: "16px",
//                   textAlign: "right",
//                 }}
//               >
//                 <a
//                   href={report.report_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style={{
//                     background: "#4f46e5",
//                     color: "#fff",
//                     padding: "8px 14px",
//                     borderRadius: "8px",
//                     textDecoration: "none",
//                     fontSize: "0.9rem",
//                     fontWeight: "500",
//                     transition: "background 0.2s ease",
//                   }}
//                   onMouseEnter={(e) =>
//                     (e.currentTarget.style.background = "#3730a3")
//                   }
//                   onMouseLeave={(e) =>
//                     (e.currentTarget.style.background = "#4f46e5")
//                   }
//                 >
//                   📄 Download Report
//                 </a>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



//   // Main Dashboard
//   return (
//     <div className="section">
//       <h2>Welcome, {currentUser?.name}!</h2>

//       <div className="stats-grid">
//         <div
//           className="stat-card clickable"
//           onClick={() => setView("my-appointments")}
//         >
//           <div className="stat-icon">📅</div>
//           <h3>Upcoming Appointments</h3>
//           <p className="stat-number">
//             {
//               appointments.filter(
//                 (a) =>
//                   new Date(a.date) >= new Date() && a.status === "Scheduled"
//               ).length
//             }
//           </p>
//         </div>

//         <div
//           className="stat-card clickable"
//           onClick={() => setView("available-doctors")}
//         >
//           <div className="stat-icon">👨‍⚕️</div>
//           <h3>All Doctors</h3>
//           <p className="stat-number">{doctors.length}</p>
//         </div>

//         <div
//           className="stat-card clickable"
//           onClick={() => setView("lab-reports")}
//         >
//           <div className="stat-icon">🔬</div>
//           <h3>Lab Reports</h3>
//           <p className="stat-number">{labReports.length}</p>
//         </div>

//         <div
//           className="stat-card clickable"
//           onClick={() => setView("prescriptions")}
//         >
//           <div className="stat-icon">📝</div>
//           <h3>Active Prescriptions</h3>
//           <p className="stat-number">{prescriptions.length}</p>
//         </div>
//       </div>
//     </div>
//   );
// };


// frontend/src/components/dashboard/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { apiService } from "../../services/api";

export const PatientDashboard = () => {
  const {
    view,
    setView,
    currentUser,
    showMessage,
    refresh,
    openModal,
    closeModal,
    triggerRefresh,
  } = useApp();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");


  // ⭐ ADD THESE EXACTLY HERE (inside PatientDashboard function)
const handleReschedule = async (appointmentId, newData) => {
  try {
    await apiService.updateAppointment(appointmentId, newData);
    showMessage("success", "Appointment rescheduled successfully");
    triggerRefresh();
  } catch (err) {
    console.error("Reschedule Error:", err);
    showMessage("error", "Failed to reschedule appointment");
  }
};

const handleDeleteAppointment = async (appointmentId) => {
  try {
    await apiService.deleteAppointment(appointmentId);
    showMessage("success", "Appointment cancelled successfully");
    triggerRefresh();
  } catch (err) {
    console.error("Delete Error:", err);
    showMessage("error", "Failed to cancel appointment");
  }
};

// ⭐ UPDATE APPOINTMENT MODAL COMPONENT
// UpdateAppointment modal — replace your old UpdateAppointment with this
const UpdateAppointment = ({ appointment }) => {
  const doctorId =
    appointment.doctor_id ||
    appointment.doctorId ||
    appointment.doctor?.id ||
    appointment.doctor?.doctor_id ||
    "";

  const todayStr = new Date().toISOString().split("T")[0];
  const FULL_DAY_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const [date, setDate] = useState(appointment.date || todayStr);
  const [time, setTime] = useState(appointment.time ? appointment.time.slice(0,5) : "");
  const [reason, setReason] = useState(appointment.reason || "");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const normalizeTime = (t) => {
    if (!t) return "";
    return t.length === 8 ? t.slice(0,5) : t.slice(0,5);
  };

  // fetch booked slots and available slots whenever date or doctorId changes
  useEffect(() => {
    if (!doctorId || !date) return;

    let mounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);

      try {
        // fetch booked (appointments) for that doctor + date
        const appts = await apiService.getAppointments({
          doctorId,
          date
        });
        const booked = Array.isArray(appts) ? appts.map(a => normalizeTime(a.time)) : [];
        if (!mounted) return;
        setBookedSlots(booked);
      } catch (err) {
        if (!mounted) return;
        setBookedSlots([]);
        console.warn("Could not fetch booked slots", err);
      }

      try {
        // fetch available slots from API (backend: getAvailableSlots)
        const slots = await apiService.getAvailableSlots(doctorId, date);
        // If backend returns empty array, fallback to FULL_DAY_SLOTS so UI still shows something.
        const normalized = Array.isArray(slots) && slots.length > 0 ? slots.map(s => normalizeTime(s)) : FULL_DAY_SLOTS;
        if (!mounted) return;
        setAvailableSlots(normalized);
      } catch (err) {
        if (!mounted) return;
        // fallback
        setAvailableSlots(FULL_DAY_SLOTS);
        console.warn("Could not fetch available slots", err);
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => { mounted = false; };
  }, [doctorId, date]);

  // compute slots to show: available minus booked, and remove past slots if date is today
  const getFilteredSlots = () => {
    const normalizedAvailable = availableSlots.map(s => normalizeTime(s)).filter(Boolean);
    const dedup = [...new Set(normalizedAvailable)];
    const free = dedup.filter(s => !bookedSlots.includes(s));

    if (date !== todayStr) return free;

    const now = new Date();
    return free.filter(slot => {
      const [h, m] = slot.split(":").map(Number);
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);
      return slotTime > now;
    });
  };

  const filteredSlots = getFilteredSlots();

  const isSelected = (s) => normalizeTime(time) === normalizeTime(s);

  const handleUpdate = async () => {
    if (!date || !time) {
      showMessage && showMessage("error", "Please choose date and time");
      return;
    }

    // normalize before sending (HH:MM:SS)
    const normalizedTimeForBackend = time.length === 8 ? time : `${time}:00`;

    try {
      await apiService.updateAppointment(appointment.id, {
        date,
        time: normalizedTimeForBackend,
        reason: reason || undefined
      });
      showMessage && showMessage("success", "Appointment updated successfully");
      closeModal && closeModal();
      triggerRefresh && triggerRefresh();
    } catch (err) {
      console.error("Update Appointment error", err);
      showMessage && showMessage("error", "Failed to update appointment");
    }
  };

  // min date for date picker
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="update-form" style={{ maxWidth: 520 }}>
      <h3 style={{ marginTop: 0 }}>Reschedule Appointment</h3>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={minDate}
          className="styled-input"
        />
      </div>

      <div className="form-group">
        <label>Available Time Slots</label>
        <div className="slot-grid" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {loadingSlots && <div style={{ color: "#666" }}>Loading slots…</div>}

          {!loadingSlots && filteredSlots.length === 0 && (
            <div style={{ color: "#777" }}>No available slots for selected date</div>
          )}

          {!loadingSlots && filteredSlots.map((slot) => {
            const disabled = bookedSlots.includes(slot);
            return (
              <button
                key={slot}
                type="button"
                className={`slot-btn ${isSelected(slot) ? "selected" : ""} ${disabled ? "disabled-slot" : ""}`}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) setTime(slot);
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: isSelected(slot) ? "2px solid #6d6af0" : "1px solid #e6e6e6",
                  background: isSelected(slot) ? "#eef2ff" : "#fff",
                  cursor: disabled ? "not-allowed" : "pointer"
                }}
              >
                {slot}
                {disabled ? " (Booked)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label>Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="styled-textarea"
        />
      </div>

      <div className="form-actions" style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleUpdate} className="btn btn-primary">
          Save Changes
        </button>
        <button onClick={() => closeModal && closeModal()} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};







  useEffect(() => {
    fetchAllData();
  }, [refresh, view]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [
        appointmentsRes,
        doctorsRes,
        labReportsRes,
        prescriptionsRes,
      ] = await Promise.all([
        apiService.getAppointments({ patientId: currentUser.id }),
        apiService.getDoctors(),
        apiService.getLabTests({ patientId: currentUser.id }),
        apiService.getPrescriptions({ patientId: currentUser.id }),
      ]);

      setAppointments(appointmentsRes || []);

      setDoctors(
        Array.isArray(doctorsRes)
          ? doctorsRes
          : doctorsRes?.doctors || doctorsRes?.data || []
      );

      setLabReports(labReportsRes || []);
      setPrescriptions(prescriptionsRes || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  //  🚀 BOOK APPOINTMENT (MAIN WORKING VERSION)
  // -----------------------------------------------
  if (view === "book-appointment") {
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);

    // Full working hours except lunch (Option 2)
    const FULL_DAY_SLOTS = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    const normalizeTime = (t) =>
      t?.length === 8 ? t.slice(0, 5) : t;

    // Fetch booked + available in same effect
    useEffect(() => {
      if (!selectedDoctor || !selectedDate) return;

      const fetchBookedSlots = async () => {
        try {
          const appts = await apiService.getAppointments({
            doctorId: selectedDoctor,
            date: selectedDate,
          });

          setBookedSlots(appts.map((a) => normalizeTime(a.time)));
        } catch {
          setBookedSlots([]);
        }
      };

      const fetchAvailableSlots = async () => {
        try {
          const slots = await apiService.getAvailableSlots(
            selectedDoctor,
            selectedDate
          );

          setAvailableSlots(slots.length > 0 ? slots : FULL_DAY_SLOTS);
        } catch {
          setAvailableSlots(FULL_DAY_SLOTS);
        }
      };

      fetchBookedSlots();
      fetchAvailableSlots();
    }, [selectedDoctor, selectedDate]);

    // Remove past slots (today only)
    const getFilteredSlots = () => {
      const normalizedAvailable = availableSlots.map((t) =>
        normalizeTime(t)
      );

      const todayStr = new Date().toISOString().split("T")[0];

      let filtered = normalizedAvailable;

      if (selectedDate === todayStr) {
        const now = new Date();

        filtered = filtered.filter((slot) => {
          const [h, m] = slot.split(":");
          const slotTime = new Date();
          slotTime.setHours(h, m, 0, 0);
          return slotTime > now;
        });
      }

      return filtered;
    };

    const filteredSlots = getFilteredSlots();
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    const handleBooking = async () => {
      try {
        await apiService.createAppointment({
          patientId: currentUser.id,
          doctorId: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
          reason,
          status: "Scheduled",
        });

        showMessage("success", "Appointment booked successfully!");
        triggerRefresh();
        setView("my-appointments");
      } catch {
        showMessage("error", "Failed to book appointment");
      }
    };

    const isBooked = (slot) =>
      bookedSlots.includes(slot);

    const isPastSlot = (slot) => {
      const todayStr = new Date().toISOString().split("T")[0];
      if (selectedDate !== todayStr) return false;

      const now = new Date();
      const [h, m] = slot.split(":");
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);
      return slotTime <= now;
    };

    return (
      <div className="section book-appointment-page">
        <h2 className="page-title">🩺 Book New Appointment</h2>

        <div className="booking-card glass-card">
          {/* Doctor Selection */}
          <div className="form-group">
            <label>Select Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="styled-select"
            >
              <option value="">Choose a Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                   {doc.name} — {doc.specialization || "General Medicine"}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              className="styled-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
            />
          </div>

          {/* Time Slots */}
          {selectedDoctor && selectedDate && (
            <div className="form-group">
              <label>Available Time Slots</label>

              <div className="slot-grid">
                {filteredSlots.length === 0 && (
                  <p className="no-slots">No available slots</p>
                )}

                {FULL_DAY_SLOTS.map((slot) => {
                  const normalized = slot;

                  const disabled =
                    isBooked(normalized) || isPastSlot(normalized);

                  return (
                    <button
                      key={slot}
                      className={`slot-btn ${
                        selectedTime === slot ? "selected" : ""
                      } ${disabled ? "disabled-slot" : ""}`}
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedTime(slot)}
                    >
                      {slot}
                      {isBooked(normalized) && " (Booked)"}
                      {isPastSlot(normalized) && " (Past)"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea
              className="styled-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for visit"
              rows="3"
            />
          </div>

          {/* Summary */}
          {selectedTime && (
            <div className="booking-summary">
              <h3>Appointment Summary</h3>
              <p>
                <strong>Doctor:</strong>{" "}
                {doctors.find((d) => d.id == selectedDoctor)?.name}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {selectedTime}
              </p>

              <button
                onClick={handleBooking}
                className="btn btn-primary confirm-btn"
              >
                ✅ Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  //  🚀 REMAINDER OF YOUR FILE — UNCHANGED
  // -----------------------------------------------------

  if (view === "available-doctors") {
    return (
      <div className="section doctors-page">
        <div className="doctors-grid">
          {doctors.length === 0 && (
            <p className="no-data">No doctors available right now.</p>
          )}

          {doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card glass-card">
              <div className="doctor-avatar">
                {doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <p className="specialization">
                  🩺 {doctor.specialization || "General Medicine"}
                </p>
                <p className="qualification">
                  🎓 {doctor.qualification || "MBBS"}
                </p>

                <div className="working-hours">
                  <p>
                    <strong>Working Hours:</strong>
                  </p>
                  <p>Mon – Fri : 9 AM – 5 PM</p>
                  <p>Sat : 9 AM – 1 PM</p>
                </div>

                <button
                  onClick={() => setView("book-appointment")}
                  className="btn btn-primary book-btn"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "my-appointments") {
    const upcomingAppointments = appointments.filter(
      (a) => new Date(a.date) >= new Date() && a.status !== "Cancelled"
    );
    const pastAppointments = appointments.filter(
      (a) => new Date(a.date) < new Date() || a.status === "Completed"
    );
    const cancelledAppointments = appointments.filter(
      (a) => a.status === "Cancelled"
    );

    return (
      <div className="section appointments-page">
        <h2 className="page-title">📅 My Appointments</h2>

        <div className="appointment-tabs">
          <button
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past ({pastAppointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled ({cancelledAppointments.length})
          </button>
        </div>

        <div className="appointments-list">
          {loading ? (
            <p className="loading-text">Loading appointments...</p>
          ) : (
            <>
              {activeTab === "upcoming" &&
                upcomingAppointments.length === 0 && (
                  <p className="no-data">No upcoming appointments</p>
                )}

              {activeTab === "past" && pastAppointments.length === 0 && (
                <p className="no-data">No past appointments</p>
              )}

              {activeTab === "cancelled" &&
                cancelledAppointments.length === 0 && (
                  <p className="no-data">No cancelled appointments</p>
                )}

              {activeTab === "upcoming" &&
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-card glass-card">
                    <div className="appointment-header">
                      <h3>🩺 {apt.doctor_name}</h3>
                      <span
                        className={`status-badge ${apt.status.toLowerCase()}`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="appointment-body">
                      <p>
                        📆 <strong>Date:</strong>{" "}
                        {new Date(apt.date).toLocaleDateString()}
                      </p>
                      <p>
                        ⏰ <strong>Time:</strong> {apt.time}
                      </p>
                      <p>
                        📝 <strong>Reason:</strong>{" "}
                        {apt.reason || "General Consultation"}
                      </p>
                      <p>
                        💰 <strong>Payment:</strong>{" "}
                        {apt.payment_status || "Pending"}
                      </p>
                    </div>

                    <div className="appointment-actions">
                      <button
                        onClick={() =>
                          openModal(
                            "Update Appointment",
                            <UpdateAppointment appointment={apt} />
                          )
                        }
                        className="btn btn-edit"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}

              {activeTab === "past" &&
                pastAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-card glass-card past">
                    <div className="appointment-header">
                      <h3> {apt.doctor_name}</h3>
                      <span className="status-badge completed">
                        {apt.status}
                      </span>
                    </div>

                    <div className="appointment-body">
                      <p>📆 {new Date(apt.date).toLocaleDateString()}</p>
                      <p>⏰ {apt.time}</p>
                      <p>📝 {apt.reason || "General Consultation"}</p>
                    </div>
                  </div>
                ))}

              {activeTab === "cancelled" &&
                cancelledAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="appointment-card glass-card cancelled"
                  >
                    <div className="appointment-header">
                      <h3> {apt.doctor_name}</h3>
                      <span className="status-badge cancelled">Cancelled</span>
                    </div>

                    <div className="appointment-body">
                      <p>📆 {new Date(apt.date).toLocaleDateString()}</p>
                      <p>⏰ {apt.time}</p>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === "prescriptions") {
    return (
      <div className="section prescriptions-page">
        <h2 className="page-title"> My Prescriptions</h2>

        <div className="prescriptions-grid">
          {prescriptions.length === 0 && (
            <p className="no-data">No prescriptions found.</p>
          )}

          {prescriptions.map((pres) => (
            <div key={pres.id} className="prescription-card glass-card">
              <div className="prescription-header">
                <div className="pill-icon"></div>
                <div className="prescription-title">
                  <h3>{pres.medication}</h3>
                  <span className="date">
                    {new Date(pres.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="prescription-body">
                <p>
                  <strong>👨‍⚕️ Prescribed by:</strong> {pres.doctor_name}
                </p>
                <p>
                  <strong>💉 Dosage:</strong> {pres.dosage}
                </p>
                <p>
                  <strong>🕒 Duration:</strong> {pres.duration || "7 days"}
                </p>
                <p>
                  <strong>📋 Instructions:</strong> {pres.instructions}
                </p>

                {pres.lab_test_required && (
                  <div className="lab-test-alert">
                    ⚠️ <strong>Lab Test Required:</strong> {pres.lab_test_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const resolveDoctorName = (report) => {
  const doctorId =
    report.doctor_id ||
    report.doctorId ||
    report.ordered_by ||
    report.orderedById ||
    null;

  // Match doctor by ID
  if (doctorId) {
    const found = doctors.find(d => String(d.id) === String(doctorId));
    if (found) return found.name;
  }

  // Match doctor by name (fallback)
  if (report.doctor_name) return report.doctor_name;
  if (report.doctorName) return report.doctorName;

  return "Unknown Doctor";
};


  if (view === "lab-reports") {
  return (
    <div className="section">
      <h2>Lab Reports</h2>

      <div className="lab-reports-list">
        {labReports.length === 0 && (
          <p className="no-data">No lab reports available.</p>
        )}

        {labReports.map((report) => (
          <div key={report.id} className="lab-report-card">
            <h3>{report.test_name}</h3>

            <p>
              <strong>Test Date:</strong>{" "}
              {new Date(report.date).toLocaleDateString()}
            </p>

            <p>
              <strong>Ordered by:</strong> {resolveDoctorName(report)}
            </p>

            {/* SHOW REPORT NOTES */}
            {(report.notes || report.report_notes || report.lab_notes) && (
              <p style={{ marginTop: "8px" }}>
                <strong>Report:</strong>{" "}
                {report.report_notes }
              </p>
            )}

            {/* DOWNLOAD REPORT BUTTON */}
            {report.report_url && (
              <a
                href={report.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ marginTop: "10px", display: "inline-block" }}
              >
                📄 Download Report
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


  // Main Dashboard unchanged
  return (
    <div className="section">
      <h2>Welcome, {currentUser?.name}!</h2>

      <div className="stats-grid">
        <div
          className="stat-card clickable"
          onClick={() => setView("my-appointments")}
        >
          <div className="stat-icon">📅</div>
          <h3>Upcoming Appointments</h3>
          <p className="stat-number">
            {
              appointments.filter(
                (a) =>
                  new Date(a.date) >= new Date() &&
                  a.status === "Scheduled"
              ).length
            }
          </p>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => setView("available-doctors")}
        >
          <div className="stat-icon">👨‍⚕️</div>
          <h3>All Doctors</h3>
          <p className="stat-number">{doctors.length}</p>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => setView("lab-reports")}
        >
          <div className="stat-icon">🔬</div>
          <h3>Lab Reports</h3>
          <p className="stat-number">{labReports.length}</p>
        </div>

        <div
          className="stat-card clickable"
          onClick={() => setView("prescriptions")}
        >
          <div className="stat-icon">📝</div>
          <h3>Prescriptions</h3>
          <p className="stat-number">{prescriptions.length}</p>
        </div>
      </div>
    </div>
  );
};
