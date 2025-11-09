import pool from './config/database.js';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    // Hash a new password
    const newPassword = 'admin123'; // Change this to whatever you want
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('🔐 New password hash:', hashedPassword);
    
    // Update admin user
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, name, email',
      [hashedPassword, 'admin@care.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('📝 Email:', result.rows[0].email);
      console.log('🔑 New password:', newPassword);
    } else {
      console.log('❌ No admin user found with email admin@care.com');
      
      // Create admin user if doesn't exist
      const createUser = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Admin User', 'admin@care.com', hashedPassword, 'Admin']
      );
      
      console.log('✅ Admin user created with password:', newPassword);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
  }
}

resetAdminPassword();