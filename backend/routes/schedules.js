import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { Schedule } from '../models/schedule.js';

const router = express.Router();

// Get all schedules (for admin)
router.get('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule by doctor ID
router.get('/doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const schedules = await Schedule.findByDoctorId(doctorId);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update schedule (for admin)
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { doctorId, day, slots } = req.body;
    const schedule = await Schedule.create({ doctorId, day, slots });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;