import pg from 'pg';
const { Pool } = pg;

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
};

const dbName = process.env.DB_NAME || 'kanban';

// Create a pool for initial connection to the default postgres database
const pgPool = new Pool({
  ...dbConfig,
  database: 'postgres', // Connect to default postgres database first
});

// Function to create the kanban database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  let client;
  try {
    client = await pgPool.connect();
    
    // Check if the database exists
    const checkDbResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1', 
      [dbName]
    );
    
    // If database doesn't exist, create it
    if (checkDbResult.rowCount === 0) {
      console.log(`Database ${dbName} doesn't exist. Creating it now...`);
      // Need to use single quotes for database name in template literal
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    if (client) client.release();
    // Close the initial pool
    await pgPool.end();
  }
};

// Create a pool for the application database
const pool = new Pool({
  ...dbConfig,
  database: dbName,
});

// Function to initialize the database with tables
const initDb = async () => {
  try {
    // First ensure the database exists
    await createDatabaseIfNotExists();
    
    // Create the task_status enum type if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
          CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
        END IF;
      END$$;
    `);

    // Create the tasks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        status task_status DEFAULT 'TODO',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export { pool, initDb };