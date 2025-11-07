import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create(userData) {
    const { name, email, password, role = 'Patient' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
    `;
    
    const values = [name, email, hashedPassword, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, role FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(role = null) {
    let query = 'SELECT id, name, email, role FROM users';
    let values = [];
    
    if (role) {
      query += ' WHERE role = $1';
      values = [role];
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}