import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const AdminDashboard = () => {
  const { view, setView, showMessage } = useApp();
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Doctor',
    specialization: ''
  });
  const [specializations, setSpecializations] = useState([]);

  // ✅ Fetch doctor specializations when role changes to Doctor
  useEffect(() => {
    if (formData.role === 'Doctor') {
      fetchSpecializations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  // ✅ Fetch data when the 'view' changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // ✅ Fetch doctor specializations
  const fetchSpecializations = async () => {
    try {
      const specs = await apiService.getSpecializations();
      setSpecializations(specs);
      if (!formData.specialization && specs.length > 0) {
        setFormData(prev => ({ ...prev, specialization: specs[0] }));
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      showMessage('error', 'Failed to load doctor specializations');
    }
  };

  // ✅ Fetch data based on selected view
  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'employees') await fetchEmployees();
      if (view === 'doctor-schedules') await fetchSchedules();
      if (view === 'all-appointments') await fetchAppointments();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use centralized API service
  const fetchEmployees = async () => {
    try {
      const empList = await apiService.getEmployees();
      setEmployees(empList);
    } catch (error) {
      throw error;
    }
  };

  const fetchSchedules = async () => {
    try {
      const data = await apiService.getSchedules();
      setSchedules(data);
    } catch (error) {
      throw error;
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      setAppointments(data);
    } catch (error) {
      throw error;
    }
  };

  // ✅ Add new employee
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.role === 'Doctor' && !formData.specialization) {
        throw new Error('Specialization is required for doctors');
      }

      const employeeData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'Doctor' && { specialization: formData.specialization })
      };

      await apiService.registerEmployee(employeeData);
      showMessage('success', 'Employee added successfully');
      setShowEmployeeForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Doctor',
        specialization: specializations.length > 0 ? specializations[0] : ''
      });
      fetchEmployees();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Dashboard main section
  const MainDashboard = () => (
    <div className="section">
      <h2>Admin Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p>{employees.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Doctors</h3>
          <p>{employees.filter(emp => emp.role === 'Doctor').length}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <p>{appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}</p>
        </div>
      </div>

      <div className="section" style={{ marginTop: '30px' }}>
        <h3>System Management</h3>
        <p>Welcome to the Admin Dashboard. Manage employees, view schedules, and monitor system activity.</p>
        <div className="card-actions">
          <button onClick={() => setView('employees')} className="btn-primary">👥 Manage Employees</button>
          <button onClick={() => setView('doctor-schedules')} className="btn-secondary">📅 View Doctor Schedules</button>
          <button onClick={() => setView('all-appointments')} className="btn-secondary">🏥 View All Appointments</button>
        </div>
      </div>
    </div>
  );

  // ✅ Employees view
  const EmployeesView = () => (
    <div className="section">
      <h2>👥 Employee Management</h2>

      {showEmployeeForm && (
        <div className="form-container">
          <h3>Add New Employee</h3>
          <form onSubmit={handleEmployeeSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={loading} />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setFormData({
                    ...formData,
                    role: newRole,
                    specialization: newRole === 'Doctor' ? (specializations[0] || '') : ''
                  });
                }}
                disabled={loading}
              >
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Lab Technician">Lab Technician</option>
              </select>
            </div>

            {formData.role === 'Doctor' && (
              <div className="form-group">
                <label>Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                  disabled={loading}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((spec, index) => (
                    <option key={index} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Employee'}</button>
              <button type="button" onClick={() => setShowEmployeeForm(false)} className="btn-secondary" disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card-grid">
        {employees.map(emp => (
          <div key={emp.id} className="card">
            <h3>{emp.name}</h3>
            <p><strong>Email:</strong> {emp.email}</p>
            <p><strong>Role:</strong> {emp.role}</p>
            {emp.role === 'Doctor' && emp.specialization && (
              <p><strong>Specialization:</strong> {emp.specialization}</p>
            )}
          </div>
        ))}
        {employees.length === 0 && !loading && <p>No employees found</p>}
        {loading && <p>Loading employees...</p>}
      </div>

      <button onClick={() => setShowEmployeeForm(true)} className="btn-primary" disabled={loading}>➕ Add New Employee</button>
    </div>
  );

  // ✅ Doctor Schedules view
  const DoctorSchedulesView = () => (
    <div className="section">
      <h2>📅 Doctor Schedules</h2>
      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <div className="card-grid">
          {schedules.map(schedule => (
            <div key={schedule.doctor.id} className="card">
              <h3>{schedule.doctor.name}</h3>
              <div className="schedule-list">
                {schedule.schedules.map(sched => (
                  <div key={sched.id} className="schedule-item">
                    <p><strong>{sched.day}:</strong> {sched.slots.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {schedules.length === 0 && <p>No schedules found</p>}
        </div>
      )}
      <button onClick={() => setView('dashboard')} className="btn-secondary" style={{ marginTop: '20px' }}>Back to Dashboard</button>
    </div>
  );

  // ✅ All Appointments view
  const AllAppointmentsView = () => (
    <div className="section">
      <h2>🏥 All Appointments</h2>
      {loading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="card-grid">
          {appointments.map(apt => (
            <div key={apt.id} className="card">
              <h3>{apt.patient_name}</h3>
              <p><strong>Doctor:</strong> Dr. {apt.doctor_name}</p>
              <p><strong>Date:</strong> {apt.date}</p>
              <p><strong>Time:</strong> {apt.time}</p>
              <p><strong>Status:</strong> <span className={`status ${apt.status}`}>{apt.status}</span></p>
            </div>
          ))}
          {appointments.length === 0 && <p>No appointments found</p>}
        </div>
      )}
      <button onClick={() => setView('dashboard')} className="btn-secondary" style={{ marginTop: '20px' }}>Back to Dashboard</button>
    </div>
  );

  // ✅ Render view
  switch (view) {
    case 'employees':
      return <EmployeesView />;
    case 'doctor-schedules':
      return <DoctorSchedulesView />;
    case 'all-appointments':
      return <AllAppointmentsView />;
    default:
      return <MainDashboard />;
  }
};
