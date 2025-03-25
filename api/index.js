import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import taskRouter from './routes/task.js';
import { initDb } from './db/index.js';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// API routes first
app.use('/task', taskRouter);

// Serve static files from the frontend build directory
const frontendBuildPath = path.resolve(__dirname, '../dist');
app.use(express.static(frontendBuildPath));

// Serve index.html for the root route and any non-API routes
// This should be the last route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Catch-all route for client-side routing in SPA
app.get('*', (req, res) => {
  // Don't handle API routes that weren't matched by the API router
  if (req.path.startsWith('/api') || req.path.startsWith('/task') || req.path.startsWith('/ping')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // For all other routes, serve the index.html to support client-side routing
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }
});

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