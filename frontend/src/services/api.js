// const API_BASE_URL = "https://careconnect-hospital-portal.onrender.com";
const API_BASE_URL = "https://careconnect-hospital-portal.onrender.com/api";


class ApiService {
  constructor() {
    this.token = localStorage.getItem('careconnect_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('careconnect_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('careconnect_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  // Patient registration
  async registerPatient(userData) {
    return await this.request('/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Employee registration (for Admin)
  async registerEmployee(employeeData) {
    return await this.request('/auth/register/employee', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  // Get available specializations
  async getSpecializations() {
    return await this.request('/auth/specializations');
  }

  // Appointment endpoints
  async getAppointments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/appointments${params ? '?' + params : ''}`);
  }

  async createAppointment(appointmentData) {
    return await this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  async updateAppointmentStatus(id, status) {
    return await this.request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }


  // ✅ Update an appointment (for rescheduling)
// ✅ Reschedule appointment
async updateAppointment(id, updates) {
  return await this.request(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

// ✅ Cancel appointment
async deleteAppointment(id) {
  return await this.request(`/appointments/${id}`, {
    method: 'DELETE'
  });
}


  // Prescription endpoints
  async getPrescriptions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/prescriptions${params ? '?' + params : ''}`);
  }

  async createPrescription(prescriptionData) {
    return await this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData)
    });
  }

  async updatePrescription(id, updates) {
    return await this.request(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deletePrescription(id) {
    return await this.request(`/prescriptions/${id}`, {
      method: 'DELETE'
    });
  }

  // Lab Test endpoints
  async getLabTests(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/lab-tests${params ? '?' + params : ''}`);
  }

  async createLabTest(labTestData) {
    return await this.request('/lab-tests', {
      method: 'POST',
      body: JSON.stringify(labTestData)
    });
  }

  async updateLabTestPayment(id, paymentStatus) {
    return await this.request(`/lab-tests/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus })
    });
  }

  async updateLabTest(id, updates) {
  return await this.request(`/lab-tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

  async uploadLabReport(id, file) {
    const formData = new FormData();
    formData.append('report', file);

    const response = await fetch(`${API_BASE_URL}/lab-tests/${id}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  }

  // Employee endpoints
  async getEmployees() {
    return await this.request('/employees');
  }

  async createEmployee(employeeData) {
    return await this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  // User endpoints
  async getUsers(role = null) {
    const params = role ? `?role=${role}` : '';
    return await this.request(`/users${params}`);
  }

  // ✅ Doctor endpoints
async getDoctors() {
  // This now correctly calls your backend route `/api/doctors`
  return await this.request('/doctors');
}

// Add this method if it doesn't exist
// Add this method to your ApiService class in api.js
async getAvailableDoctors() {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/available`, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch available doctors');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    throw error;
  }
}

// Update your getAppointments method

  
  

  async getPatients() {
    return await this.request('/users?role=Patient');
  }

  // ---- Payment API ----

async getPayments(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return await this.request(`/payments${params ? '?' + params : ''}`);
}

async processAppointmentPayment(appointmentId, paymentData) {
  return await this.request(`/payments/appointment/${appointmentId}`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
}

}

export const apiService = new ApiService();