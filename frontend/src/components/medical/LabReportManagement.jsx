import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const LabReportManagement = () => {
  const { showMessage, triggerRefresh } = useApp();
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [filter, setFilter] = useState('pending');
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchLabTests();
  }, [filter]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      let tests;
      
      if (filter === 'pending') {
        tests = await apiService.getLabTests({ 
          paymentStatus: 'Payment Verified',
          status: 'Pending' 
        });
      } else if (filter === 'completed') {
        tests = await apiService.getLabTests({ status: 'Report Sent' });
      } else {
        tests = await apiService.getLabTests();
      }
      
      setLabTests(tests);
    } catch (error) {
      showMessage('error', 'Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (testId, file) => {
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      showMessage('error', 'Only PDF files are allowed');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB');
      return;
    }
    
    setUploading(prev => ({ ...prev, [testId]: true }));
    
    try {
      await apiService.uploadLabReport(testId, file);
      showMessage('success', 'Report uploaded successfully');
      fetchLabTests();
      triggerRefresh();
    } catch (error) {
      showMessage('error', error.message || 'Failed to upload report');
    } finally {
      setUploading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleFileSelect = (testId) => {
    if (!fileInputRefs.current[testId]) {
      fileInputRefs.current[testId] = document.createElement('input');
      fileInputRefs.current[testId].type = 'file';
      fileInputRefs.current[testId].accept = '.pdf';
      fileInputRefs.current[testId].onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          handleFileUpload(testId, file);
        }
      };
    }
    fileInputRefs.current[testId].click();
  };

  return (
    <div className="section">
      <h2>Lab Report Management</h2>
      
      <div className="report-filters">
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Reports
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed Reports
        </button>
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tests
        </button>
      </div>

      {loading ? (
        <p>Loading lab tests...</p>
      ) : (
        <div className="lab-reports-grid">
          {labTests.map(test => (
            <div key={test.id} className="lab-report-card">
              <div className="report-header">
                <h3>{test.test_name}</h3>
                <span className={`status ${test.status}`}>{test.status}</span>
              </div>
              
              <div className="report-details">
                <div className="detail-row">
                  <label>Patient:</label>
                  <span>{test.patient_name}</span>
                </div>
                <div className="detail-row">
                  <label>Date:</label>
                  <span>{new Date(test.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <label>Payment:</label>
                  <span className={`payment-status ${test.payment_status}`}>
                    {test.payment_status}
                  </span>
                </div>
              </div>

              <div className="report-actions">
                {test.status === 'Pending' && test.payment_status === 'Payment Verified' && (
                  <button
                    onClick={() => handleFileSelect(test.id)}
                    className="btn-primary"
                    disabled={uploading[test.id]}
                  >
                    {uploading[test.id] ? (
                      <>
                        <span className="spinner"></span>
                        Uploading...
                      </>
                    ) : (
                      <>📄 Upload Report</>
                    )}
                  </button>
                )}
                
                {test.status === 'Report Sent' && test.report_url && (
                  <>
                    <a 
                      href={test.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      View Report
                    </a>
                    <button
                      onClick={() => handleFileSelect(test.id)}
                      className="btn-secondary"
                      disabled={uploading[test.id]}
                    >
                      Replace
                    </button>
                  </>
                )}
                
                {test.payment_status === 'Pending' && (
                  <p className="pending-payment">⚠️ Awaiting Payment Verification</p>
                )}
              </div>
            </div>
          ))}
          
          {labTests.length === 0 && (
            <div className="no-data-container">
              <p className="no-data">
                {filter === 'pending' && 'No pending reports to upload'}
                {filter === 'completed' && 'No completed reports'}
                {filter === 'all' && 'No lab tests found'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="upload-info">
        <h3>Upload Guidelines</h3>
        <ul>
          <li>Only PDF files are accepted</li>
          <li>Maximum file size: 5MB</li>
          <li>Ensure report contains patient name and test details</li>
          <li>Reports are automatically sent to patients after upload</li>
        </ul>
      </div>
    </div>
  );
};