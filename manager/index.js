import axios from 'axios';
import { spawn } from 'child_process';

// Configuration
// TODO move API_URL to config file so that it can be set at startup
const API_URL = 'http://localhost:3001'; // Adjust this to your API's URL
const POLL_INTERVAL_MS = 5000; // 5 seconds

// Function to poll the tasks endpoint
async function pollTasks() {
  try {
    const response = await axios.get(`${API_URL}/task`);
    
    // Filter tasks with status 'TODO'
    const todoTasks = response.data.filter(task => task.status === 'TODO');
    
    if (todoTasks.length > 0) {
      console.log('TODO Tasks:');
      
      // Process each TODO task
      for (const task of todoTasks) {
        console.log(`- ID: ${task.id}, Title: ${task.title}, Created: ${new Date(task.createdAt).toLocaleString()}`);
        
        // Spawn a new process for each task
        processTask(task);
      }
    } else {
      console.log('No TODO tasks found');
    }
    
    return todoTasks;
  } catch (error) {
    console.error('Error polling tasks:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Start the polling interval
console.log(`Starting task polling every ${POLL_INTERVAL_MS}ms...`);
const intervalId = setInterval(pollTasks, POLL_INTERVAL_MS);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping task polling...');
  clearInterval(intervalId);
  process.exit(0);
});

// Function to process a task by spawning a new process and updating its status
async function processTask(task) {
  try {
    console.log(`Processing task ${task.id}: "${task.title}"`);
    
    // Update the task status to IN_PROGRESS
    const updateResponse = await axios.put(`${API_URL}/task/${task.id}`, {
      status: 'IN_PROGRESS'
    });
    
    console.log(`Task ${task.id} status updated to IN_PROGRESS`);
    
    // Spawn a new process to handle the task
    // This is a simple example - in a real app, you might run a more complex script
    //const childProcess = spawn('node', ['-e', `
    //  console.log("Worker process started for task ${task.id}");
    //  console.log("Task details:", ${JSON.stringify(JSON.stringify(task))});
    //  console.log("Worker process for task ${task.id} completed");
    //`]);
    const childProcess = spawn('claude', ['-p', `${task.title}: ${task.description}`]);
    
    // Log output from the child process
    childProcess.stdout.on('data', (data) => {
      console.log(`[Task ${task.id} Worker] ${data.toString().trim()}`);
    });
    
    childProcess.stderr.on('data', (data) => {
      console.error(`[Task ${task.id} Worker ERROR] ${data.toString().trim()}`);
    });
    
    // Handle process completion
    childProcess.on('close', (code) => {
      console.log(`Worker process for task ${task.id} exited with code ${code}`);
    });
    
    return updateResponse.data;
  } catch (error) {
    console.error(`Error processing task ${task.id}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Initial poll on startup
pollTasks();
