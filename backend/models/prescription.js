import pool from '../config/database.js';

export class Prescription {
  static async create(prescriptionData) {
    const { patientId, doctorId, medication, dosage, instructions } = prescriptionData;
    
    const query = `
      INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, instructions, date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      RETURNING *
    `;
    
    const values = [patientId, doctorId, medication, dosage, instructions];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, 
             pt.name as patient_name,
             d.name as doctor_name
      FROM prescriptions p
      JOIN users pt ON p.patient_id = pt.id
      JOIN users d ON p.doctor_id = d.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters.patientId) {
      conditions.push(`p.patient_id = $${paramIndex++}`);
      values.push(filters.patientId);
    }
    
    if (filters.doctorId) {
      conditions.push(`p.doctor_id = $${paramIndex++}`);
      values.push(filters.doctorId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.date DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM prescriptions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE prescriptions SET ${setClause} WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM prescriptions WHERE id = $1';
    await pool.query(query, [id]);
  }
}