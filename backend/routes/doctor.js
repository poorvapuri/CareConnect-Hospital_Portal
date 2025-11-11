import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { User } from '../models/user.js';
import { Appointment } from '../models/appointment.js';

const router = express.Router();

/* ✅ NEW ROUTE — Get all doctors (used in patient dashboard)
   URL: GET /api/doctors
   Description: Returns all users with role = "Doctor"
*/
router.get('/', authenticateToken, async (req, res) => {
  try {
    // If your User model uses Sequelize-like helpers:
    const doctors = await User.findAll('Doctor');
    // If you’re using Mongoose instead, replace the above with:
    // const doctors = await User.find({ role: 'Doctor' });

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

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

    // If using a LabTest model, make sure it’s imported and has these fields
    const labTest = await LabTest.create({
      patientId,
      testName,
      date: new Date().toISOString().split('T')[0],
      notes,
      suggestedAmount: amount,
      paymentStatus: 'Pending',
      status: 'Pending'
    });

    res.status(201).json(labTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
