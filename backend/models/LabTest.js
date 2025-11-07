import pool from '../config/database.js';

export class LabTest {
  static async create(labTestData) {
    const { patientId, testName, date, paymentStatus = 'Pending' } = labTestData;
    
    const query = `
      INSERT INTO lab_tests (patient_id, test_name, date, payment_status, status)
      VALUES ($1, $2, $3, $4, 'Pending')
      RETURNING *
    `;
    
    const values = [patientId, testName, date, paymentStatus];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT lt.*, 
             u.name as patient_name
      FROM lab_tests lt
      JOIN users u ON lt.patient_id = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters.patientId) {
      conditions.push(`lt.patient_id = $${paramIndex++}`);
      values.push(filters.patientId);
    }
    
    if (filters.paymentStatus) {
      conditions.push(`lt.payment_status = $${paramIndex++}`);
      values.push(filters.paymentStatus);
    }
    
    if (filters.status) {
      conditions.push(`lt.status = $${paramIndex++}`);
      values.push(filters.status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY lt.date DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT lt.*, 
             u.name as patient_name
      FROM lab_tests lt
      JOIN users u ON lt.patient_id = u.id
      WHERE lt.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updatePaymentStatus(id, paymentStatus) {
    const query = 'UPDATE lab_tests SET payment_status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [paymentStatus, id]);
    return result.rows[0];
  }

  static async uploadReport(id, reportUrl) {
    const query = `
      UPDATE lab_tests 
      SET report_url = $1, status = 'Report Sent' 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [reportUrl, id]);
    return result.rows[0];
  }
}