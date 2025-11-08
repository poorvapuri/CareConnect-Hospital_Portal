import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { EmployeeManagement } from '../admin/EmployeeManagement';

export const AdminDashboard = () => {
  const { view, showMessage, refresh } = useApp();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalDoctors: 0,
    totalRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employees = await apiService.getEmployees();
      const doctors = employees.filter(emp => emp.role === 'Doctor');
      
      // Fetch patients
      const patients = await apiService.getPatients();
      
      // Fetch appointments
      const appointments = await apiService.getAppointments();
      const today = new Date().toISOString().split('T')[0];
      const todayApts = appointments.filter(apt => apt.date.split('T')[0] === today);
      
      setStats({
        totalEmployees: employees.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        todayAppointments: todayApts.length,
        totalDoctors: doctors.length,
        totalRevenue: appointments.length * 500 // Mock calculation
      });
      
      setAllAppointments(appointments);
      
      // Mock recent activities
      setRecentActivities([
        { id: 1, action: 'New patient registered', time: '5 minutes ago', type: 'patient' },
        { id: 2, action: 'Appointment completed', time: '1 hour ago', type: 'appointment' },
        { id: 3, action: 'Lab report uploaded', time: '2 hours ago', type: 'lab' },
        { id: 4, action: 'New employee added', time: '3 hours ago', type: 'employee' }
      ]);
      
    } catch (error) {
      showMessage('error', 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'employees') {
    return <EmployeeManagement />;
  }

  if (view === 'all-appointments') {
    return (
      <div className="section">
        <h2>All Appointments</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="appointments-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td>{new Date(apt.date).toLocaleDateString()}</td>
                    <td>{apt.time}</td>
                    <td>{apt.patient_name}</td>
                    <td>{apt.doctor_name}</td>
                    <td>
                      <span className={`status ${apt.status}`}>{apt.status}</span>
                    </td>
                    <td>
                      <button className="btn-small">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allAppointments.length === 0 && (
              <p className="no-data">No appointments found</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Admin Dashboard</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Employees</h3>
              <p className="stat-number">{stats.totalEmployees}</p>
              <span className="stat-change">+5% from last month</span>
            </div>
            
            <div className="stat-card">
              <h3>Total Patients</h3>
              <p className="stat-number">{stats.totalPatients}</p>
              <span className="stat-change">+12% from last month</span>
            </div>
            
            <div className="stat-card">
              <h3>Today's Appointments</h3>
              <p className="stat-number">{stats.todayAppointments}</p>
              <span className="stat-change">{stats.totalAppointments} total</span>
            </div>
            
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">${stats.totalRevenue}</p>
              <span className="stat-change">+8% from last month</span>
            </div>
          </div>

          <div className="admin-grid">
            <div className="recent-activities">
              <h3>Recent Activities</h3>
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'patient' && '👤'}
                      {activity.type === 'appointment' && '📅'}
                      {activity.type === 'lab' && '🔬'}
                      {activity.type === 'employee' && '👥'}
                    </div>
                    <div className="activity-content">
                      <p>{activity.action}</p>
                      <small>{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-stats">
              <h3>Department Overview</h3>
              <div className="department-stats">
                <div className="dept-item">
                  <span>Doctors</span>
                  <strong>{stats.totalDoctors}</strong>
                </div>
                <div className="dept-item">
                  <span>Receptionists</span>
                  <strong>{stats.totalEmployees - stats.totalDoctors}</strong>
                </div>
                <div className="dept-item">
                  <span>Lab Technicians</span>
                  <strong>3</strong>
                </div>
                <div className="dept-item">
                  <span>Active Appointments</span>
                  <strong>{stats.todayAppointments}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={() => setView('employees')} className="btn-primary">
              Manage Employees
            </button>
            <button onClick={() => setView('all-appointments')} className="btn-secondary">
              View All Appointments
            </button>
            <button className="btn-secondary">Generate Reports</button>
          </div>
        </>
      )}
    </div>
  );
};