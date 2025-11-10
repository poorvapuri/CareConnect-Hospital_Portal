import pool from '../config/database.js';

export class Doctor {
  static async create(doctorData) {
    const { userId, specialization } = doctorData;
    
    const query = `
      INSERT INTO doctors (user_id, specialization)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const values = [userId, specialization];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM doctors WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT d.*, u.name, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT d.*, u.name, u.email
      FROM doctors d
      JOIN users u ON d.user_id = u.id
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}