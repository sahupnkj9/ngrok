#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🌐 Starting Smart Attendance System with Ngrok...\n');

// Start backend first
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait for backend to start
setTimeout(() => {
  console.log('\n🌐 Starting Ngrok tunnel for backend...');
  
  // Start ngrok for backend (port 3000)
  const ngrok = spawn('ngrok', ['http', '7000'], {
    stdio: 'inherit',
    shell: true
  });

  ngrok.on('error', (error) => {
    console.error('❌ Failed to start ngrok:', error);
    console.log('\n🔧 To fix ngrok issues:');
    console.log('1. Install ngrok: npm install -g ngrok');
    console.log('2. Sign up at: https://ngrok.com/');
    console.log('3. Get auth token and run: ngrok config add-authtoken YOUR_TOKEN');
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill('SIGINT');
    ngrok.kill('SIGINT');
    process.exit(0);
  });

}, 3000);

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
});

console.log('\n📋 Instructions:');
console.log('1. Wait for ngrok to start and show the public URL');
console.log('2. Copy the https URL (e.g., https://abc123.ngrok.io)');
console.log('3. Update services/api.ts with the ngrok URL');
console.log('4. Share the ngrok URL with your teacher');
console.log('5. Your teacher can access the API at: https://YOUR_NGROK_URL/api-docs');