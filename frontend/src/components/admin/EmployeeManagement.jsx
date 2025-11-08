import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const EmployeeManagement = () => {
  const { showMessage, triggerRefresh } = useApp();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Doctor',
    department: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (error) {
      showMessage('error', 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiService.createEmployee(formData);
      showMessage('success', 'Employee added successfully');
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Doctor',
        department: '',
        phone: '',
        address: ''
      });
      fetchEmployees();
      triggerRefresh();
    } catch (error) {
      showMessage('error', error.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="section">
      <div className="section-header">
        <h2>Employee Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Add New Employee</h3>
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password*</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={loading}
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label>Role*</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  disabled={loading}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g., Cardiology, General Medicine"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Contact number"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Employee address"
                rows="3"
                disabled={loading}
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Employee'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="employee-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="Doctor">Doctors</option>
          <option value="Receptionist">Receptionists</option>
          <option value="Lab Technician">Lab Technicians</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      {loading && !showForm ? (
        <p>Loading employees...</p>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="employee-card card">
              <div className="employee-avatar">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="employee-details">
                <h3>{emp.name}</h3>
                <p className="employee-email">{emp.email}</p>
                <span className="employee-role">{emp.role}</span>
                {emp.department && <p className="employee-dept">📍 {emp.department}</p>}
                {emp.phone && <p className="employee-phone">📞 {emp.phone}</p>}
              </div>
              <div className="employee-actions">
                <button className="btn-small">Edit</button>
                <button className="btn-small btn-danger">Remove</button>
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <p className="no-data">No employees found</p>
          )}
        </div>
      )}
    </div>
  );
};