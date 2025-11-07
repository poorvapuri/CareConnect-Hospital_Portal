import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config()
// Debug environment variables
console.log('🔧 Environment Check:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

// Parse the connection string to ensure it's valid
const dbUrl = process.env.DATABASE_URL.trim();

// Create pool with multiple SSL fallback options
const poolConfigs = [
  {
    name: 'Neon SSL (Recommended)',
    config: {
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
        requestCert: true
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'Basic SSL',
    config: {
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'No SSL (Local Only)',
    config: {
      connectionString: dbUrl,
      ssl: false
    }
  }
];

let pool = null;
let connectedConfig = null;

async function initializeDatabase() {
  console.log('\n🚀 Attempting to connect to database...\n');
  
  for (const { name, config } of poolConfigs) {
    try {
      console.log(`🔄 Trying configuration: ${name}`);
      const testPool = new Pool(config);
      
      // Test the connection
      const result = await testPool.query('SELECT version() as version, NOW() as current_time');
      
      console.log(`✅ Successfully connected using: ${name}`);
      console.log(`📅 Database time: ${result.rows[0].current_time}`);
      console.log(`🗄️  PostgreSQL version: ${result.rows[0].version}`);
      
      pool = testPool;
      connectedConfig = name;
      
      // Set up error handling for the pool
      pool.on('error', (err) => {
        console.error('❌ Database pool error:', err.message);
      });
      
      pool.on('connect', (client) => {
        console.log('🔌 New client connected to database');
      });
      
      pool.on('remove', (client) => {
        console.log('🔌 Client disconnected from database');
      });
      
      return pool;
      
    } catch (error) {
      console.log(`❌ Failed with ${name}: ${error.message}`);
      
      // Close the test pool if it was created
      try {
        await testPool?.end();
      } catch (e) {
        // Ignore cleanup errors
      }
      
      continue;
    }
  }
  
  throw new Error(`❌ All database connection attempts failed. Last error: ${error.message}`);
}

// Initialize the database connection
let dbPromise = null;

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = initializeDatabase();
  }
  return dbPromise;
}

// Export the pool (for backward compatibility)
export default new Proxy({}, {
  get(target, prop) {
    return async (...args) => {
      const db = await getDatabase();
      return db[prop](...args);
    };
  }
});

// Export a test function
export async function testDatabaseConnection() {
  try {
    const db = await getDatabase();
    const result = await db.query('SELECT NOW() as time, version() as version');
    return {
      success: true,
      time: result.rows[0].time,
      version: result.rows[0].version,
      config: connectedConfig
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Export a function to close the connection
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}