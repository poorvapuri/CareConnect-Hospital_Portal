import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { User } from '../models/user.js';
import { Appointment } from '../models/appointment.js';
// If you use LabTest in the last route, make sure to import it here:
// import { LabTest } from '../models/labtest.js';

const router = express.Router();

/* ✅ FIXED ROUTE — Get all doctors (for Admin, Receptionist, and Patient)
   URL: GET /api/doctors
   Description: Returns all users with role = "Doctor"
*/
router.get('/', authenticateToken, authorizeRoles('Admin', 'Receptionist', 'Patient'), async (req, res) => {
  try {
    // ✅ Correct argument type — your model expects a string, not an object
    const doctors = await User.findAll('Doctor');

    // Respond consistently as JSON
    res.status(200).json({ doctors });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

/* ✅ Doctor's Daily Appointments
   URL: GET /api/doctors/daily-appointments
   Role: Doctor
*/
router.get('/daily-appointments', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      doctorId: req.user.id,
      date: today
    });
    res.json(appointments);
  } catch (error) {
    console.error('❌ Error fetching daily appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ✅ Doctor's Calendar View (Appointments by Date Range)
   URL: GET /api/doctors/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   Role: Doctor
*/
router.get('/calendar', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filters = { doctorId: req.user.id };
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const appointments = await Appointment.findAll(filters);
    res.json(appointments);
  } catch (error) {
    console.error('❌ Error fetching calendar data:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ✅ Lab Test Notes/Messages (written by doctor for receptionist/lab tech)
   URL: POST /api/doctors/lab-test-notes
   Role: Doctor
*/
router.post('/lab-test-notes', authenticateToken, authorizeRoles('Doctor'), async (req, res) => {
  try {
    const { patientId, testName, notes, amount } = req.body;

    // If you use a LabTest model, make sure it's imported at the top.
    // Uncomment below once LabTest model is available:
    // const labTest = await LabTest.create({
    //   patientId,
    //   testName,
    //   date: new Date().toISOString().split('T')[0],
    //   notes,
    //   suggestedAmount: amount,
    //   paymentStatus: 'Pending',
    //   status: 'Pending'
    // });

    // Temporary mock response (remove once LabTest model is used)
    const labTest = {
      patientId,
      testName,
      notes,
      amount,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json(labTest);
  } catch (error) {
    console.error('❌ Error creating lab test note:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
