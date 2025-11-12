// frontend/src/components/dashboard/LabTechnicianDashboard.jsx
import React, { useState, useEffect, useMemo, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

// Child row component that manages its own textarea state to avoid focus loss
const TestRow = memo(function TestRow({ test, onReportSubmitted }) {
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState(test.report_notes || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNotes(test.report_notes || '');
  }, [test.report_notes]);

  const toggle = () => setVisible(v => !v);

  const submit = async () => {
    const trimmed = (notes || '').trim();
    if (!trimmed) return alert('Please enter some notes before submitting.');

    setSubmitting(true);
    try {
      const payload = {
        status: 'Report Sent',
        report_notes: trimmed,
        updated_at: new Date().toISOString()
      };
      // ✅ Auto-mark test as done (Report Sent)
      await apiService.updateLabTest(test.id, payload);
      setVisible(false);
      setSubmitting(false);
      onReportSubmitted && onReportSubmitted();
      return { ok: true };
    } catch (err) {
      console.error('submit report error', err);
      setSubmitting(false);
      alert('Failed to submit report');
      return { ok: false };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: 12,
        borderRadius: 10,
        background: '#fafafa',
        alignItems: 'flex-start'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {test.patient_name || (test.patient && test.patient.name) || 'Unknown'}
        </div>
        <div style={{ color: '#555', marginTop: 6 }}>
          {test.test_name || 'Lab Test'}
        </div>
        <div style={{ color: '#777', fontSize: 13, marginTop: 6 }}>
          {test.date
            ? new Date(test.date).toLocaleDateString('en-GB')
            : new Date(test.created_at).toLocaleDateString('en-GB')}
        </div>

        {test.report_notes && (
          <div style={{ marginTop: 8, color: '#333' }}>
            <strong>Report Notes:</strong>
            <div style={{ marginTop: 6 }}>{test.report_notes}</div>
          </div>
        )}
      </div>

      <div
        style={{
          width: 260,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end'
        }}
      >
        <div style={{ alignSelf: 'stretch', textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 10px',
              borderRadius: 8,
              background: '#fff',
              boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
            }}
          >
            {test.status || 'Pending'}
          </span>
        </div>

        {/* ✅ Removed Mark Done button */}
        <button
          onClick={toggle}
          className="btn-primary"
          style={{ padding: '8px 12px', borderRadius: 8 }}
          type="button"
          disabled={submitting}
        >
          {visible ? 'Cancel' : test.report_notes ? 'Edit Report' : 'Add Report'}
        </button>

        {visible && (
          <div style={{ width: '100%', marginTop: 8 }}>
            <textarea
              placeholder="Add report notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 8,
                border: '1px solid #e6e6e6'
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 8
              }}
            >
              <button
                onClick={submit}
                className="btn-primary"
                disabled={submitting}
                type="button"
                style={{ padding: '8px 12px', borderRadius: 8 }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
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

  // ✅ New: store all tests separately for dashboard stats
  const [allTests, setAllTests] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending'); // ✅ new filter for Pending/Completed tabs

  useEffect(() => {
    fetchAllTests();
  }, [refresh]);

  useEffect(() => {
    applyFilter();
  }, [filter, allTests]);

  // ✅ Fetch all tests (for dashboard + tabs)
  const fetchAllTests = async () => {
    try {
      setLoading(true);
      const tests = await apiService.getLabTests();
      setAllTests(tests || []);
    } catch (err) {
      console.error('Error fetching lab tests', err);
      showMessage && showMessage('error', 'Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter tests for current tab
  const applyFilter = () => {
    if (filter === 'pending') {
      setLabTests(allTests.filter(t => String(t.status || '').toLowerCase() === 'pending'));
    } else {
      setLabTests(allTests.filter(t => String(t.status || '').toLowerCase() === 'report sent'));
    }
  };

  // ✅ Dashboard Stats (based on allTests)
  const totalTests = allTests.length;

  const testsPending = useMemo(() => {
    return allTests.filter(
      (t) => String(t.status || '').toLowerCase() === 'pending'
    ).length;
  }, [allTests]);

  const reportsUploadedToday = useMemo(() => {
    const todayIST = new Date().toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata'
    });
    return allTests.filter((t) => {
      const statusLower = String(t.status || '').toLowerCase();
      const isReport = statusLower === 'report sent';
      if (!isReport) return false;
      const updatedAt =
        t.updated_at ||
        t.report_uploaded_at ||
        t.updatedAt ||
        t.cleared_at ||
        t.date;
      if (!updatedAt) return false;
      try {
        const updatedDateIST = new Date(updatedAt).toLocaleDateString('en-GB', {
          timeZone: 'Asia/Kolkata'
        });
        return updatedDateIST === todayIST;
      } catch {
        return false;
      }
    }).length;
  }, [allTests]);

  const handleReportSubmitted = async () => {
    showMessage && showMessage('success', 'Report submitted successfully');
    await fetchAllTests(); // refresh both dashboard and list
    triggerRefresh && triggerRefresh();
  };

  // ✅ Keep your main dashboard with stats unchanged
  const DashboardView = () => (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 28,
          boxShadow: '0 10px 28px rgba(20,20,40,0.06)'
        }}
      >
        <h2 style={{ marginTop: 0 }}>Lab Test Management</h2>

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 18,
            flexWrap: 'wrap'
          }}
        >
          <StatCard title="TESTS PENDING" value={testsPending} />
          <StatCard title="REPORTS UPLOADED TODAY" value={reportsUploadedToday} />
          <StatCard title="TOTAL TESTS" value={totalTests} />
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value }) => (
    <div
      style={{
        flex: '1 1 28%',
        minWidth: 220,
        borderRadius: 12,
        padding: '26px 20px',
        background: 'linear-gradient(135deg,#6d6af0,#8b50c9)',
        color: '#fff',
        boxShadow: '0 8px 28px rgba(70,50,120,0.08)',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: 13, letterSpacing: 1.1, opacity: 0.95 }}>
        {title}
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );

  // ✅ Updated Lab Tests Page (with Pending/Completed filters)
  const LabTestsView = () => (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 22,
          boxShadow: '0 10px 28px rgba(20,20,40,0.06)'
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: 'left' }}>Lab Tests</h2>

        {/* ✅ Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', borderRadius: 8 }}
          >
            Pending Tests
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', borderRadius: 8 }}
          >
            Completed Tests
          </button>
        </div>

        {loading && <p>Loading lab tests...</p>}
        {!loading && labTests.length === 0 && (
          <p>{filter === 'pending' ? 'No pending tests.' : 'No completed tests.'}</p>
        )}

        {!loading && labTests.length > 0 && (
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            {labTests.map((test) => (
              <TestRow
                key={test.id}
                test={test}
                onReportSubmitted={handleReportSubmitted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (view === 'lab-tests') return <LabTestsView />;
  return <DashboardView />;
};

export default LabTechnicianDashboard;
