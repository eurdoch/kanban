import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRouter from './routes/task.js';
import { initDb } from './db/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Task routes
app.use('/task', taskRouter);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize the database
    await initDb();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
