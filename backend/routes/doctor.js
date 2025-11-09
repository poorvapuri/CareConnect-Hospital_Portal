import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { User } from '../models/user.js';
import { Appointment } from '../models/appointment.js';

const router = express.Router();

// Get doctor's daily appointments
router.get('/daily-appointments', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      doctorId: req.user.id,
      date: today
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor's calendar view (appointments by date range)
router.get('/calendar', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filters = {
      doctorId: req.user.id
    };
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    // You'll need to update your Appointment model to handle date ranges
    const appointments = await Appointment.findAll(filters);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lab test notes/messages
router.post('/lab-test-notes', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const { patientId, testName, notes, amount } = req.body;
    
    // Create lab test with doctor's notes
    const labTest = await LabTest.create({
      patientId,
      testName,
      date: new Date().toISOString().split('T')[0],
      notes, // Add notes field to your LabTest model
      suggestedAmount: amount, // Add suggestedAmount field
      paymentStatus: 'Pending',
      status: 'Pending'
    });
    
    res.status(201).json(labTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;