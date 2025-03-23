import { Router } from 'express';

const router = Router();

// GET /task
router.get('/', (req, res) => {
  console.log('Task endpoint called at:', new Date().toISOString());
  res.json({ message: 'Task endpoint', timestamp: new Date().toISOString() });
});

export default router;