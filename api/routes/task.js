import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

// GET /task - Get all tasks
router.get('/', (req, res) => {
  console.log('GET /task endpoint called at:', new Date().toISOString());
  
  // Query all tasks from the database, ordered by id
  pool.query('SELECT * FROM tasks ORDER BY id ASC')
    .then(result => {
      // Return the tasks as JSON
      res.json(result.rows);
    })
    .catch(error => {
      // Log the error and return a 500 status code
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    });
});

// POST /task - Create a new task
router.post('/', (req, res) => {
  const { title, description, status = 'TODO' } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  console.log('POST /task endpoint called at:', new Date().toISOString());
  console.log('Request body:', req.body);
  
  // Insert the task into the database
  const query = `
    INSERT INTO tasks (title, description, status) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;
  
  const values = [title, description, status];
  
  pool.query(query, values)
    .then(result => {
      // Return the created task with 201 Created status
      res.status(201).json(result.rows[0]);
    })
    .catch(error => {
      console.error('Error creating task:', error);
      
      // Handle validation errors for status enum
      if (error.code === '22P02' && error.message?.includes('task_status')) {
        return res.status(400).json({ 
          error: 'Invalid status value. Must be one of: TODO, IN_PROGRESS, DONE' 
        });
      }
      
      res.status(500).json({ error: 'Failed to create task' });
    });
});

export default router;