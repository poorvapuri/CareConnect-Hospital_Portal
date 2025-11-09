import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Login = () => {
  const { handleLogin, handleSignup, loading } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    medicalHistory: '',
    role: 'Patient'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(email, password);
    if (success) {
      // Login successful - the view change is handled in handleLogin
      console.log('Login successful');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    const success = await handleSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      contactNumber: formData.contactNumber,
      medicalHistory: formData.medicalHistory
    });
    
    if (success) {
      setIsSignup(false);
      setEmail(formData.email);
      setPassword('');
    }
  };

  if (isSignup) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>CareConnect</h1>
            <p>Hospital Management System</p>
          </div>
          
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <h2>Create Account</h2>
            
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              disabled={loading}
            />
            
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              disabled={loading}
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Admin">Admin</option>
            </select>
            
            {formData.role === 'Patient' && (
              <>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  required
                  disabled={loading}
                />
                
                <textarea
                  placeholder="Medical History (Optional)"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                  disabled={loading}
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              disabled={loading}
            />
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            
            <button
              type="button"
              className="btn-link"
              onClick={() => setIsSignup(false)}
              disabled={loading}
            >
              Already have an account? Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>CareConnect</h1>
          <p>Hospital Management System</p>
        </div>
        
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <h2>Sign In</h2>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <button
            type="button"
            className="btn-link"
            onClick={() => setIsSignup(true)}
            disabled={loading}
          >
            Don't have an account? Sign Up
          </button>
          
          <div className="test-credentials">
            <p>Test Credentials:</p>
            <small>patient@care.com / password123</small>
            <small>doctor@care.com / password123</small>
            <small>admin@care.com / password123</small>
          </div>
        </form>
      </div>
    </div>
  );
};