const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🧪 Testing Backend Connections...\n');

// Test Database Connection
async function testDatabase() {
  console.log('📊 Testing Database Connection...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_attendance_system'
    });

    console.log('✅ Database connected successfully');
    
    // Test if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables in database`);
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Please run database.sql script first!');
    } else {
      console.log('📋 Tables:', tables.map(t => Object.values(t)[0]).join(', '));
    }
    
    // Test sample data
    const [teachers] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
    const [subjects] = await connection.execute('SELECT COUNT(*) as count FROM subjects');
    
    console.log(`👨‍🏫 Teachers: ${teachers[0].count}`);
    console.log(`📚 Subjects: ${subjects[0].count}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 To fix database issues:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check DB credentials in .env file');
    console.log('3. Run: mysql -u root -p < database.sql');
  }
}

// Test Email Configuration
async function testEmail() {
  console.log('\n📧 Testing Email Configuration...');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    await transporter.verify();
    console.log('✅ Email service configured successfully');
    console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
    console.log(`🔐 Email Password: ${process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET'}`);
    
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    console.log('\n📧 Email Configuration Details:');
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? 'Set' : 'NOT SET'}`);
    console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'Set (' + process.env.EMAIL_PASSWORD.length + ' chars)' : 'NOT SET'}`);
    console.log('\n🔧 To fix email issues:');
    console.log('1. Enable 2FA on Gmail');
    console.log('2. Generate App Password (16 characters)');
    console.log('3. Update EMAIL_USER and EMAIL_PASSWORD in .env');
    console.log('4. Use App Password, not regular Gmail password');
  }
}

// Test Environment Variables
function testEnvironment() {
  console.log('\n🔧 Testing Environment Variables...');
  
  const requiredVars = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASSWORD'
  ];
  
  const missing = [];
  const configured = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      configured.push(varName);
    } else {
      missing.push(varName);
    }
  });
  
  console.log(`✅ Configured: ${configured.join(', ')}`);
  if (missing.length > 0) {
    console.log(`❌ Missing: ${missing.join(', ')}`);
    console.log('\n🔧 Please update your .env file with missing variables');
  }
}

// Run all tests
async function runTests() {
  testEnvironment();
  await testDatabase();
  await testEmail();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Fix any issues shown above');
  console.log('2. Start backend: npm run dev');
  console.log('3. Test API: curl http://localhost:3000/api/health');
  console.log('4. Start frontend: npm run dev');
}

runTests().catch(console.error);