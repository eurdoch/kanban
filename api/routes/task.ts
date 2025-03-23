import { Router } from 'express';
import { pool } from '../db/index.js';

const router = Router();

// GET /task - Get all tasks
router.get('/', async (req, res) => {
  try {
    console.log('GET /task endpoint called at:', new Date().toISOString());
    
    // Query all tasks from the database, ordered by id
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    
    // Return the tasks as JSON
    res.json(result.rows);
  } catch (error) {
    // Log the error and return a 500 status code
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

export default router;
