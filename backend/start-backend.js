#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Smart Attendance System Backend...\n');

// Check if we're in the backend directory
const currentDir = process.cwd();
const backendDir = path.join(currentDir, 'backend');

// Change to backend directory if not already there
if (!currentDir.endsWith('backend')) {
  try {
    process.chdir(backendDir);
    console.log(`📁 Changed directory to: ${backendDir}`);
  } catch (error) {
    console.error('❌ Backend directory not found. Please run this from the project root.');
    process.exit(1);
  }
}

// Start the server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
});

server.on('close', (code) => {
  console.log(`\n🛑 Backend server stopped with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  server.kill('SIGINT');
});