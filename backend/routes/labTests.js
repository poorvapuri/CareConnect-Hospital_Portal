import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { LabTest } from '../models/LabTest.js';
import upload, { uploadLabReport } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, testName, date } = req.body;
    
    const labTest = await LabTest.create({
      patientId,
      testName,
      date
    });
    
    res.status(201).json(labTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const filters = {};
    
    if (req.user.role === 'Patient') {
      filters.patientId = req.user.id;
    }
    
    if (req.query.paymentStatus) {
      filters.paymentStatus = req.query.paymentStatus;
    }
    
    const labTests = await LabTest.findAll(filters);
    res.json(labTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const labTest = await LabTest.updatePaymentStatus(req.params.id, paymentStatus);
    res.json(labTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/upload', 
  authenticateToken, 
  authorizeRoles('Lab Technician'),
  upload.single('report'),
  uploadLabReport,
  async (req, res) => {
    try {
      const labTest = await LabTest.uploadReport(req.params.id, req.reportUrl);
      res.json(labTest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


// Add these new endpoints

// Get pending tests
router.get('/pending', authenticateToken, authorizeRoles('Lab Technician'), async (req, res) => {
  try {
    const labTests = await LabTest.findAll({
      status: 'Pending',
      paymentStatus: 'Payment Verified'
    });
    res.json(labTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tests by payment status
router.get('/payment-status/:status', authenticateToken, authorizeRoles('Lab Technician'), async (req, res) => {
  try {
    const { status } = req.params;
    const labTests = await LabTest.findAll({
      paymentStatus: status
    });
    res.json(labTests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;