import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const PrescriptionManagement = () => {
  const { currentUser, showMessage, refresh, triggerRefresh } = useApp();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    instructions: ''
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [refresh]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      showMessage('error', 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editing) {
        await apiService.updatePrescription(editing.id, formData);
        showMessage('success', 'Prescription updated');
      } else {
        await apiService.createPrescription(formData);
        showMessage('success', 'Prescription created');
      }
      
      setShowForm(false);
      setEditing(null);
      setFormData({ patientId: '', medication: '', dosage: '', instructions: '' });
      triggerRefresh();
    } catch (error) {
      showMessage('error', error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prescription) => {
    setEditing(prescription);
    setFormData({
      patientId: prescription.patient_id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      instructions: prescription.instructions
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await apiService.deletePrescription(id);
        showMessage('success', 'Prescription deleted');
        triggerRefresh();
      } catch (error) {
        showMessage('error', 'Failed to delete prescription');
      }
    }
  };

  return (
    <div className="section">
      <h2>Prescription Management</h2>
      
      {showForm && (
        <div className="form-container">
          <h3>{editing ? 'Edit Prescription' : 'New Prescription'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Patient</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                required
                disabled={loading}
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Medication</label>
              <input
                type="text"
                value={formData.medication}
                onChange={(e) => setFormData({...formData, medication: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Dosage</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                placeholder="e.g., 500mg twice daily"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder="Additional instructions for the patient"
                rows="4"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setFormData({ patientId: '', medication: '', dosage: '', instructions: '' });
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading && !showForm ? (
        <p>Loading prescriptions...</p>
      ) : (
        <div className="card-grid">
          {prescriptions.map(pres => (
            <div key={pres.id} className="card">
              <h3>{pres.patient_name}</h3>
              <p><strong>Date:</strong> {new Date(pres.date).toLocaleDateString()}</p>
              <p><strong>Medication:</strong> {pres.medication}</p>
              <p><strong>Dosage:</strong> {pres.dosage}</p>
              <p><strong>Instructions:</strong> {pres.instructions}</p>
              <div className="card-actions">
                <button onClick={() => handleEdit(pres)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(pres.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && <p>No prescriptions found</p>}
        </div>
      )}
      
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary btn-float"
        >
          + New Prescription
        </button>
      )}
    </div>
  );
};