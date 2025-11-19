import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { Payment } from '../models/payment.js';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/payments
router.get('/', authenticateToken, authorizeRoles('Receptionist'), async (req, res) => {
  try {
    const payments = await Payment.findAll(req.query);
    res.json(payments);
  } catch (err) {
    console.error('❌ Error fetching payments:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
});

// POST /api/payments/appointment/:id
router.post('/appointment/:id', authenticateToken, authorizeRoles('Receptionist'), async (req, res) => {
  const { id } = req.params;
  const { amount = 0, method = 'Cash' } = req.body;

  try {
    // ✅ Step 1: Mark appointment as Paid in the appointments table
    const updateResult = await pool.query(
      `UPDATE appointments
       SET payment_status = 'Paid', status = 'Completed'
       WHERE id = $1
       RETURNING id, patient_id, doctor_id, payment_status, status, date, time`,
      [id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = updateResult.rows[0];

    // ✅ Step 2: Record payment in the payments table (if model supports it)
    let paymentRecord = null;
    try {
      paymentRecord = await Payment.markPaid(id, {
        amount,
        method,
        processed_by: req.user.id
      });
    } catch (modelError) {
      console.warn('⚠️ Payment model not found or failed, skipping Payment.markPaid()', modelError);
    }

    // ✅ Step 3: Return unified success response
    return res.json({
      message: 'Appointment marked as paid successfully.',
      appointment,
      payment: paymentRecord || null
    });

  } catch (err) {
    console.error('❌ Payment processing error:', err);
    return res.status(500).json({ error: 'Failed to mark appointment as paid.' });
  }
});

export default router;
