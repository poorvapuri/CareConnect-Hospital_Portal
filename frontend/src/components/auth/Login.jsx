import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Login = () => {
  const { handleLogin, handleSignup, showMessage } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    medicalHistory: '',
    role: 'Patient'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        showMessage('error', 'Passwords do not match!');
        return;
      }
      
      try {
        let result;
        
        if (formData.role === 'Patient') {
          // Register as patient
          result = await fetch('/api/auth/register/patient', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              contactNumber: formData.contactNumber,
              medicalHistory: formData.medicalHistory
            })
          });
        } else {
          // Register as employee (this would typically be done by admin in a separate flow)
          result = await fetch('/api/auth/register/employee', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: formData.role
            })
          });
        }
        
        const data = await result.json();
        
        if (result.ok) {
          showMessage('success', 'Account created successfully!');
          
          // Auto-login for patient
          if (formData.role === 'Patient') {
            await handleLogin(formData.email, formData.password);
          } else {
            setIsSignup(false);
            setFormData(prev => ({
              ...prev,
              email: '',
              password: '',
              confirmPassword: ''
            }));
          }
        } else {
          showMessage('error', data.error || 'Registration failed');
        }
      } catch (error) {
        showMessage('error', 'Registration failed: ' + error.message);
      }
    } else {
      await handleLogin(formData.email, formData.password);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>CareConnect</h1>
          <p>Hospital Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
          
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Lab Technician">Lab Technician</option>
              </select>
              
              {formData.role === 'Patient' && (
                <>
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    required
                  />
                  
                  <textarea
                    placeholder="Medical History (Optional)"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                  />
                </>
              )}
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          )}
          
          <button type="submit" className="btn-primary">
            {isSignup ? 'Sign Up' : 'Sign In'}
          </button>
          
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setIsSignup(!isSignup);
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                contactNumber: '',
                medicalHistory: '',
                role: 'Patient'
              });
            }}
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          
          {!isSignup && (
            <div className="test-credentials">
              <p>Test Credentials:</p>
              <small>Patient: patient@care.com / password123</small>
              <small>Doctor: doctor@care.com / password123</small>
              <small>Admin: admin@care.com / password123</small>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};