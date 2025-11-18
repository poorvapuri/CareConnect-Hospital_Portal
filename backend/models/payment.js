import pool from '../config/database.js';

export class Payment {

  // Fetch payments with filters
  static async findAll(filters = {}) {
    let query = `SELECT * FROM payments WHERE 1=1`;
    const params = [];
    let index = 1;

    if (filters.appointmentId) {
      query += ` AND appointment_id = $${index++}`;
      params.push(filters.appointmentId);
    }

    if (filters.patientId) {
      query += ` AND patient_id = $${index++}`;
      params.push(filters.patientId);
    }

    if (filters.status) {
      query += ` AND status = $${index++}`;
      params.push(filters.status);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }


  // ⭐ FIXED: MARK APPOINTMENT AS PAID (Backend logic)
  static async markPaid(appointmentId, { amount, method, processed_by }) {

    // 1️⃣ Validate appointment exists
    const aptRes = await pool.query(
      `SELECT * FROM appointments WHERE id = $1`,
      [appointmentId]
    );

    if (aptRes.rows.length === 0) {
      throw new Error("Appointment not found");
    }

    const appointment = aptRes.rows[0];

    // 2️⃣ Update appointment table → payment_status = 'Paid'
    await pool.query(
      `UPDATE appointments 
       SET payment_status = 'Paid' 
       WHERE id = $1`,
      [appointmentId]
    );

    // 3️⃣ Insert into payments table
    const payRes = await pool.query(
      `INSERT INTO payments (appointment_id, patient_id, amount, method, status, processed_by)
       VALUES ($1, $2, $3, $4, 'Paid', $5)
       RETURNING *`,
      [
        appointmentId,
        appointment.patient_id,
        amount || 0,
        method || 'Cash',
        processed_by
      ]
    );

    return payRes.rows[0];
  }

}
