import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { Prescription } from '../models/prescription.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const { patientId, medication, dosage, instructions } = req.body;
    
    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.id,
      medication,
      dosage,
      instructions
    });
    
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const filters = {};
    
    if (req.user.role === 'Doctor') {
      filters.doctorId = req.user.id;
    } else if (req.user.role === 'Patient') {
      filters.patientId = req.user.id;
    }
    
    const prescriptions = await Prescription.findAll(filters);
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const prescription = await Prescription.update(req.params.id, req.body);
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    await Prescription.delete(req.params.id);
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;