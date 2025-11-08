import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', content: null });
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('careconnect_token');
    const user = localStorage.getItem('careconnect_user');
    
    if (token && user) {
      apiService.setToken(token);
      setCurrentUser(JSON.parse(user));
      setView('dashboard');
    }
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const hideMessage = () => {
    setMessage(null);
  };

  const openModal = (title, content) => {
    setModal({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', content: null });
  };

  const triggerRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const data = await apiService.login(email, password);
      setCurrentUser(data.user);
      localStorage.setItem('careconnect_user', JSON.stringify(data.user));
      setView('dashboard');
      showMessage('success', 'Login successful!');
      return true;
    } catch (error) {
      showMessage('error', error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem('careconnect_user');
    localStorage.removeItem('careconnect_token');
    setCurrentUser(null);
    setView('login');
    showMessage('success', 'Logged out successfully');
  };

  const handleSignup = async (userData) => {
    try {
      setLoading(true);
      await apiService.signup(userData);
      showMessage('success', 'Account created successfully! Please login.');
      return true;
    } catch (error) {
      showMessage('error', error.message || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    view,
    setView,
    message,
    modal,
    refresh,
    loading,
    showMessage,
    hideMessage,
    openModal,
    closeModal,
    triggerRefresh,
    handleLogin,
    handleLogout,
    handleSignup
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};