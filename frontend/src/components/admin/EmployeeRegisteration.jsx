import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

export const EmployeeRegistration = ({ onEmployeeCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Doctor',
    specialization: ''
  });
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const specs = await apiService.getSpecializations();
      setSpecializations(specs);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('Name, email, and password are required');
      }
      
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
      
      const response = await apiService.registerEmployee(employeeData);
      
      if (onEmployeeCreated) {
        onEmployeeCreated(response.user);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Add New Employee</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <select
            value={formData.role}
            onChange={(e) => {
              setFormData({
                ...formData, 
                role: e.target.value,
                specialization: e.target.value === 'Doctor' ? specializations[0] || '' : ''
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
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              required
              disabled={loading}
            >
              <option value="">Select Specialization</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};