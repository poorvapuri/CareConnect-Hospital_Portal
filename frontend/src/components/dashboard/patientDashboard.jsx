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

  useEffect(() => {
    fetchAllData();
  }, [refresh, view]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes, labReportsRes, prescriptionsRes] =
        await Promise.all([
          apiService.getAppointments({ patientId: currentUser.id }),
          apiService.getDoctors(),
          apiService.getLabTests({ patientId: currentUser.id }),
          apiService.getPrescriptions({ patientId: currentUser.id }),
        ]);

      setAppointments(appointmentsRes || []);
      setDoctors(doctorsRes || []);
      setLabReports(labReportsRes || []);
      setPrescriptions(prescriptionsRes || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE Appointment
  const BookAppointment = () => {
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
      if (selectedDoctor && selectedDate) {
        fetchAvailableSlots();
      }
    }, [selectedDoctor, selectedDate]);

    const fetchAvailableSlots = async () => {
      try {
        const slots = await apiService.getAvailableSlots(
          selectedDoctor,
          selectedDate
        );
        setAvailableSlots(slots);
      } catch (error) {
        setAvailableSlots([
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00",
        ]);
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
          status: "Scheduled",
        });
        showMessage("success", "Appointment booked successfully!");
        triggerRefresh();
        setView("my-appointments");
      } catch (error) {
        showMessage("error", "Failed to book appointment");
      }
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

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
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} - {doc.specialization || "General Medicine"}
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
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`time-slot ${
                      selectedTime === slot ? "selected" : ""
                    }`}
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
              <button onClick={handleBooking} className="btn-primary">
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
    const [reason, setReason] = useState(appointment.reason || "");

    const handleUpdate = async () => {
      try {
        await apiService.updateAppointment(appointment.id, {
          date,
          time,
          reason,
        });
        showMessage("success", "Appointment updated successfully");
        closeModal();
        triggerRefresh();
      } catch (error) {
        showMessage("error", "Failed to update appointment");
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
            min={new Date().toISOString().split("T")[0]}
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
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await apiService.deleteAppointment(appointmentId);
        showMessage("success", "Appointment cancelled successfully");
        triggerRefresh();
      } catch (error) {
        showMessage("error", "Failed to cancel appointment");
      }
    }
  };

  // View Handlers
  if (view === "book-appointment") {
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
      if (selectedDoctor && selectedDate) fetchAvailableSlots();
    }, [selectedDoctor, selectedDate]);

    const fetchAvailableSlots = async () => {
      try {
        const slots = await apiService.getAvailableSlots(
          selectedDoctor,
          selectedDate
        );
        setAvailableSlots(slots);
      } catch {
        setAvailableSlots([
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00",
        ]);
      }
    };

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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
      <div className="section book-appointment-page">
        <h2 className="page-title">🩺 Book New Appointment</h2>

        <div className="booking-card glass-card">
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
                  Dr. {doc.name} — {doc.specialization || "General Medicine"}
                </option>
              ))}
            </select>
          </div>

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

          {selectedDoctor && selectedDate && (
            <div className="form-group">
              <label>Available Time Slots</label>
              <div className="slot-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`slot-btn ${
                      selectedTime === slot ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                      <h3>🩺 Dr. {apt.doctor_name}</h3>
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
                  <div
                    key={apt.id}
                    className="appointment-card glass-card past"
                  >
                    <div className="appointment-header">
                      <h3>Dr. {apt.doctor_name}</h3>
                      <span className="status-badge completed">
                        {apt.status}
                      </span>
                    </div>
                    <div className="appointment-body">
                      <p>📆 {new Date(apt.date).toLocaleDateString()}</p>
                      <p>⏰ {apt.time}</p>
                      <p>📝 {apt.reason || "General Consultation"}</p>
                    </div>
                    <div className="appointment-actions">
                      <button className="btn btn-primary btn-small">
                        View Details
                      </button>
                      <button
                        onClick={() => setView("prescriptions")}
                        className="btn btn-secondary btn-small"
                      >
                        View Prescription
                      </button>
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
                      <h3>Dr. {apt.doctor_name}</h3>
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
                  <strong>👨‍⚕️ Prescribed by:</strong> Dr. {pres.doctor_name}
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

  if (view === "lab-reports") {
  return (
    <div className="section">
      <h2
        style={{
          fontSize: "1.8rem",
          marginBottom: "1.5rem",
          color: "#333",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        Lab Reports
      </h2>

      <div
        className="lab-reports-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px", // spacing between cards
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {labReports.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "#777",
              fontSize: "1rem",
              marginTop: "2rem",
            }}
          >
            No lab reports available.
          </p>
        )}

        {labReports.map((report) => (
          <div
            key={report.id}
            className="lab-report-card"
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              border: "1px solid #eee",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
            }}
          >
            <div
              className="report-header"
              style={{
                borderBottom: "1px solid #f1f1f1",
                paddingBottom: "8px",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#4b4b4b",
                }}
              >
                {report.test_name}
              </h3>
            </div>

            <div
              className="report-body"
              style={{ color: "#555", lineHeight: "1.6" }}
            >
              <p>
                <strong>Test Date:</strong>{" "}
                {new Date(report.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Ordered by:</strong> Dr.{" "}
                {doctors.find(
                  (d) =>
                    d.id === report.doctor_id || d.name === report.doctor_name
                )?.name ||
                  report.doctor_name ||
                  "Unknown Doctor"}
              </p>
              {(report.notes || report.report_notes || report.lab_notes) && (
                <p style={{ marginTop: "8px" }}>
                  <strong>Doctor’s Notes:</strong>{" "}
                  {report.notes || report.report_notes || report.lab_notes}
                </p>
              )}
            </div>

            {/* ✅ Only show Download button if report is sent */}
            {report.status === "Report Sent" && report.report_url && (
              <div
                className="report-actions"
                style={{
                  marginTop: "16px",
                  textAlign: "right",
                }}
              >
                <a
                  href={report.report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#4f46e5",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#3730a3")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#4f46e5")
                  }
                >
                  📄 Download Report
                </a>
              </div>
            )}
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
          onClick={() => setView("my-appointments")}
        >
          <div className="stat-icon">📅</div>
          <h3>Upcoming Appointments</h3>
          <p className="stat-number">
            {
              appointments.filter(
                (a) =>
                  new Date(a.date) >= new Date() && a.status === "Scheduled"
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
          <h3>Active Prescriptions</h3>
          <p className="stat-number">{prescriptions.length}</p>
        </div>
      </div>
    </div>
  );
};
