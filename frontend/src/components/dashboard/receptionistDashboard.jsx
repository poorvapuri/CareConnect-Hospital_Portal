// frontend/src/components/dashboard/ReceptionistDashboard.jsx
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { apiService } from "../../services/api";

export const ReceptionistDashboard = () => {
  const { view, setView, showMessage, refresh, triggerRefresh } = useApp();

  const [doctors, setDoctors] = useState([]);
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [refresh]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, appointmentsRes] = await Promise.all([
        apiService.getDoctors(),
        apiService.getAppointments({ date: today }),
      ]);
      setDoctors(doctorsRes || []);
      setAppointmentsToday(appointmentsRes || []);
    } catch (err) {
      console.error(err);
      showMessage("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (appointmentId) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, "Paid");
      showMessage("success", "Payment marked as paid");
      triggerRefresh();
    } catch (err) {
      console.error(err);
      showMessage("error", "Failed to update payment status");
    }
  };

  // --------------------------
  // 1️⃣ DASHBOARD VIEW
  // --------------------------
  const DashboardView = () => (
    <div className="section receptionist-dashboard">
      <h2>Reception Dashboard</h2>

      <div className="stats-grid two-cards">
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <h3>All Doctors</h3>
          <p className="stat-number">{doctors.length}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <h3>Today's Appointments</h3>
          <p className="stat-number">{appointmentsToday.length}</p>
        </div>
      </div>
    </div>
  );

  // --------------------------
  // 2️⃣ TODAY'S APPOINTMENTS VIEW
  // --------------------------
  const AppointmentsView = () => (
    <div className="section">
      <h2>Today's Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : appointmentsToday.length === 0 ? (
        <p>No appointments today.</p>
      ) : (
        <div className="appointments-list">
          {appointmentsToday.map((apt) => (
            <div key={apt.id} className="appointment-item">
              <div>
                <h4>{apt.patient_name}</h4>
                <p>Dr. {apt.doctor_name}</p>
                <p>Time: {apt.time}</p>
              </div>
              <div className="appointment-status">
                <span>{apt.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --------------------------
  // 3️⃣ BILLING VIEW
  // --------------------------
  const BillingView = () => {
    const unpaid = appointmentsToday.filter(
      (a) => a.payment_status !== "Paid"
    );
    const paid = appointmentsToday.filter(
      (a) => a.payment_status === "Paid"
    );

    const [tab, setTab] = useState("unpaid");

    return (
      <div className="section">
        <h2>Billing & Payments</h2>

        {/* Tabs */}
        <div className="payment-tabs">
          <button
            className={tab === "unpaid" ? "active" : ""}
            onClick={() => setTab("unpaid")}
          >
            Unpaid
          </button>

          <button
            className={tab === "paid" ? "active" : ""}
            onClick={() => setTab("paid")}
          >
            Paid
          </button>
        </div>

        {/* Content */}
        {tab === "unpaid" && (
          <div className="payment-section">
            {unpaid.length === 0 ? (
              <p>No unpaid appointments.</p>
            ) : (
              unpaid.map((apt) => (
                <div key={apt.id} className="payment-item">
                  <div>
                    <h4>{apt.patient_name}</h4>
                    <p>Dr. {apt.doctor_name}</p>
                    <p>Time: {apt.time}</p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => markAsPaid(apt.id)}
                  >
                    Mark as Paid
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "paid" && (
          <div className="payment-section">
            {paid.length === 0 ? (
              <p>No paid appointments.</p>
            ) : (
              paid.map((apt) => (
                <div key={apt.id} className="payment-item paid">
                  <div>
                    <h4>{apt.patient_name}</h4>
                    <p>Dr. {apt.doctor_name}</p>
                    <p>Time: {apt.time}</p>
                  </div>
                  <span className="paid-badge">Paid</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // --------------------------
  // TOP NAVIGATION
  // --------------------------
  const TopNav = () => (
    <div className="top-nav">
      <span
        className={view === "dashboard" ? "active" : ""}
        onClick={() => setView("dashboard")}
      >
        Dashboard
      </span>

      <span
        className={view === "appointments" ? "active" : ""}
        onClick={() => setView("appointments")}
      >
        Appointments
      </span>

      <span
        className={view === "billing" ? "active" : ""}
        onClick={() => setView("billing")}
      >
        Billing & Payments
      </span>
    </div>
  );

  // --------------------------
  // ROUTING
  // --------------------------
  return (
    <div>
      <TopNav />

      {view === "dashboard" && <DashboardView />}
      {view === "appointments" && <AppointmentsView />}
      {view === "billing" && <BillingView />}
    </div>
  );
};

export default ReceptionistDashboard;
