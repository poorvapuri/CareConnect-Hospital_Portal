import React from 'react';
import { useApp } from './context/AppContext';
import { Message } from './components/common/Message';
import { Modal } from './components/common/Modal';
import { Login } from './components/auth/Login';
import * as PatientModule from './components/dashboard/patientDashboard';
import * as DoctorModule from './components/dashboard/doctorDashboard';
import { ReceptionistDashboard } from './components/dashboard/receptionistDashboard';
import { LabTechnicianDashboard } from './components/dashboard/labTechDashboard';
import { AdminDashboard } from './components/dashboard/adminDashboard';

function App() {
  const { view, currentUser, setView, handleLogout } = useApp();

  const renderDashboardContent = () => {
    const role = currentUser?.role || 'Patient';
    
    switch(role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Doctor':
        return <DoctorDashboard />;
      case 'Receptionist':
        return <ReceptionistDashboard />;
      case 'Lab Technician':
        return <LabTechnicianDashboard />;
      case 'Patient':
      default:
        return <PatientDashboard />;
    }
  };

  // Resolve possibly-mismatched exports from dashboard modules (some files export different names)
  const PatientDashboard = PatientModule.PatientDashboard || PatientModule.default || (() => (
    <div className="section"><h2>Patient Dashboard</h2><p>Welcome.</p></div>
  ));

  const DoctorDashboard = DoctorModule.DoctorDashboard || DoctorModule.default || (() => (
    <div className="section"><h2>Doctor Dashboard</h2><p>Welcome.</p></div>
  ));

  const Dashboard = () => (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>CareConnect</h1>
          <span className="user-role">{currentUser?.role || 'Patient'}</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {currentUser?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        {currentUser?.role === 'Admin' && (
          <>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>
              Dashboard
            </button>
            <button onClick={() => setView('employees')} className={view === 'employees' ? 'active' : ''}>
              Employees
            </button>
            <button onClick={() => setView('all-appointments')} className={view === 'all-appointments' ? 'active' : ''}>
              All Appointments
            </button>
          </>
        )}
        {currentUser?.role === 'Doctor' && (
          <>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>
              Dashboard
            </button>
            <button onClick={() => setView('schedule')} className={view === 'schedule' ? 'active' : ''}>
              My Schedule
            </button>
            <button onClick={() => setView('prescriptions')} className={view === 'prescriptions' ? 'active' : ''}>
              Prescriptions
            </button>
          </>
        )}
        {currentUser?.role === 'Receptionist' && (
          <>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>
              Dashboard
            </button>
            <button onClick={() => setView('appointments')} className={view === 'appointments' ? 'active' : ''}>
              Appointments
            </button>
            <button onClick={() => setView('checkin')} className={view === 'checkin' ? 'active' : ''}>
              Check-in
            </button>
            <button onClick={() => setView('billing')} className={view === 'billing' ? 'active' : ''}>
              Billing
            </button>
          </>
        )}
        {currentUser?.role === 'Lab Technician' && (
          <>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>
              Dashboard
            </button>
            <button onClick={() => setView('lab-tests')} className={view === 'lab-tests' ? 'active' : ''}>
              Lab Tests
            </button>
            <button onClick={() => setView('lab-reports')} className={view === 'lab-reports' ? 'active' : ''}>
              Upload Reports
            </button>
          </>
        )}
        {currentUser?.role === 'Patient' && (
          <>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>
              Dashboard
            </button>
            <button onClick={() => setView('book-appointment')} className={view === 'book-appointment' ? 'active' : ''}>
              Book Appointment
            </button>
            <button onClick={() => setView('my-appointments')} className={view === 'my-appointments' ? 'active' : ''}>
              My Appointments
            </button>
            <button onClick={() => setView('lab-reports')} className={view === 'lab-reports' ? 'active' : ''}>
              Lab Reports
            </button>
            <button onClick={() => setView('prescriptions')} className={view === 'prescriptions' ? 'active' : ''}>
              Prescriptions
            </button>
          </>
        )}
      </nav>
      
      <main className="dashboard-main">
        {renderDashboardContent()}
      </main>
    </div>
  );

  return (
    <div className="app">
      <Message />
      <Modal />
      {view === 'login' || !currentUser ? <Login /> : <Dashboard />}
    </div>
  );
}

export default App;