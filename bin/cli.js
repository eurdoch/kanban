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
const command = args[0] || 'servers'; // Default to 'servers' if no command is provided

// Map of available commands and their corresponding script in package.json
const commands = {
  'servers': 'servers',
  'start': 'start:servers',
  'stop': 'stop:servers',
  'logs': 'logs',
  'restart': 'restart:servers',
  'status': 'servers:status',
  'delete': 'delete:servers',
  'help': 'help'
};

// Function to run a yarn script
function runScript(script) {
  console.log(`Running command: ${script}`);
  
  // Get the package.json content to extract the actual command
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  let cmd;
  if (script === 'help') {
    displayHelp();
    return;
  } else {
    cmd = packageJson.scripts[script];
    if (!cmd) {
      console.error(`Error: Script "${script}" not found in package.json`);
      displayHelp();
      process.exit(1);
    }
  }
  
  // Run the command
  const parts = cmd.split(' ');
  const proc = spawn(parts[0], parts.slice(1), {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('close', code => {
    if (code !== 0) {
      console.error(`Command exited with code ${code}`);
      process.exit(code);
    }
  });
  
  proc.on('error', (error) => {
    console.error(`Error executing command: ${error.message}`);
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
  servers    Start both API and manager servers and display logs
  start      Start servers without showing logs
  stop       Stop all running servers
  logs       View logs from all servers
  restart    Restart all servers
  status     Check server status
  delete     Remove servers from PM2
  help       Display this help message

Examples:
  kanban-cli servers
  kanban-cli logs
  `);
}

// Execute the requested command
if (commands[command]) {
  runScript(commands[command]);
} else {
  console.error(`Unknown command: ${command}`);
  displayHelp();
  process.exit(1);
}