import pool from '../config/database.js';

export class Patient {
  static async create(patientData) {
    const { userId, contactNumber, medicalHistory } = patientData;
    
    const query = `
      INSERT INTO patients (user_id, contact_number, medical_history)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [userId, contactNumber, medicalHistory];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM patients WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}