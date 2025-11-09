// frontend/src/components/dashboard/LabTechnicianDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const LabTechnicianDashboard = () => {
  const { view, setView, showMessage, refresh, triggerRefresh } = useApp();
  const [labTests, setLabTests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchLabTests();
  }, [refresh, filter]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      let tests;
      
      if (filter === 'pending') {
        tests = await apiService.getLabTests({ 
          status: 'Pending',
          payment_status: 'Payment Verified'
        });
      } else if (filter === 'completed') {
        tests = await apiService.getLabTests({ 
          status: 'Report Sent',
          is_cleared: false
        });
      } else if (filter === 'cleared') {
        tests = await apiService.getLabTests({ 
          is_cleared: true
        });
      } else {
        tests = await apiService.getLabTests();
      }
      
      setLabTests(tests || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload Report
  const handleUploadReport = async (testId, file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      showMessage('error', 'Only PDF files are allowed');
      return;
    }
    
    try {
      await apiService.uploadLabReport(testId, file);
      showMessage('success', 'Report uploaded successfully');
      triggerRefresh();
    } catch (error) {
      showMessage('error', 'Failed to upload report');
    }
  };

  // Mark as Done/Clear
  const handleMarkAsDone = async (testId) => {
    try {
      await apiService.updateLabTest(testId, {
        status: 'Report Sent',
        is_cleared: true,
        cleared_at: new Date().toISOString()
      });
      showMessage('success', 'Test marked as completed and cleared');
      triggerRefresh();
    } catch (error) {
      showMessage('error', 'Failed to update test status');
    }
  };

  // Clear completed test from list
  const handleClearTest = async (testId) => {
    try {
      await apiService.updateLabTest(testId, {
        is_cleared: true,
        cleared_at: new Date().toISOString()
      });
      showMessage('success', 'Test cleared from list');
      triggerRefresh();
    } catch (error) {
      showMessage('error', 'Failed to clear test');
    }
  };

  // Main view
  return (
    <div className="section">
      <h2>Lab Test Management</h2>
      
      <div className="filter-tabs">
        <button 
          className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Tests ({labTests.filter(t => t.status === 'Pending').length})
        </button>
        <button 
          className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed (Not Cleared)
        </button>
        <button 
          className={`tab-btn ${filter === 'cleared' ? 'active' : ''}`}
          onClick={() => setFilter('cleared')}
        >
          Cleared History
        </button>
        <button 
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tests
        </button>
      </div>

      {loading ? (
        <p>Loading lab tests...</p>
      ) : (
        <div className="lab-tests-grid">
          {labTests.map(test => (
            <div key={test.id} className={`lab-test-card ${test.is_cleared ? 'cleared' : ''}`}>
              <div className="test-header">
                <h3>{test.test_name}</h3>
                <span className={`status ${test.status}`}>{test.status}</span>
              </div>
              
              <div className="test-details">
                <p><strong>Patient:</strong> {test.patient_name}</p>
                <p><strong>Test Date:</strong> {new Date(test.date).toLocaleDateString()}</p>
                <p><strong>Ordered by:</strong> Dr. {test.doctor_name}</p>
                <p><strong>Payment Status:</strong> 
                  <span className={`payment-status ${test.payment_status}`}>
                    {test.payment_status}
                  </span>
                </p>
                {test.instructions && (
                  <p><strong>Instructions:</strong> {test.instructions}</p>
                )}
                {test.is_cleared && (
                  <p><strong>Cleared on:</strong> {new Date(test.cleared_at).toLocaleString()}</p>
                )}
              </div>

              <div className="test-actions">
                {test.payment_status === 'Payment Verified' && test.status === 'Pending' && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleUploadReport(test.id, e.target.files[0]);
                        }
                      }}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      📤 Upload Report
                    </button>
                  </>
                )}
                
                {test.status === 'Report Sent' && !test.is_cleared && (
                  <>
                    {test.report_url && (
                      <a 
                        href={test.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        📄 View Report
                      </a>
                    )}
                    <button 
                      onClick={() => handleMarkAsDone(test.id)}
                      className="btn-success"
                    >
                      ✅ Mark as Done & Clear
                    </button>
                  </>
                )}
                
                {test.status === 'Report Sent' && test.is_cleared && (
                  <span className="cleared-badge">✅ Cleared</span>
                )}
                
                {test.payment_status !== 'Payment Verified' && (
                  <span className="pending-payment">⏳ Awaiting Payment</span>
                )}
              </div>
            </div>
          ))}
          
          {labTests.length === 0 && (
            <p className="no-data">
              {filter === 'pending' && 'No pending tests'}
              {filter === 'completed' && 'No completed tests to clear'}
              {filter === 'cleared' && 'No cleared tests'}
              {filter === 'all' && 'No lab tests found'}
            </p>
          )}
        </div>
      )}

      <div className="lab-stats">
        <h3>Today's Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Tests Pending</h4>
            <p className="stat-number">
              {labTests.filter(t => t.status === 'Pending' && t.payment_status === 'Payment Verified').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Reports Uploaded Today</h4>
            <p className="stat-number">
              {labTests.filter(t => 
                t.status === 'Report Sent' && 
                new Date(t.updated_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Awaiting Payment</h4>
            <p className="stat-number">
              {labTests.filter(t => t.payment_status !== 'Payment Verified').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Ready to Clear</h4>
            <p className="stat-number">
              {labTests.filter(t => t.status === 'Report Sent' && !t.is_cleared).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};