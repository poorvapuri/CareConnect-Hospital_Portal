import pool from '../config/database.js';

export class Payment {
  static async create({ appointment_id, amount, payment_method, processed_by }) {
    const query = `
      INSERT INTO payments (
        appointment_id,
        amount,
        payment_method,
        payment_status,
        payment_date,
        processed_by
      )
      VALUES ($1, $2, $3, 'Paid', NOW(), $4)
      RETURNING *
    `;

    const values = [appointment_id, amount, payment_method, processed_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, a.patient_id, a.doctor_id, a.date, a.time,
             u.name AS patient_name
      FROM payments p
      LEFT JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN users u ON a.patient_id = u.id
    `;

    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.date) {
      conditions.push(`DATE(p.payment_date) = $${index++}`);
      values.push(filters.date);
    }

    if (filters.payment_status) {
      conditions.push(`p.payment_status = $${index++}`);
      values.push(filters.payment_status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY p.payment_date DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async markPaid(appointment_id, { amount, method, processed_by }) {
    const query = `
      INSERT INTO payments (
        appointment_id,
        amount,
        payment_method,
        payment_status,
        payment_date,
        processed_by
      )
      VALUES ($1, $2, $3, 'Paid', NOW(), $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      appointment_id,
      amount,
      method,
      processed_by
    ]);

    // Also update appointment table
    await pool.query(
      `UPDATE appointments 
       SET payment_status='Paid', payment_amount=$1 
       WHERE id=$2`,
      [amount, appointment_id]
    );

    return result.rows[0];
  }
}
