#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory where the script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'serve'; // Default to 'serve' if no command is provided

// PM2 process names that our app uses (defined in ecosystem.config.cjs)
const PM2_PROCESS_NAMES = ['api', 'manager'];

// Function to run the serve command
function serveCommand() {
  console.log('Starting Kanban API and Manager servers...');
  
  const configPath = path.join(rootDir, 'ecosystem.config.cjs');
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.error(`Error: PM2 configuration file not found at ${configPath}`);
    process.exit(1);
  }
  
  // First, delete any existing instances to avoid conflicts
  const cleanupProc = spawn('pm2', ['delete', 'all'], {
    cwd: rootDir,
    stdio: 'ignore',
    shell: true
  });
  
  cleanupProc.on('close', () => {
    // Start the servers using PM2
    const startProc = spawn('pm2', ['start', configPath], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    startProc.on('close', code => {
      if (code !== 0) {
        console.error(`Failed to start servers with exit code ${code}`);
        process.exit(code);
      }
      
      console.log('Servers started successfully. Showing logs...');
      
      // Show logs after starting
      const logsProc = spawn('pm2', ['logs'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true
      });
      
      logsProc.on('error', (error) => {
        console.error(`Error displaying logs: ${error.message}`);
      });
    });
    
    startProc.on('error', (error) => {
      console.error(`Error starting servers: ${error.message}`);
      process.exit(1);
    });
  });
  
  cleanupProc.on('error', (error) => {
    console.error(`Error cleaning up previous instances: ${error.message}`);
    // Continue anyway
    serveCommand();
  });
}

// Function to attach to running servers
function attachCommand() {
  console.log('Attaching to Kanban servers...');
  
  // Check if servers are running using PM2 list
  const checkProc = spawn('pm2', ['list'], {
    cwd: rootDir,
    stdio: ['pipe', 'pipe', 'inherit'], // We need to capture stdout to check if processes exist
    shell: true
  });
  
  let output = '';
  checkProc.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  checkProc.on('close', (code) => {
    // Check if our processes are running
    const processesRunning = PM2_PROCESS_NAMES.some(name => output.includes(name));
    
    if (!processesRunning) {
      console.error('Error: Kanban servers are not running. Please start them first with:');
      console.error('  kanban-cli serve');
      process.exit(1);
    }
    
    console.log('Servers are running. Attaching to logs...');
    
    // Attach to logs
    const logsProc = spawn('pm2', ['logs'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    
    logsProc.on('error', (error) => {
      console.error(`Error displaying logs: ${error.message}`);
      process.exit(1);
    });
  });
  
  checkProc.on('error', (error) => {
    console.error(`Error checking server status: ${error.message}`);
    process.exit(1);
  });
}

// Function to display help information
function displayHelp() {
  console.log(`
Kanban Board CLI

Usage:
  kanban-cli [command]

Available Commands:
  serve      Start both API and manager servers (default command)
  attach     Attach to running servers to view logs
  help       Display this help message

Examples:
  kanban-cli                  # Start servers
  kanban-cli serve            # Start servers
  kanban-cli attach           # View logs of running servers
  kanban-cli help             # Display help
  `);
}

// Execute the requested command
if (command === 'serve') {
  serveCommand();
} else if (command === 'attach') {
  attachCommand();
} else if (command === 'help') {
  displayHelp();
} else {
  console.error(`Unknown command: ${command}`);
  displayHelp();
  process.exit(1);
}