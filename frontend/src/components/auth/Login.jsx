import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const Login = () => {
  const { handleLogin, showMessage } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    medicalHistory: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          showMessage('error', 'Passwords do not match!');
          setLoading(false);
          return;
        }

        // ✅ Only patient signup
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          contactNumber: formData.contactNumber,
          medicalHistory: formData.medicalHistory,
        };

        try {
          await apiService.registerPatient(userData);
          showMessage('success', 'Account created successfully!');
          await handleLogin(formData.email, formData.password);
        } catch (error) {
          showMessage('error', error.message || 'Patient registration failed');
        }
      } else {
        // ✅ Login
        await handleLogin(formData.email, formData.password);
      }
    } catch (error) {
      showMessage('error', error.message || 'Authentication failed');
    } finally {
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
          <h2>{isSignup ? 'Create Account (Patient)' : 'Sign In'}</h2>

          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />

              <input
                type="tel"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                required
                disabled={loading}
              />

              <textarea
                placeholder="Medical History (Optional)"
                value={formData.medicalHistory}
                onChange={(e) =>
                  setFormData({ ...formData, medicalHistory: e.target.value })
                }
                disabled={loading}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            disabled={loading}
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              disabled={loading}
            />
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
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
              });
            }}
            disabled={loading}
          >
            {isSignup
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>

          {!isSignup}
        </form>
      </div>
    </div>
  );
};