import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { Payment } from '../models/payment.js';

const router = express.Router();

// GET /api/payments
router.get('/', authenticateToken, authorizeRoles('Receptionist'), async (req, res) => {
  try {
    const payments = await Payment.findAll(req.query);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/appointment/:id
router.post('/appointment/:id', authenticateToken, authorizeRoles('Receptionist'), async (req, res) => {
  try {
    const { amount, method } = req.body;

    const payment = await Payment.markPaid(req.params.id, {
      amount,
      method,
      processed_by: req.user.id
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
