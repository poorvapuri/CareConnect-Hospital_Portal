import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { Appointment } from '../models/appointment.js';
import { User } from '../models/user.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;
    
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time
    });
    
    res.status(201).json(appointment);
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
    
    if (req.query.date) {
      filters.date = req.query.date;
    }
    
    const appointments = await Appointment.findAll(filters);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.updateStatus(req.params.id, status);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;