const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001'; // Adjust this to your API's URL
const POLL_INTERVAL_MS = 1000; // 1 second

// Function to poll the tasks endpoint
async function pollTasks() {
  try {
    const response = await axios.get(`${API_URL}/task`);
    console.log('Tasks from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error poling tasks:', error.message);
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

// Initial poll on startup
pollTasks();
