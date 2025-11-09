import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Patient } from '../models/Patient.js';

const router = express.Router();

// Login endpoint (unchanged)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patient Registration Endpoint
router.post('/register/patient', async (req, res) => {
  try {
    const { name, email, password, contactNumber, medicalHistory = '' } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !contactNumber) {
      return res.status(400).json({ error: 'Name, email, password, and contact number are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create patient user
    const user = await User.create({
      name,
      email,
      password,
      role: 'Patient'
    });
    
    // Create patient record
    await Patient.create({
      userId: user.id,
      contactNumber,
      medicalHistory
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employee Registration Endpoint (Admin only)
router.post('/register/employee', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    
    // Validate role
    const validRoles = ['Doctor', 'Receptionist', 'Lab Technician'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be Doctor, Receptionist, or Lab Technician' });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }
    
    // Create employee user
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    
    res.status(201).json({
      message: 'Employee registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;