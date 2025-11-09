// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  LAB_TECHNICIAN: 'Lab Technician',
  PATIENT: 'Patient'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked-In',
  CONSULTED: 'Consulted',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// Lab Test Status
export const LAB_TEST_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  REPORT_SENT: 'Report Sent'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Payment Verified',
  FAILED: 'Failed'
};

// Time Slots
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00', '17:30'
];

// Date Format
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

// Messages
export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_FAILED: 'Invalid credentials',
  SIGNUP_SUCCESS: 'Account created successfully! Please login.',
  SIGNUP_FAILED: 'Failed to create account',
  APPOINTMENT_BOOKED: 'Appointment booked successfully!',
  PRESCRIPTION_CREATED: 'Prescription created successfully!',
  REPORT_UPLOADED: 'Report uploaded successfully!',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};