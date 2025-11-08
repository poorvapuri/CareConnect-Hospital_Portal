import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { LabReportManagement } from '../medical/LabReportManagement';

export const LabTechnicianDashboard = () => {
  const { view, showMessage, refresh } = useApp();
  const [labTests, setLabTests] = useState([]);
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedToday: 0,
    awaitingPayment: 0,
    totalTests: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refresh, view]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const tests = await apiService.getLabTests();
      setLabTests(tests);

      const pendingTests = tests.filter(t => t.status === 'Pending');
      const awaitingPayment = tests.filter(t => t.payment_status === 'Pending');
      const today = new Date().toISOString().split('T')[0];
      const completedToday = tests.filter(t => 
        t.status === 'Report Sent' && t.date.split('T')[0] === today
      );

      setStats({
        pendingTests: pendingTests.length,
        completedToday: completedToday.length,
        awaitingPayment: awaitingPayment.length,
        totalTests: tests.length
      });
    } catch (error) {
      showMessage('error', 'Failed to fetch lab data');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (testId, status) => {
    try {
      await apiService.updateLabTestPayment(testId, status);
      showMessage('success', 'Payment status updated');
      fetchDashboardData();
    } catch (error) {
      showMessage('error', 'Failed to update payment status');
    }
  };

  if (view === 'lab-reports') {
    return <LabReportManagement />;
  }

  if (view === 'lab-tests') {
    return (
      <div className="section">
        <h2>Lab Test Management</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="lab-tests-container">
            <div className="filters">
              <button className="filter-btn active">All Tests</button>
              <button className="filter-btn">Pending Payment</button>
              <button className="filter-btn">Ready for Report</button>
              <button className="filter-btn">Completed</button>
            </div>

            <div className="card-grid">
              {labTests.map(test => (
                <div key={test.id} className="lab-test-card card">
                  <div className="test-header">
                    <h3>{test.test_name}</h3>
                    <span className={`status ${test.status}`}>{test.status}</span>
                  </div>
                  
                  <div className="test-details">
                    <p><strong>Patient:</strong> {test.patient_name}</p>
                    <p><strong>Date:</strong> {new Date(test.date).toLocaleDateString()}</p>
                    <p><strong>Payment:</strong> 
                      <span className={`payment-status ${test.payment_status}`}>
                        {test.payment_status}
                      </span>
                    </p>
                  </div>

                  <div className="test-actions">
                    {test.payment_status === 'Pending' && (
                      <button 
                        onClick={() => updatePaymentStatus(test.id, 'Payment Verified')}
                        className="btn-primary btn-small"
                      >
                        Verify Payment
                      </button>
                    )}
                    {test.payment_status === 'Payment Verified' && test.status === 'Pending' && (
                      <button 
                        onClick={() => setView('lab-reports')}
                        className="btn-secondary btn-small"
                      >
                        Upload Report
                      </button>
                    )}
                    {test.status === 'Report Sent' && (
                      <a 
                        href={test.report_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary btn-small"
                      >
                        View Report
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {labTests.length === 0 && (
                <p className="no-data">No lab tests found</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Lab Technician Dashboard</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Pending Tests</h3>
              <p className="stat-number">{stats.pendingTests}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Today</h3>
              <p className="stat-number">{stats.completedToday}</p>
            </div>
            <div className="stat-card">
              <h3>Awaiting Payment</h3>
              <p className="stat-number">{stats.awaitingPayment}</p>
            </div>
            <div className="stat-card">
              <h3>Total Tests</h3>
              <p className="stat-number">{stats.totalTests}</p>
            </div>
          </div>

          <div className="lab-overview">
            <div className="pending-tests">
              <h3>Tests Ready for Processing</h3>
              <div className="test-list">
                {labTests
                  .filter(t => t.payment_status === 'Payment Verified' && t.status === 'Pending')
                  .slice(0, 5)
                  .map(test => (
                    <div key={test.id} className="test-item">
                      <div className="test-info">
                        <strong>{test.test_name}</strong>
                        <small>{test.patient_name} - {new Date(test.date).toLocaleDateString()}</small>
                      </div>
                      <button 
                        onClick={() => setView('lab-reports')}
                        className="btn-primary btn-small"
                      >
                        Process
                      </button>
                    </div>
                  ))}
                {labTests.filter(t => t.payment_status === 'Payment Verified' && t.status === 'Pending').length === 0 && (
                  <p className="no-data">No tests ready for processing</p>
                )}
              </div>
            </div>

            <div className="recent-uploads">
              <h3>Recent Report Uploads</h3>
              <div className="upload-list">
                {labTests
                  .filter(t => t.status === 'Report Sent')
                  .slice(0, 5)
                  .map(test => (
                    <div key={test.id} className="upload-item">
                      <div className="upload-info">
                        <strong>{test.test_name}</strong>
                        <small>{test.patient_name}</small>
                      </div>
                      <a 
                        href={test.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={() => setView('lab-tests')} className="btn-primary">
              Manage All Tests
            </button>
            <button onClick={() => setView('lab-reports')} className="btn-secondary">
              Upload Reports
            </button>
          </div>
        </>
      )}
    </div>
  );
};