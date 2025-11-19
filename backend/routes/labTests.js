import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { LabTest } from '../models/LabTest.js';
import upload, { uploadLabReport } from '../middleware/upload.js';

const router = express.Router();

// ✅ Create new lab test (by doctor)
router.post('/', authenticateToken, async (req, res) => {
  console.log("🔥 ROUTE HIT: POST /lab-tests");
  console.log("➡ req.user:", req.user);
  console.log("➡ body received:", req.body);
  try {
    const {
      patientId,
      testName,
      date,
      notes,
      paymentStatus,
      suggestedAmount
    } = req.body;

    // ⭐ ADD THIS
    const doctorId = req.user.id; // doctor who is logged in

    const labTest = await LabTest.create({
      patientId,
      doctorId,   // ⭐ include it
      testName,
      date,
      notes,
      paymentStatus,
      suggestedAmount
    });

    res.json(labTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Fetch lab tests (doctor, patient, or technician)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filters = {};

    // Patient can only see their own tests
    if (req.user.role === 'Patient') {
      filters.patientId = req.user.id;
    }

    // Doctor sees tests ordered BY THEM
    if (req.user.role === 'Doctor') {
      filters.doctorId = req.user.id;
    }

    // Admin/receptionist can filter manually
    if (req.query.patientId) {
      filters.patientId = req.query.patientId;
    }

    if (req.query.doctorId) {
      filters.doctorId = req.query.doctorId;
    }

    if (req.query.paymentStatus) {
      filters.paymentStatus = req.query.paymentStatus;
    }

    const labTests = await LabTest.findAll(filters);
    res.json(labTests);

  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ Update payment status
router.patch('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const labTest = await LabTest.updatePaymentStatus(req.params.id, paymentStatus);
    res.json(labTest);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Upload report file (PDF only — optional)
router.post(
  '/:id/upload',
  authenticateToken,
  authorizeRoles('Lab Technician'),
  upload.single('report'),
  uploadLabReport,
  async (req, res) => {
    try {
      const labTest = await LabTest.uploadReport(req.params.id, req.reportUrl);
      res.json(labTest);
    } catch (error) {
      console.error('Error uploading report:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ New route: Submit textual report (no file upload)
router.put('/:id', authenticateToken, authorizeRoles('Lab Technician'), async (req, res) => {
  console.log("🧩 PUT /lab-tests hit:", req.params.id, req.body);  // <--- Add this line
  try {
    const { status, report_notes } = req.body;
    const result = await LabTest.updateReport(req.params.id, {
      status: status || 'Report Sent',
      report_notes: report_notes || ''
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating lab test report:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get pending tests (for lab technician)
router.get('/pending', authenticateToken, authorizeRoles('Lab Technician'), async (req, res) => {
  try {
    const labTests = await LabTest.findAll({
      status: 'Pending',
      paymentStatus: 'Payment Verified'
    });
    res.json(labTests);
  } catch (error) {
    console.error('Error fetching pending lab tests:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get tests by payment status
router.get('/payment-status/:status', authenticateToken, authorizeRoles('Lab Technician'), async (req, res) => {
  try {
    const { status } = req.params;
    const labTests = await LabTest.findAll({
      paymentStatus: status
      
    });
    res.json(labTests);
  } catch (error) {
    console.error('Error fetching lab tests by payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
