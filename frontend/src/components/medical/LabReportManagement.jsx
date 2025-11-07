import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const LabReportManagement = () => {
  const { showMessage, triggerRefresh } = useApp();
  const [labTests, setLabTests] = useState([]);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      const tests = await apiService.getLabTests({ paymentStatus: 'Payment Verified' });
      setLabTests(tests);
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleFileUpload = async (testId, file) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [testId]: true }));
    
    try {
      await apiService.uploadLabReport(testId, file);
      showMessage('success', 'Report uploaded successfully');
      triggerRefresh();
      fetchLabTests();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setUploading(prev => ({ ...prev, [testId]: false }));
    }
  };

  return (
    <div className="section">
      <h2>Upload Lab Reports</h2>
      <div className="card-grid">
        {labTests.map(test => (
          <div key={test.id} className="card">
            <h3>{test.patient_name}</h3>
            <p><strong>Test:</strong> {test.test_name}</p>
            <p><strong>Date:</strong> {test.date}</p>
            <p><strong>Status:</strong> {test.status}</p>
            {test.status !== 'Report Sent' && (
              <div className="card-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(test.id, e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  disabled={uploading[test.id]}
                >
                  {uploading[test.id] ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            )}
            {test.status === 'Report Sent' && (
              <div className="card-actions">
                <a 
                  href={test.report_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  View Report
                </a>
              </div>
            )}
          </div>
        ))}
        {labTests.length === 0 && <p>No tests with verified payment</p>}
      </div>
    </div>
  );
};