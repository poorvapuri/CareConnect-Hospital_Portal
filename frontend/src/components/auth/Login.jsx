import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Signup } from './Signup';

export const Login = () => {
  const { handleLogin, loading } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>CareConnect</h1>
          <p>Hospital Management System</p>
        </div>
        
        {isSignup ? (
          <Signup onSwitchToLogin={() => setIsSignup(false)} />
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
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
        )}
      </div>
    </div>
  );
};