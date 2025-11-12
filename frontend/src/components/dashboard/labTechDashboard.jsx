// frontend/src/components/dashboard/LabTechnicianDashboard.jsx
import React, { useState, useEffect, useMemo, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

// Child row component that manages its own textarea state to avoid focus loss
const TestRow = memo(function TestRow({ test, onReportSubmitted, onMarkDone }) {
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState(test.report_notes || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // if test.report_notes updates from server we update local notes (but don't override while typing)
    setNotes(test.report_notes || '');
  }, [test.report_notes]);

  const toggle = () => setVisible(v => !v);

  const submit = async () => {
    const trimmed = (notes || '').trim();
    if (!trimmed) {
      // user-facing message is handled in parent usually; return false to indicate failure
      return { ok: false, message: 'Please enter some notes before submitting.' };
    }
    setSubmitting(true);
    try {
      const payload = {
        status: 'Report Sent',
        report_notes: trimmed,
        updated_at: new Date().toISOString()
      };
      await apiService.updateLabTest(test.id || test._id || test.test_id, payload);
      setVisible(false);
      setSubmitting(false);
      onReportSubmitted && onReportSubmitted();
      return { ok: true };
    } catch (err) {
      console.error('submit report error', err);
      setSubmitting(false);
      return { ok: false, message: 'Failed to submit report' };
    }
  };

  const markDone = async () => {
    setSubmitting(true);
    try {
      await onMarkDone(test.id || test._id || test.test_id);
      setSubmitting(false);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12,
      padding: 12, borderRadius: 10, background: '#fafafa', alignItems: 'flex-start'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{test.patient_name || (test.patient && (test.patient.name || String(test.patient))) || 'Unknown'}</div>
        <div style={{ color: '#555', marginTop: 6 }}>{test.test_name || test.lab_test_name || 'Lab Test'}</div>
        <div style={{ color: '#777', fontSize: 13, marginTop: 6 }}>
          {test.date ? new Date(test.date).toLocaleDateString('en-GB') : (test.created_at ? new Date(test.created_at).toLocaleDateString('en-GB') : '')}
          {test.time ? ` • ${test.time}` : ''}
        </div>

        {test.report_notes && (
          <div style={{ marginTop: 8, color: '#333' }}>
            <strong>Report Notes:</strong>
            <div style={{ marginTop: 6 }}>{test.report_notes}</div>
          </div>
        )}
      </div>

      <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button
            onClick={toggle}
            className="btn-primary"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8 }}
            type="button"
          >
            {visible ? 'Cancel' : 'Add Report'}
          </button>

          <button
            onClick={markDone}
            className="btn-secondary"
            style={{ padding: '8px 12px', borderRadius: 8 }}
            type="button"
            disabled={submitting}
          >
            Mark Done
          </button>
        </div>

        <div style={{ alignSelf: 'stretch', textAlign: 'right' }}>
          <span style={{
            display: 'inline-block', padding: '6px 10px', borderRadius: 8,
            background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            {test.status || 'Unknown'}
          </span>
        </div>

        {visible && (
          <div style={{ width: '100%', marginTop: 8 }}>
            {/* local state textarea — keeping this local prevents parent's re-render from stealing focus */}
            <textarea
              placeholder="Add report notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={async () => {
                  const res = await submit();
                  if (!res.ok) {
                    // notify user; parent may showMessage, but we'll return message here
                    alert(res.message || 'Failed');
                  }
                }}
                className="btn-primary"
                disabled={submitting}
                type="button"
                style={{ padding: '8px 12px', borderRadius: 8 }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const LabTechnicianDashboard = () => {
  const { view, setView, showMessage, refresh, triggerRefresh } = useApp();

  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLabTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const tests = await apiService.getLabTests();
      setLabTests(tests || []);
    } catch (err) {
      console.error('Error fetching lab tests', err);
      showMessage && showMessage('error', 'Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  // Stats derived from returned DB data (keeps numbers accurate)
  const totalTests = useMemo(() => (Array.isArray(labTests) ? labTests.length : 0), [labTests]);

  const testsPending = useMemo(() => {
    if (!Array.isArray(labTests)) return 0;
    return labTests.filter(t =>
      String(t.status || '').toLowerCase() === 'pending' &&
      String(t.payment_status || '') === 'Payment Verified'
    ).length;
  }, [labTests]);

  const reportsUploadedToday = useMemo(() => {
    if (!Array.isArray(labTests)) return 0;
    const todayIST = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
    return labTests.filter(t => {
      const statusLower = String(t.status || '').toLowerCase();
      const isReport = statusLower === 'report sent' || Boolean(t.report_notes);
      if (!isReport) return false;
      const updatedAt = t.updated_at || t.report_uploaded_at || t.updatedAt || t.cleared_at || t.date;
      if (!updatedAt) return false;
      try {
        const updatedDateIST = new Date(updatedAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
        return updatedDateIST === todayIST;
      } catch {
        return false;
      }
    }).length;
  }, [labTests]);

  // Called by child after successful submit
  const handleReportSubmitted = () => {
    triggerRefresh && triggerRefresh();
  };

  const handleMarkDone = async (testId) => {
    try {
      await apiService.updateLabTest(testId, {
        status: 'Report Sent',
        is_cleared: true,
        cleared_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      showMessage && showMessage('success', 'Test marked as completed and cleared');
      triggerRefresh && triggerRefresh();
    } catch (error) {
      console.error('Failed to mark done', error);
      showMessage && showMessage('error', 'Failed to update test status');
    }
  };

  // Dashboard view (stats)
  const DashboardView = () => (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 28,
        boxShadow: '0 10px 28px rgba(20,20,40,0.06)'
      }}>
        <h2 style={{ marginTop: 0 }}>Lab Test Management</h2>

        <div style={{ display: 'flex', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 28%', minWidth: 220, borderRadius: 12, padding: '26px 20px',
            background: 'linear-gradient(135deg,#6d6af0,#8b50c9)', color: '#fff',
            boxShadow: '0 8px 28px rgba(70,50,120,0.08)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>TESTS PENDING</div>
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{testsPending}</div>
          </div>

          <div style={{
            flex: '1 1 28%', minWidth: 220, borderRadius: 12, padding: '26px 20px',
            background: 'linear-gradient(135deg,#6d6af0,#8b50c9)', color: '#fff',
            boxShadow: '0 8px 28px rgba(70,50,120,0.08)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>REPORTS UPLOADED TODAY</div>
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{reportsUploadedToday}</div>
          </div>

          <div style={{
            flex: '1 1 28%', minWidth: 220, borderRadius: 12, padding: '26px 20px',
            background: 'linear-gradient(135deg,#6d6af0,#8b50c9)', color: '#fff',
            boxShadow: '0 8px 28px rgba(70,50,120,0.08)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>TOTAL TESTS</div>
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{totalTests}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Lab tests list view - only tests & Add Report (no file upload)
  const LabTestsView = () => (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 22,
        boxShadow: '0 10px 28px rgba(20,20,40,0.06)'
      }}>
        <h2 style={{ marginTop: 0, textAlign: 'left' }}>Lab Tests</h2>

        {loading && <p>Loading lab tests...</p>}
        {!loading && labTests.length === 0 && <p>No lab tests available.</p>}

        {!loading && labTests.length > 0 && (
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            {labTests.map(test => {
              const id = test.id || test._id || test.test_id || JSON.stringify(test);
              return (
                <TestRow
                  key={id}
                  test={test}
                  onReportSubmitted={handleReportSubmitted}
                  onMarkDone={handleMarkDone}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (view === 'lab-tests') {
    return <LabTestsView />;
  }

  return <DashboardView />;
};

export default LabTechnicianDashboard;
