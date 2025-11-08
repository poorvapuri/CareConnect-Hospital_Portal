import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { AppointmentManagement } from '../appointments/AppointmentManagement';
import { CheckInManagement } from '../appointments/CheckInManagement';

export const ReceptionistDashboard = () => {
  const { view, showMessage, refresh } = useApp();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingCheckIns, setPendingCheckIns] = useState([]);
  const [billingItems, setBillingItems] = useState([]);
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    pendingCheckIns: 0,
    completedToday: 0,
    totalBilled: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's appointments
      const appointments = await apiService.getAppointments({ date: today });
      setTodayAppointments(appointments);
      
      // Filter pending check-ins
      const pending = appointments.filter(apt => apt.status === 'Scheduled');
      setPendingCheckIns(pending);
      
      // Calculate stats
      setStats({
        totalCheckIns: appointments.length,
        pendingCheckIns: pending.length,
        completedToday: appointments.filter(apt => apt.status === 'Completed').length,
        totalBilled: appointments.length * 500 // Mock calculation
      });
      
      // Fetch billing items (prescriptions and lab tests)
      const prescriptions = await apiService.getPrescriptions();
      const labTests = await apiService.getLabTests();
      
      setBillingItems([
        ...prescriptions.map(p => ({ ...p, type: 'prescription', amount: 50 })),
        ...labTests.map(l => ({ ...l, type: 'lab', amount: 150 }))
      ]);
      
    } catch (error) {
      showMessage('error', 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'appointments') {
    return <AppointmentManagement />;
  }

  if (view === 'checkin') {
    return <CheckInManagement />;
  }

  if (view === 'billing') {
    return (
      <div className="section">
        <h2>Billing Management</h2>
        <div className="billing-container">
          <div className="billing-summary">
            <div className="summary-card">
              <h3>Today's Total</h3>
              <p className="amount">${stats.totalBilled}</p>
            </div>
            <div className="summary-card">
              <h3>Pending Payments</h3>
              <p className="amount">$1,250</p>
            </div>
            <div className="summary-card">
              <h3>Completed Payments</h3>
              <p className="amount">$3,750</p>
            </div>
          </div>

          <div className="billing-table">
            <h3>Recent Billing Items</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingItems.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{item.patient_name || 'Patient Name'}</td>
                    <td>{item.type}</td>
                    <td>
                      {item.type === 'prescription' ? item.medication : item.test_name}
                    </td>
                    <td>${item.amount}</td>
                    <td>
                      <span className="status Pending">Pending</span>
                    </td>
                    <td>
                      <button className="btn-small">Process</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Receptionist Dashboard</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Today's Appointments</h3>
              <p className="stat-number">{stats.totalCheckIns}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Check-ins</h3>
              <p className="stat-number">{stats.pendingCheckIns}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Today</h3>
              <p className="stat-number">{stats.completedToday}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Billing</h3>
              <p className="stat-number">${stats.totalBilled}</p>
            </div>
          </div>

          <div className="reception-grid">
            <div className="pending-checkins">
              <h3>Pending Check-ins</h3>
              <div className="checkin-list">
                {pendingCheckIns.map(apt => (
                  <div key={apt.id} className="checkin-item">
                    <div className="patient-info">
                      <strong>{apt.patient_name}</strong>
                      <small>{apt.time} - Dr. {apt.doctor_name}</small>
                    </div>
                    <button 
                      className="btn-primary btn-small"
                      onClick={() => {
                        apiService.updateAppointmentStatus(apt.id, 'Checked-In');
                        showMessage('success', 'Patient checked in');
                        fetchDashboardData();
                      }}
                    >
                      Check In
                    </button>
                  </div>
                ))}
                {pendingCheckIns.length === 0 && (
                  <p className="no-data">No pending check-ins</p>
                )}
              </div>
            </div>

            <div className="today-schedule">
              <h3>Today's Schedule</h3>
              <div className="schedule-timeline">
                {todayAppointments.map(apt => (
                  <div key={apt.id} className="timeline-item">
                    <span className="time">{apt.time}</span>
                    <div className="appointment-info">
                      <strong>{apt.patient_name}</strong>
                      <small>Dr. {apt.doctor_name}</small>
                    </div>
                    <span className={`status ${apt.status}`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button onClick={() => setView('appointments')} className="btn-primary">
                Book Walk-in Appointment
              </button>
              <button onClick={() => setView('checkin')} className="btn-secondary">
                Manage Check-ins
              </button>
              <button onClick={() => setView('billing')} className="btn-secondary">
                View Billing
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};