import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

// ===============================
// EmployeesView (button moved to top and styled)
// ===============================
const EmployeesView = ({
  employees,
  loading,
  showEmployeeForm,
  setShowEmployeeForm,
  formData,
  setFormData,
  handleEmployeeSubmit,
  specializations,
  nameInputRef
}) => (
  <div className="section" style={{ maxWidth: 1100, margin: '0 auto' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}
    >
      <h2 style={{ margin: 0, fontWeight: 700 }}>Employee Management</h2>

      <button
        onClick={() => setShowEmployeeForm(true)}
        className="btn-primary"
        style={{
          padding: '10px 18px',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          flexShrink: 0
        }}
        disabled={loading}
      >
        Add New Employee
      </button>
    </div>

    {showEmployeeForm && (
      <div className="form-container" style={{ marginBottom: 28 }}>
        <h3 style={{ marginTop: 0 }}>Add New Employee</h3>
        <form onSubmit={handleEmployeeSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  role: newRole,
                  specialization:
                    newRole === 'Doctor' ? specializations[0] || '' : ''
                }));
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialization: e.target.value
                  }))
                }
                required
                disabled={loading}
              >
                <option value="">Select Specialization</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 12 }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
            <button
              type="button"
              onClick={() => setShowEmployeeForm(false)}
              className="btn-secondary"
              disabled={loading}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}

    <div
      className="card-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16
      }}
    >
      {employees.map((emp) => (
        <div
          key={emp.id || emp._id || emp.email}
          className="card"
          style={{
            background: '#fff',
            borderRadius: 10,
            padding: '16px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}
        >
          <h3 style={{ marginBottom: 8 }}>{emp.name}</h3>
          <p style={{ margin: '6px 0' }}>
            <strong>Email:</strong> {emp.email}
          </p>
          <p style={{ margin: '6px 0' }}>
            <strong>Role:</strong> {emp.role}
          </p>
          {emp.role === 'Doctor' && (emp.specialization || emp.speciality || emp.specialty) && (
            <p style={{ margin: '6px 0' }}>
              <strong>Specialization:</strong> {emp.specialization || emp.speciality || emp.specialty}
            </p>
          )}
        </div>
      ))}
      {employees.length === 0 && !loading && <p>No employees found</p>}
      {loading && <p>Loading employees...</p>}
    </div>
  </div>
);

// ===============================
// AdminDashboard (improved, centered, AllAppointmentsView restored)
// ===============================
export const AdminDashboard = () => {
  const { view, setView, showMessage } = useApp();
  const [employees, setEmployees] = useState([]);
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

  const nameInputRef = useRef(null);

  // Auto focus when form opens
  useEffect(() => {
    if (showEmployeeForm) {
      nameInputRef.current?.focus();
    }
  }, [showEmployeeForm]);

  // Fetch specializations when role is Doctor
  useEffect(() => {
    if (formData.role === 'Doctor') {
      fetchSpecializations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.role]);

  // Fetch data whenever view changes (and on mount)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Initial fetch on mount as well
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSpecializations = async () => {
    try {
      let availableDoctors = [];
      try {
        const res = await apiService.getDoctors();
        if (Array.isArray(res)) availableDoctors = res;
        else if (res && Array.isArray(res.doctors)) availableDoctors = res.doctors;
        else if (res && Array.isArray(res.data)) availableDoctors = res.data;
      } catch (err) {
        console.warn('fetchSpecializations: getDoctors failed', err);
      }

      let uniqueSpecializations = [];
      if (Array.isArray(availableDoctors)) {
        uniqueSpecializations = [...new Set(
          availableDoctors
            .map(doc => (doc.specialization || doc.speciality || doc.specialty || '').trim())
            .filter(Boolean)
        )];
      }

      if (uniqueSpecializations.length === 0) {
        uniqueSpecializations = [
          'General Medicine',
          'Cardiology',
          'Neurology',
          'Orthopedics',
          'Pediatrics',
          'Dermatology',
          'Gynecology',
          'Ophthalmology',
          'ENT',
          'Psychiatry',
          'Dentistry',
          'Radiology',
          'Anesthesiology',
          'Emergency Medicine'
        ];
      }

      setSpecializations(uniqueSpecializations);
      if (!formData.specialization && uniqueSpecializations.length > 0) {
        setFormData(prev => ({ ...prev, specialization: uniqueSpecializations[0] }));
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      showMessage && showMessage('error', 'Failed to load doctor specializations');
    }

    // ✅ Merge with defaults to show all unique options
    const combined = [...new Set([...defaultSpecializations, ...uniqueSpecializations])];

    setSpecializations(combined);

    // Set first option as default if not already selected
    if (!formData.specialization) {
      setFormData(prev => ({ ...prev, specialization: combined[0] }));
    }
  } catch (error) {
    console.error('❌ Error fetching specializations:', error);
    showMessage('error', 'Failed to load doctor information');

    // fallback
    setSpecializations([
      'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
      'Dermatology', 'Gynecology', 'Ophthalmology', 'ENT', 'Psychiatry',
      'Dentistry', 'Radiology', 'Anesthesiology', 'Emergency Medicine'
    ]);
  }
};


  const fetchData = async () => {
    setLoading(true);
    try {
      // fetch employees and appointments in parallel
      await Promise.allSettled([fetchEmployees(), fetchAppointments()]);
    } catch (err) {
      console.error('fetchData error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const empList = await apiService.getEmployees();
      // some endpoints return { data: [] } etc.
      const list = Array.isArray(empList) ? empList : (empList?.data || empList?.employees || []);
      setEmployees(list);
      return list;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  };

  const fetchAppointments = async () => {
    try {
      const apts = await apiService.getAppointments();
      const list = Array.isArray(apts) ? apts : (apts?.data || apts?.appointments || []);
      setAppointments(list);
      return list;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };

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
      showMessage && showMessage('success', 'Employee added successfully');
      setShowEmployeeForm(false);
      setFormData({ name: '', email: '', password: '', role: 'Doctor', specialization: specializations[0] || '' });
      await fetchEmployees();
    } catch (error) {
      console.error('handleEmployeeSubmit error', error);
      showMessage && showMessage('error', error.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  // Dashboard stat card small component
  const StatCard = ({ title, value }) => (
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
      <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );

  // Main Dashboard (centered)
  const MainDashboard = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAppointmentsCount = appointments.filter(a => (a.date === todayStr) || (a.appointmentDate === todayStr)).length;

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: 28,
          boxShadow: '0 10px 28px rgba(20,20,40,0.06)'
        }}>
          <h2 style={{ marginTop: 0 }}>Admin Dashboard</h2>
          <div style={{ color: '#666', marginBottom: 18 }}>Manage employees, view appointments and monitor system activity.</div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <StatCard title="Total Employees" value={employees.length || 0} />
            <StatCard title="Active Doctors" value={(employees.filter(e => e.role === 'Doctor').length) || 0} />
            <StatCard title="Today's Appointments" value={todaysAppointmentsCount || 0} />
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
              <h3 style={{ margin: '0 0 6px 0' }}>System Management</h3>
              <div style={{ color: '#666' }}>Quick actions to manage employees and appointments.</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setView && setView('employees')} className="btn-primary" style={{ padding: '10px 16px', borderRadius: 8 }}>Manage Employees</button>
              <button onClick={() => setView && setView('all-appointments')} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>View All Appointments</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper: format only date in IST (DD/MM/YYYY)
  const formatDateOnlyIST = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      // en-GB gives dd/mm/yyyy formatting
      return d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
    } catch (err) {
      return dateString;
    }
  };

  // Helper: convert ISO time portion to hh:mm AM/PM in IST (used only if no explicit time field)
  const extractAndFormatTimeFromISO = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  // Helper: ensure doctor name not duplicated with Dr. prefix
  const cleanDoctorName = (raw) => {
    if (!raw) return '';
    // Remove common doctor prefixes (case-insensitive)
    const noPrefix = raw.replace(/^\s*(Dr\.?|dr\.?|DR\.?)\s*/i, '');
    // Normalize whitespace
    const trimmed = noPrefix.trim();
    return trimmed ? `Dr. ${trimmed}` : '';
  };

  // ===============================
  // AllAppointmentsView (enhanced visual box + centered header)
  // ===============================
  const AllAppointmentsView = () => (
    <div style={{ maxWidth: 980, margin: '20px auto' }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: 22,
        boxShadow: '0 12px 30px rgba(20,20,40,0.06)'
      }}>
        {/* Centered, prominent heading in a small top box */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{
            padding: '8px 18px',
            borderRadius: 10,
            background: '#fafaff',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20, textAlign: 'center' }}>
              All Appointments
            </h2>
          </div>
        </div>

        {/* single line break / spacer after heading */}
        <div style={{ height: 12 }} />

        {loading ? <p>Loading appointments...</p> : (
          <div style={{ display: 'grid', gap: 12 }}>
            {appointments.length === 0 && <p>No appointments found.</p>}
            {appointments.map((apt) => {
              const id = apt.id || apt._id || `${apt.patientId || apt.patient_name}-${apt.date || apt.appointmentDate}-${apt.time || apt.appointmentTime}`;

              // Prefer date fields, fall back to appointmentDate
              const rawDate = apt.date || apt.appointmentDate || null;
              const dateDisplay = rawDate ? formatDateOnlyIST(rawDate) : '';

              // Use explicit time field if provided (preserve previous look)
              const explicitTime = apt.time || apt.appointmentTime || '';
              // If explicitTime not present but date contains ISO time, extract & format it
              let timeDisplay = explicitTime;
              if (!timeDisplay && rawDate && /\dT\d/.test(rawDate)) {
                timeDisplay = extractAndFormatTimeFromISO(rawDate); // e.g. "09:00 AM"
              }

              // doctor name cleanup
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

                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#fff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                      fontSize: 13,
                      color: '#333'
                    }}>
                      {apt.status || apt.paymentStatus || 'N/A'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Centered Back Button with CareConnect theme color */}
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

  // View switch
  switch (view) {
    case 'employees':
      return (
        <EmployeesView
          employees={employees}
          loading={loading}
          showEmployeeForm={showEmployeeForm}
          setShowEmployeeForm={setShowEmployeeForm}
          formData={formData}
          setFormData={setFormData}
          handleEmployeeSubmit={handleEmployeeSubmit}
          specializations={specializations}
          nameInputRef={nameInputRef}
        />
      );
    case 'all-appointments':
      return <AllAppointmentsView />;
    default:
      return <MainDashboard />;
  }
};

export default AdminDashboard;
