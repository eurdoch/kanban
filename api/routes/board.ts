import { Router } from 'express';

const router = Router();

// GET /board
router.get('/', (req, res) => {
  console.log('Board endpoint called at:', new Date().toISOString());
  res.json({ message: 'Board endpoint', timestamp: new Date().toISOString() });
});

export default router;