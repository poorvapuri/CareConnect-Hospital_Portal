import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { User } from '../models/user.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const employees = await User.findAll();
    const filteredEmployees = employees.filter(user => 
      user.role !== 'Admin' && user.role !== 'Patient'
    );
    res.json(filteredEmployees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }
    
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;