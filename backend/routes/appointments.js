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

// Add these new endpoints

// Get available doctors
// Add or update the available doctors endpoint
router.get('/available', authenticateToken, async (req, res) => {
  try {
    // Get all doctors
    const doctors = await User.findAll('Doctor');
    
    // Format response to include specialization
    const availableDoctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || 'General Medicine', // Default if null
      role: doctor.role
    }));
    
    res.json(availableDoctors);
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get doctor's schedule for a specific date
router.get('/doctor/:doctorId/date/:date', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const appointments = await Appointment.findAll({
      doctorId,
      date
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update the available doctors endpoint
router.get('/available', authenticateToken, async (req, res) => {
  try {
    // Get all doctors with their specializations
    const query = `
      SELECT 
        id,
        name,
        email,
        role,
        COALESCE(specialization, 'General Medicine') as specialization
      FROM users 
      WHERE role = 'Doctor'
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    const doctors = result.rows;
    
    console.log('🏥 Available Doctors:', doctors);
    
    // Ensure specialization is always a string
    const formattedDoctors = doctors.map(doc => ({
      ...doc,
      specialization: doc.specialization && typeof doc.specialization === 'string' 
        ? doc.specialization 
        : 'General Medicine'
    }));
    
    res.json(formattedDoctors);
  } catch (error) {
    console.error('❌ Error fetching available doctors:', error);
    res.status(500).json({ error: error.message });
  }
});

// Walk-in appointment creation
router.post('/walk-in', authenticateToken, authorizeRoles('Receptionist'), async (req, res) => {
  try {
    const { patientName, contactNumber, doctorId, date, time } = req.body;
    
    // Create or find patient
    let patient = await User.findByEmail(`${contactNumber}@patient.com`);
    if (!patient) {
      patient = await User.create({
        name: patientName,
        email: `${contactNumber}@patient.com`,
        password: 'temp123',
        role: 'Patient'
      });
      
      await Patient.create({
        userId: patient.id,
        contactNumber,
        medicalHistory: ''
      });
    }
    
    const appointment = await Appointment.create({
      patientId: patient.id,
      doctorId,
      date,
      time,
      status: 'Scheduled'
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;