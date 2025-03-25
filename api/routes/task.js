import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

// Valid task statuses
const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'STAGED'];

// GET /task - Get all tasks
router.get('/', (_req, res) => {
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

// DELETE /task/:id - Delete a task by ID
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  // Validate id
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid task ID is required' });
  }
  
  console.log(`DELETE /task/${id} endpoint called at:`, new Date().toISOString());
  
  // Delete the task from the database
  const query = `
    DELETE FROM tasks 
    WHERE id = $1
    RETURNING *
  `;
  
  pool.query(query, [id])
    .then(result => {
      // Check if any task was deleted
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `Task with ID ${id} not found` });
      }
      
      // Return success with deleted boolean and the deleted task data
      res.json({
        deleted: true,
        task: result.rows[0]
      });
    })
    .catch(error => {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    });
});

// PUT /task/:id - Update a task by ID
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, status } = req.body;
  
  // Validate id
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid task ID is required' });
  }
  
  // Validate that at least one field is provided to update
  if (!title && !description && !status) {
    return res.status(400).json({ 
      error: 'At least one field (title, description, or status) is required for update' 
    });
  }
  
  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}` 
    });
  }
  
  console.log(`PUT /task/${id} endpoint called at:`, new Date().toISOString());
  console.log('Request body:', req.body);
  
  // Build the update query dynamically based on provided fields
  let updateFields = [];
  const values = [];
  let paramCounter = 1;
  
  if (title) {
    updateFields.push(`title = $${paramCounter}`);
    values.push(title);
    paramCounter++;
  }
  
  if (description !== undefined) {
    updateFields.push(`description = $${paramCounter}`);
    values.push(description);
    paramCounter++;
  }
  
  if (status) {
    updateFields.push(`status = $${paramCounter}`);
    values.push(status);
    paramCounter++;
  }
  
  // Always update the updated_at timestamp
  updateFields.push(`updated_at = NOW()`);
  
  // Add the id as the last parameter
  values.push(id);
  
  const query = `
    UPDATE tasks 
    SET ${updateFields.join(', ')} 
    WHERE id = $${paramCounter}
    RETURNING *
  `;
  
  pool.query(query, values)
    .then(result => {
      // Check if task was found
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `Task with ID ${id} not found` });
      }
      
      // Return the updated task
      res.json(result.rows[0]);
    })
    .catch(error => {
      console.error('Error updating task:', error);
      
      // Handle validation errors for status enum
      if (error.code === '22P02' && error.message?.includes('task_status')) {
        return res.status(400).json({ 
          error: 'Invalid status value. Must be one of: TODO, IN_PROGRESS, DONE' 
        });
      }
      
      res.status(500).json({ error: 'Failed to update task' });
    });
});

export default router;
