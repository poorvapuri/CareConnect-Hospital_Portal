// import pool from '../config/database.js';

// export class LabTest {
// // Update the create method to include notes and suggestedAmount
// static async create(labTestData) {
//   const { 
//     patientId, 
//     testName, 
//     date, 
//     paymentStatus = 'Pending',
//     notes = '',
//     suggestedAmount = 0
//   } = labTestData;
  
//   const query = `
//     INSERT INTO lab_tests (patient_id, test_name, date, payment_status, status, notes, suggested_amount)
//     VALUES ($1, $2, $3, $4, 'Pending', $5, $6)
//     RETURNING *
//   `;
  
//   const values = [patientId, testName, date, paymentStatus, notes, suggestedAmount];
//   const result = await pool.query(query, values);
//   return result.rows[0];
// }

//   static async findAll(filters = {}) {
//     let query = `
//       SELECT lt.*, 
//              u.name as patient_name
//       FROM lab_tests lt
//       JOIN users u ON lt.patient_id = u.id
//     `;
    
//     const conditions = [];
//     const values = [];
//     let paramIndex = 1;
    
//     if (filters.patientId) {
//       conditions.push(`lt.patient_id = $${paramIndex++}`);
//       values.push(filters.patientId);
//     }
    
//     if (filters.paymentStatus) {
//       conditions.push(`lt.payment_status = $${paramIndex++}`);
//       values.push(filters.paymentStatus);
//     }
    
//     if (filters.status) {
//       conditions.push(`lt.status = $${paramIndex++}`);
//       values.push(filters.status);
//     }
    
//     if (conditions.length > 0) {
//       query += ' WHERE ' + conditions.join(' AND ');
//     }
    
//     query += ' ORDER BY lt.date DESC';
    
//     const result = await pool.query(query, values);
//     return result.rows;
//   }

//   static async findById(id) {
//     const query = `
//       SELECT lt.*, 
//              u.name as patient_name
//       FROM lab_tests lt
//       JOIN users u ON lt.patient_id = u.id
//       WHERE lt.id = $1
//     `;
//     const result = await pool.query(query, [id]);
//     return result.rows[0];
//   }

//   static async updatePaymentStatus(id, paymentStatus) {
//     const query = 'UPDATE lab_tests SET payment_status = $1 WHERE id = $2 RETURNING *';
//     const result = await pool.query(query, [paymentStatus, id]);
//     return result.rows[0];
//   }
// static async updateReport(id, { status, report_notes }) {
//   const query = `
//     UPDATE lab_tests
//     SET 
//       status = $1,
//       report_notes = $2,
//       is_cleared = true,
//       cleared_at = CURRENT_TIMESTAMP,
//       updated_at = CURRENT_TIMESTAMP
//     WHERE id = $3
//     RETURNING *;
//   `;
//   const result = await pool.query(query, [status, report_notes, id]);
//   return result.rows[0];
// }

//   static async uploadReport(id, reportUrl) {
//     const query = `
//       UPDATE lab_tests 
//       SET report_url = $1, status = 'Report Sent' 
//       WHERE id = $2 
//       RETURNING *
//     `;
//     const result = await pool.query(query, [reportUrl, id]);
//     return result.rows[0];
//   }


// }



import pool from '../config/database.js';

console.log("🟩 Loaded LabTest model FROM:", import.meta.url);

export class LabTest {

  // ⭐ UPDATED create() method — doctorId added
  static async create(labTestData) {

   console.log("🔥 LabTest.create() invoked");
  console.log("🧩 Received labTestData:", labTestData);

  const { 
    patientId, 
    doctorId,
    testName, 
    date, 
    paymentStatus = 'Pending',
    notes = '',
    suggestedAmount = 0
  } = labTestData;

  const query = `
    INSERT INTO lab_tests 
      (patient_id, doctor_id, test_name, date, payment_status, status, notes, suggested_amount)
    VALUES ($1, $2, $3, $4, $5, 'Pending', $6, $7)
    RETURNING *
  `;
  
  const values = [
    patientId,
    doctorId,
    testName,
    date,
    paymentStatus,
    notes,
    suggestedAmount
  ];

  console.log("🚀 Insert values:", values);  // <--- ADD THIS

  const result = await pool.query(query, values);
  return result.rows[0];
}


  // ⭐ UPDATED findAll() method — doctorId filter added
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

  // ⭐ FIXED — Add this
  if (filters.doctorId) {
    conditions.push(`lt.doctor_id = $${paramIndex++}`);
    values.push(filters.doctorId);
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
             u.name as patient_name,
             d.name as doctor_name
      FROM lab_tests lt
      JOIN users u ON lt.patient_id = u.id
      LEFT JOIN users d ON lt.doctor_id = d.id
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

  static async updateReport(id, { status, report_notes }) {
    const query = `
      UPDATE lab_tests
      SET 
        status = $1,
        report_notes = $2,
        is_cleared = true,
        cleared_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, report_notes, id]);
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
