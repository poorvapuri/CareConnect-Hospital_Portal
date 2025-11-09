import pool from '../config/database.js';

export class Schedule {
  static async create(scheduleData) {
    const { doctorId, day, slots } = scheduleData;
    
    const query = `
      INSERT INTO schedules (doctor_id, day, slots)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [doctorId, day, slots];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByDoctorId(doctorId) {
    const query = 'SELECT * FROM schedules WHERE doctor_id = $1 ORDER BY CASE day WHEN \'Monday\' THEN 1 WHEN \'Tuesday\' THEN 2 WHEN \'Wednesday\' THEN 3 WHEN \'Thursday\' THEN 4 WHEN \'Friday\' THEN 5 WHEN \'Saturday\' THEN 6 WHEN \'Sunday\' THEN 7 END';
    const result = await pool.query(query, [doctorId]);
    return result.rows;
  }

  static async findAll() {
    const query = `
      SELECT s.*, u.name as doctor_name
      FROM schedules s
      JOIN users u ON s.doctor_id = u.id
      ORDER BY u.name, CASE s.day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}