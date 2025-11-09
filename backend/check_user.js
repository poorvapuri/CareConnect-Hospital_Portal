import pool from './config/database.js';

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE email = $1', ['admin@care.com']);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found. Creating default admin...');
      
      // Create admin user
      const createAdmin = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Admin User', 'admin@care.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin'] // This is bcrypt hash of 'password123'
      );
      
      console.log('✅ Admin user created:', createAdmin.rows[0]);
    } else {
      console.log('✅ Admin user found:', result.rows[0]);
      
      // Check if password needs to be reset
      const resetPassword = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
        ['$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@care.com']
      );
      
      console.log('✅ Admin password reset to: password123');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkUsers();