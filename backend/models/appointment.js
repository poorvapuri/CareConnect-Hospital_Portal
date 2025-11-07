import pool from '../config/database.js';

export class Appointment {
  static async create(appointmentData) {
    const { patientId, doctorId, date, time, status = 'Scheduled' } = appointmentData;
    
    const query = `
      INSERT INTO appointments (patient_id, doctor_id, date, time, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [patientId, doctorId, date, time, status];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT a.*, 
             p.name as patient_name,
             d.name as doctor_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters.patientId) {
      conditions.push(`a.patient_id = $${paramIndex++}`);
      values.push(filters.patientId);
    }
    
    if (filters.doctorId) {
      conditions.push(`a.doctor_id = $${paramIndex++}`);
      values.push(filters.doctorId);
    }
    
    if (filters.date) {
      conditions.push(`a.date = $${paramIndex++}`);
      values.push(filters.date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.date, a.time';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT a.*, 
             p.name as patient_name,
             d.name as doctor_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
}