import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { AppointmentBooking } from '../appointments/AppointmentBooking';

export const PatientDashboard = () => {
  const { view, currentUser, showMessage, refresh } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalLabReports: 0,
    activePrescriptions: 0
  });

  useEffect(() => {
    console.log('PatientDashboard - Current view:', view);
    fetchDashboardData();
  }, [refresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // For now, using mock data - replace with actual API calls when backend is ready
      const mockAppointments = [
        { 
          id: 1, 
          doctor_name: 'Smith', 
          date: '2024-01-25', 
          time: '10:00 AM', 
          status: 'Scheduled',
          reason: 'Regular Checkup'
        },
        { 
          id: 2, 
          doctor_name: 'Johnson', 
          date: '2024-01-26', 
          time: '2:00 PM', 
          status: 'Scheduled',
          reason: 'Follow-up'
        }
      ];
      
      const mockLabReports = [
        {
          id: 1,
          test_name: 'Blood Test - CBC',
          date: '2024-01-15',
          status: 'Report Sent',
          report_url: '#'
        }
      ];
      
      const mockPrescriptions = [
        {
          id: 1,
          doctor_name: 'Smith',
          date: '2024-01-20',
          medication: 'Paracetamol',
          dosage: '500mg twice daily',
          instructions: 'Take after meals'
        }
      ];
      
      setAppointments(mockAppointments);
      setLabReports(mockLabReports);
      setPrescriptions(mockPrescriptions);
      
      setStats({
        upcomingAppointments: mockAppointments.filter(a => a.status === 'Scheduled').length,
        totalLabReports: mockLabReports.length,
        activePrescriptions: mockPrescriptions.length
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showMessage('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handle different views based on navigation
  if (view === 'book-appointment') {
    // Check if AppointmentBooking component exists
    try {
      return <AppointmentBooking />;
    } catch (error) {
      return (
        <div className="section">
          <h2>Book Appointment</h2>
          <div className="form-container">
            <p>Appointment booking component will be loaded here</p>
            <button className="btn-primary" onClick={() => showMessage('info', 'Feature coming soon!')}>
              Book New Appointment
            </button>
          </div>
        </div>
      );
    }
  }

  if (view === 'my-appointments') {
    return (
      <div className="section">
        <h2>My Appointments</h2>
        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <div className="card-grid">
            {appointments.map(apt => (
              <div key={apt.id} className="card">
                <div className="card-header">
                  <h3>Dr. {apt.doctor_name}</h3>
                  <span className={`status ${apt.status}`}>{apt.status}</span>
                </div>
                <div className="card-body">
                  <p><strong>Date:</strong> {apt.date}</p>
                  <p><strong>Time:</strong> {apt.time}</p>
                  <p><strong>Reason:</strong> {apt.reason || 'General Consultation'}</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary btn-small">View Details</button>
                  {apt.status === 'Scheduled' && (
                    <button className="btn-danger btn-small">Cancel</button>
                  )}
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="empty-state">
                <p>No appointments found</p>
                <button 
                  className="btn-primary"
                  onClick={() => showMessage('info', 'Navigate to Book Appointment')}
                >
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'lab-reports') {
    return (
      <div className="section">
        <h2>Lab Reports</h2>
        {loading ? (
          <p>Loading lab reports...</p>
        ) : (
          <div className="card-grid">
            {labReports.map(report => (
              <div key={report.id} className="card">
                <div className="card-header">
                  <h3>{report.test_name}</h3>
                  <span className={`status ${report.status === 'Report Sent' ? 'Completed' : report.status}`}>
                    {report.status}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Date:</strong> {report.date}</p>
                  {report.report_url && (
                    <a 
                      href={report.report_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary btn-small"
                    >
                      📄 View Report
                    </a>
                  )}
                </div>
              </div>
            ))}
            {labReports.length === 0 && (
              <div className="empty-state">
                <p>No lab reports available</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'prescriptions') {
    return (
      <div className="section">
        <h2>My Prescriptions</h2>
        {loading ? (
          <p>Loading prescriptions...</p>
        ) : (
          <div className="card-grid">
            {prescriptions.map(pres => (
              <div key={pres.id} className="card">
                <div className="card-header">
                  <h3>{pres.medication}</h3>
                  <span className="date">{pres.date}</span>
                </div>
                <div className="card-body">
                  <p><strong>Prescribed by:</strong> Dr. {pres.doctor_name}</p>
                  <p><strong>Dosage:</strong> {pres.dosage}</p>
                  <p><strong>Instructions:</strong> {pres.instructions}</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary btn-small">Print</button>
                  <button className="btn-secondary btn-small">View Details</button>
                </div>
              </div>
            ))}
            {prescriptions.length === 0 && (
              <div className="empty-state">
                <p>No prescriptions found</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="section">
      <div className="dashboard-welcome">
        <h2>Welcome back, {currentUser?.name || 'Patient'}!</h2>
        <p>Here's your health overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Upcoming Appointments</h3>
            <p className="stat-number">{stats.upcomingAppointments}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Lab Reports</h3>
            <p className="stat-number">{stats.totalLabReports}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>Active Prescriptions</h3>
            <p className="stat-number">{stats.activePrescriptions}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-appointments">
          <h3>Recent Appointments</h3>
          <div className="appointment-list">
            {appointments.slice(0, 3).map(apt => (
              <div key={apt.id} className="appointment-item">
                <div className="appointment-date">
                  <span className="day">{new Date(apt.date).getDate()}</span>
                  <span className="month">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="appointment-details">
                  <h4>Dr. {apt.doctor_name}</h4>
                  <p>{apt.time} - {apt.reason}</p>
                </div>
                <span className={`status ${apt.status}`}>{apt.status}</span>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="no-data">No appointments scheduled</p>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => showMessage('info', 'Navigate to Book Appointment')}
            >
              <span className="action-icon">➕</span>
              <span>Book Appointment</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => showMessage('info', 'View Medical History')}
            >
              <span className="action-icon">📁</span>
              <span>Medical History</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => showMessage('info', 'Contact Support')}
            >
              <span className="action-icon">💬</span>
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};