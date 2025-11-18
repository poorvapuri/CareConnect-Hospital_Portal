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

    static async updateById(id, updates) {
    const { date, time, reason, status } = updates;
    const result = await pool.query(
      `UPDATE appointments 
       SET date = $1, time = $2, reason = $3, status = $4 
       WHERE id = $5 
       RETURNING *`,
      [date, time, reason, status, id]
    );
    return result.rows[0];
  }

  static async cancelById(id) {
    const result = await pool.query(
      `UPDATE appointments 
       SET status = 'Cancelled' 
       WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }


  // ✅ Update appointment (date/time/reason)
static async update(id, updates) {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${index++}`);
    values.push(value);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE appointments
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *;
  `;

  values.push(id);
  const result = await pool.query(query, values);
  return result.rows[0];
}

// ✅ Update appointment status (cancel/complete)
static async updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

}