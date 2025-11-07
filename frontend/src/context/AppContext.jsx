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

  useEffect(() => {
    const token = localStorage.getItem('careconnect_token');
    if (token) {
      apiService.setToken(token);
      // You might want to validate the token here
      setView('dashboard');
    }
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
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
      const user = await apiService.login(email, password);
      setCurrentUser(user);
      setView('dashboard');
      showMessage('success', 'Login successful!');
      return true;
    } catch (error) {
      showMessage('error', error.message);
      return false;
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    setCurrentUser(null);
    setView('login');
    showMessage('success', 'Logged out successfully');
  };

  const handleSignup = async (userData) => {
    try {
      await apiService.signup(userData);
      showMessage('success', 'Account created successfully! Please login.');
      setView('login');
      return true;
    } catch (error) {
      showMessage('error', error.message);
      return false;
    }
  };

  const value = {
    currentUser,
    view,
    setView,
    message,
    modal,
    refresh,
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