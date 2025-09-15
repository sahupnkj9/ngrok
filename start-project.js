#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Smart Attendance System...\n');

// Start backend
console.log('📡 Starting Backend Server...');
const backend = spawn('node', ['backend/start-backend.js'], {
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n📱 Starting Frontend App...');
  
  // Start frontend
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('❌ Failed to start frontend:', error);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down both servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

}, 3000);

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
});