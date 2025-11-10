import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const Login = () => {
  const { handleLogin, showMessage } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    medicalHistory: '',
    role: 'Patient',
    specialization: '' // Added specialization field
  });
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]); // Added specializations state

  // Fetch specializations when component mounts or role changes to Doctor
  useEffect(() => {
    if (formData.role === 'Doctor') {
      fetchSpecializations();
    }
  }, [formData.role]);

  const fetchSpecializations = async () => {
    try {
      const specs = await apiService.getSpecializations();
      setSpecializations(specs);
      
      // Set default specialization if none selected
      if (!formData.specialization && specs.length > 0) {
        setFormData(prev => ({
          ...prev,
          specialization: specs[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      showMessage('error', 'Failed to load doctor specializations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('🚀 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('📝 Is signup:', isSignup);
    
    try {
      if (isSignup) {
        console.log('🏥 Processing signup...');
        
        if (formData.password !== formData.confirmPassword) {
          console.log('❌ Passwords do not match');
          showMessage('error', 'Passwords do not match!');
          setLoading(false);
          return;
        }
        
        if (formData.role === 'Patient') {
          console.log('👤 Registering as patient...');
          
          const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            contactNumber: formData.contactNumber,
            medicalHistory: formData.medicalHistory
          };
          
          console.log('📋 Patient registration data:', userData);
          
          try {
            const user = await apiService.registerPatient(userData);
            console.log('✅ Patient registered successfully:', user);
            
            showMessage('success', 'Account created successfully!');
            
            // Auto-login after signup
            console.log('🔐 Auto-login after signup...');
            await handleLogin(formData.email, formData.password);
            
          } catch (error) {
            console.error('❌ Patient registration error:', error);
            showMessage('error', error.message || 'Patient registration failed');
          }
        } else {
          console.log('👥 Registering as employee...');
          
          const employeeData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            ...(formData.role === 'Doctor' && { specialization: formData.specialization })
          };
          
          console.log('📋 Employee registration data:', employeeData);
          
          try {
            const user = await apiService.registerEmployee(employeeData);
            console.log('✅ Employee registered successfully:', user);
            
            showMessage('success', 'Account created successfully!');
            setIsSignup(false);
            setFormData(prev => ({
              ...prev,
              email: '',
              password: '',
              confirmPassword: '',
              specialization: ''
            }));
            
          } catch (error) {
            console.error('❌ Employee registration error:', error);
            showMessage('error', error.message || 'Employee registration failed');
          }
        }
      } else {
        console.log('🔐 Processing login...');
        await handleLogin(formData.email, formData.password);
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      showMessage('error', error.message || 'Authentication failed');
    } finally {
      console.log('🏁 Form submission completed');
      setLoading(false);
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
                onChange={(e) => {
                  console.log('✏️ Name changed:', e.target.value);
                  setFormData({...formData, name: e.target.value});
                }}
                required
                disabled={loading}
              />
              
              <select
                value={formData.role}
                onChange={(e) => {
                  console.log('🔄 Role changed:', e.target.value);
                  setFormData({
                    ...formData, 
                    role: e.target.value,
                    specialization: e.target.value === 'Doctor' ? (specializations[0] || '') : ''
                  });
                }}
                disabled={loading}
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Lab Technician">Lab Technician</option>
              </select>
              
              {/* Show specialization dropdown for Doctors */}
              {formData.role === 'Doctor' && (
                <div className="form-group">
                  <label>Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => {
                      console.log('🎯 Specialization changed:', e.target.value);
                      setFormData({...formData, specialization: e.target.value});
                    }}
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
              
              {formData.role === 'Patient' && (
                <>
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      console.log('📞 Contact number changed:', e.target.value);
                      setFormData({...formData, contactNumber: e.target.value});
                    }}
                    required
                    disabled={loading}
                  />
                  
                  <textarea
                    placeholder="Medical History (Optional)"
                    value={formData.medicalHistory}
                    onChange={(e) => {
                      console.log('📝 Medical history changed:', e.target.value);
                      setFormData({...formData, medicalHistory: e.target.value});
                    }}
                    disabled={loading}
                  />
                </>
              )}
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => {
              console.log('📧 Email changed:', e.target.value);
              setFormData({...formData, email: e.target.value});
            }}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => {
              console.log('🔒 Password changed');
              setFormData({...formData, password: e.target.value});
            }}
            required
            disabled={loading}
          />
          
          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => {
                console.log('🔒 Confirm password changed');
                setFormData({...formData, confirmPassword: e.target.value});
              }}
              required
              disabled={loading}
            />
          )}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
          
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              console.log('🔄 Toggling signup/login');
              setIsSignup(!isSignup);
              setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                contactNumber: '',
                medicalHistory: '',
                role: 'Patient',
                specialization: ''
              });
            }}
            disabled={loading}
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          
          {!isSignup && (
            <div className="test-credentials">
              <p>Test Credentials:</p>
              <small>Patient: patient@care.com / patient123</small>
              <small>Doctor: doctor@care.com / doctor123</small>
              <small>Admin: admin@care.com / admin123</small>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};