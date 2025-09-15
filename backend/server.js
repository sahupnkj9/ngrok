const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const moment = require('moment');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Attendance System API',
      version: '1.0.0',
      description: 'A comprehensive QR-based attendance system with OTP authentication, geolocation verification, and device binding security.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database connection pool
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_attendance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper function to send OTP email
const sendOTPEmail = async (email, otp, userType) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Smart Attendance System - OTP Verification`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Attendance System</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p style="color: #666; font-size: 16px;">Hello ${userType},</p>
          <p style="color: #666; font-size: 16px;">Your OTP for login verification is:</p>
          <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4f46e5; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes only.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #e9ecef; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">© 2025 Smart Attendance System. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent successfully to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
};

// Helper function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Connected',
    email: process.env.EMAIL_USER ? 'Configured' : 'Not Configured'
  });
});

/**
 * @swagger
 * /api/student/register:
 *   post:
 *     summary: Student registration - Send OTP
 *     tags: [Student Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - enrollmentNumber
 *               - branch
 *               - year
 *               - deviceId
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               enrollmentNumber:
 *                 type: string
 *               branch:
 *                 type: string
 *               year:
 *                 type: string
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
app.post('/api/student/register', async (req, res) => {
  try {
    const { fullName, email, enrollmentNumber, branch, year, deviceId } = req.body;
    
    console.log('📝 Student registration request received');
    console.log('📋 Data:', { fullName, email, enrollmentNumber, branch, year, deviceId });
    
    // Validate required fields
    if (!fullName || !email || !enrollmentNumber || !branch || !year || !deviceId) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    try {
      // Check if student already exists
      console.log('🔍 Checking if student already exists...');
      const [existing] = await connection.execute(
        'SELECT id FROM students WHERE email = ? OR enrollment_number = ?',
        [email, enrollmentNumber]
      );
      
      if (existing.length > 0) {
        console.log('❌ Student already exists');
        return res.status(400).json({ error: 'Student with this email or enrollment number already exists' });
      }

      // Check if device is already registered
      console.log('🔍 Checking device registration...');
      const [deviceCheck] = await connection.execute(
        'SELECT id FROM students WHERE device_id = ?',
        [deviceId]
      );
      
      if (deviceCheck.length > 0) {
        console.log('❌ Device already registered');
        return res.status(400).json({ error: 'This device is already registered with another account' });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      console.log(`🔐 Generated OTP for ${email}: ${otp}`);

      // Store temporary registration data
      console.log('💾 Storing temporary registration data...');
      await connection.execute(
        `INSERT INTO temp_registrations (full_name, email, enrollment_number, branch, year, device_id, otp, otp_expiry, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         full_name = VALUES(full_name), enrollment_number = VALUES(enrollment_number), 
         branch = VALUES(branch), year = VALUES(year), device_id = VALUES(device_id), 
         otp = VALUES(otp), otp_expiry = VALUES(otp_expiry), created_at = NOW()`,
        [fullName, email, enrollmentNumber, branch, year, deviceId, otp, otpExpiry]
      );

      // Send OTP email
      console.log(`📧 Sending OTP to: ${email}`);
      const emailSent = await sendOTPEmail(email, otp, 'Student');
      
      if (!emailSent) {
        console.error('❌ Failed to send OTP email');
        return res.status(500).json({ error: 'Failed to send OTP email. Please check email configuration.' });
      }

      console.log('✅ OTP sent successfully');
      res.status(200).json({
        message: 'OTP sent successfully to your email',
        email: email
      });
    } finally {
      connection.release();
      console.log('🔓 Database connection released');
    }
  } catch (error) {
    console.error('❌ Registration error details:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/student/verify-registration:
 *   post:
 *     summary: Verify student registration OTP
 *     tags: [Student Authentication]
 */
app.post('/api/student/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('🔐 Verifying student registration OTP:', { email, otp });
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Get temporary registration data
      const [tempData] = await connection.execute(
        'SELECT * FROM temp_registrations WHERE email = ? AND otp = ? AND otp_expiry > NOW()',
        [email, otp]
      );
      
      if (tempData.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      const regData = tempData[0];

      // Create permanent student record
      const [result] = await connection.execute(
        `INSERT INTO students (full_name, email, enrollment_number, branch, year, device_id, is_verified, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())`,
        [regData.full_name, regData.email, regData.enrollment_number, regData.branch, regData.year, regData.device_id]
      );

      // Delete temporary registration data
      await connection.execute(
        'DELETE FROM temp_registrations WHERE email = ?',
        [email]
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: result.insertId, 
          email: regData.email, 
          role: 'student',
          deviceId: regData.device_id
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ Student registration completed successfully');
      res.status(201).json({
        message: 'Registration completed successfully',
        token,
        student: {
          id: result.insertId,
          fullName: regData.full_name,
          email: regData.email,
          enrollmentNumber: regData.enrollment_number,
          branch: regData.branch,
          year: regData.year
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/student/login:
 *   post:
 *     summary: Student login - Send OTP
 *     tags: [Student Authentication]
 */
app.post('/api/student/login', async (req, res) => {
  try {
    const { email, deviceId } = req.body;
    
    console.log('👨‍🎓 Student login request:', { email, deviceId });
    
    if (!email || !deviceId) {
      return res.status(400).json({ error: 'Email and device ID are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Check if student exists and device matches
      const [students] = await connection.execute(
        'SELECT * FROM students WHERE email = ? AND device_id = ? AND is_verified = TRUE AND is_active = TRUE',
        [email, deviceId]
      );
      
      if (students.length === 0) {
        return res.status(404).json({ error: 'Student not found or device mismatch. Please register first or contact admin for device change.' });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      console.log(`🔐 Generated OTP for student ${email}: ${otp}`);

      // Store OTP in database
      await connection.execute(
        `INSERT INTO login_otps (email, otp, otp_expiry, device_id, user_type, created_at) 
         VALUES (?, ?, ?, ?, 'student', NOW())
         ON DUPLICATE KEY UPDATE 
         otp = VALUES(otp), otp_expiry = VALUES(otp_expiry), device_id = VALUES(device_id), created_at = NOW()`,
        [email, otp, otpExpiry, deviceId]
      );

      // Send OTP email
      console.log(`📧 Sending OTP to student: ${email}`);
      const emailSent = await sendOTPEmail(email, otp, 'Student');
      
      if (!emailSent) {
        console.error('❌ Failed to send OTP email to student');
        return res.status(500).json({ error: 'Failed to send OTP email. Please check email configuration.' });
      }

      console.log('✅ Student OTP sent successfully');
      res.status(200).json({
        message: 'OTP sent successfully to your email',
        email: email
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Student login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/student/verify-login:
 *   post:
 *     summary: Verify student login OTP
 *     tags: [Student Authentication]
 */
app.post('/api/student/verify-login', async (req, res) => {
  try {
    const { email, otp, deviceId } = req.body;
    
    console.log('🔐 Verifying student login OTP:', { email, otp, deviceId });
    
    if (!email || !otp || !deviceId) {
      return res.status(400).json({ error: 'Email, OTP, and device ID are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Verify OTP
      const [otpData] = await connection.execute(
        'SELECT * FROM login_otps WHERE email = ? AND otp = ? AND otp_expiry > NOW() AND user_type = "student" AND device_id = ?',
        [email, otp, deviceId]
      );
      
      if (otpData.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP, or device mismatch' });
      }

      // Get student data
      const [students] = await connection.execute(
        'SELECT * FROM students WHERE email = ? AND device_id = ?',
        [email, deviceId]
      );
      
      if (students.length === 0) {
        return res.status(400).json({ error: 'Student not found or device mismatch' });
      }

      const student = students[0];

      // Update last login
      await connection.execute(
        'UPDATE students SET last_login = NOW() WHERE id = ?',
        [student.id]
      );

      // Delete used OTP
      await connection.execute(
        'DELETE FROM login_otps WHERE email = ? AND user_type = "student"',
        [email]
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: student.id, 
          email: student.email, 
          role: 'student',
          deviceId: student.device_id
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ Student login successful');
      res.json({
        message: 'Login successful',
        token,
        student: {
          id: student.id,
          fullName: student.full_name,
          email: student.email,
          enrollmentNumber: student.enrollment_number,
          branch: student.branch,
          year: student.year
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Student OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/teacher/login:
 *   post:
 *     summary: Teacher login - Send OTP
 *     tags: [Teacher Authentication]
 */
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('👨‍🏫 Teacher login request:', { email });
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Check if teacher exists
      const [teachers] = await connection.execute(
        'SELECT * FROM teachers WHERE email = ? AND is_active = TRUE',
        [email]
      );
      
      if (teachers.length === 0) {
        return res.status(404).json({ error: 'Teacher not found or account is inactive' });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      console.log(`🔐 Generated OTP for teacher ${email}: ${otp}`);

      // Store OTP in database
      await connection.execute(
        `INSERT INTO login_otps (email, otp, otp_expiry, user_type, created_at) 
         VALUES (?, ?, ?, 'teacher', NOW())
         ON DUPLICATE KEY UPDATE 
         otp = VALUES(otp), otp_expiry = VALUES(otp_expiry), created_at = NOW()`,
        [email, otp, otpExpiry]
      );

      // Send OTP email
      console.log(`📧 Sending OTP to teacher: ${email}`);
      const emailSent = await sendOTPEmail(email, otp, 'Teacher');
      
      if (!emailSent) {
        console.error('❌ Failed to send OTP email to teacher');
        return res.status(500).json({ error: 'Failed to send OTP email. Please check email configuration.' });
      }

      console.log('✅ Teacher OTP sent successfully');
      res.status(200).json({
        message: 'OTP sent successfully to your email',
        email: email
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Teacher login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/teacher/verify-login:
 *   post:
 *     summary: Verify teacher login OTP
 *     tags: [Teacher Authentication]
 */
app.post('/api/teacher/verify-login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('🔐 Verifying teacher login OTP:', { email, otp });
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Verify OTP
      const [otpData] = await connection.execute(
        'SELECT * FROM login_otps WHERE email = ? AND otp = ? AND otp_expiry > NOW() AND user_type = "teacher"',
        [email, otp]
      );
      
      if (otpData.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Get teacher data
      const [teachers] = await connection.execute(
        'SELECT * FROM teachers WHERE email = ?',
        [email]
      );
      
      const teacher = teachers[0];

      // Update last login
      await connection.execute(
        'UPDATE teachers SET last_login = NOW() WHERE id = ?',
        [teacher.id]
      );

      // Delete used OTP
      await connection.execute(
        'DELETE FROM login_otps WHERE email = ? AND user_type = "teacher"',
        [email]
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: teacher.id, 
          email: teacher.email, 
          role: 'teacher'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ Teacher login successful');
      res.json({
        message: 'Login successful',
        token,
        teacher: {
          id: teacher.id,
          fullName: teacher.full_name,
          email: teacher.email,
          department: teacher.department,
          employeeId: teacher.employee_id
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Teacher OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/teacher/subjects:
 *   get:
 *     summary: Get teacher's assigned subjects
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 */
app.get('/api/teacher/subjects', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const connection = await pool.getConnection();
    
    try {
      const [subjects] = await connection.execute(`
        SELECT 
          s.id,
          s.subject_name,
          s.subject_code,
          s.department,
          s.semester,
          s.credits
        FROM subjects s
        JOIN teacher_subjects ts ON s.id = ts.subject_id
        WHERE ts.teacher_id = ?
        ORDER BY s.subject_name
      `, [teacherId]);

      res.json({ subjects });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/teacher/active-sessions:
 *   get:
 *     summary: Get teacher's active QR sessions
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 */
app.get('/api/teacher/active-sessions', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const connection = await pool.getConnection();
    
    try {
      const [sessions] = await connection.execute(`
        SELECT 
          qs.id,
          qs.session_id,
          s.subject_name,
          s.subject_code,
          qs.expires_at,
          qs.created_at,
          COUNT(a.id) as student_count
        FROM qr_sessions qs
        JOIN subjects s ON qs.subject_id = s.id
        LEFT JOIN attendance a ON qs.id = a.qr_session_id
        WHERE qs.teacher_id = ? AND qs.is_active = TRUE AND qs.expires_at > NOW()
        GROUP BY qs.id, s.subject_name, s.subject_code, qs.expires_at, qs.created_at
        ORDER BY qs.created_at DESC
      `, [teacherId]);

      res.json({ sessions });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Active sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/teacher/generate-qr:
 *   post:
 *     summary: Generate QR code for attendance
 *     tags: [QR Code & Attendance]
 *     security:
 *       - bearerAuth: []
 */
app.post('/api/teacher/generate-qr', authenticateToken, async (req, res) => {
  try {
    const { subjectId, latitude, longitude } = req.body;
    const teacherId = req.user.userId;
    
    console.log('📱 QR generation request:', { teacherId, subjectId, latitude, longitude });
    
    if (!subjectId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Subject ID and location are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Verify teacher has access to this subject
      const [subjectAccess] = await connection.execute(
        'SELECT s.* FROM subjects s JOIN teacher_subjects ts ON s.id = ts.subject_id WHERE ts.teacher_id = ? AND s.id = ?',
        [teacherId, subjectId]
      );
      
      if (subjectAccess.length === 0) {
        return res.status(403).json({ error: 'You are not authorized to take attendance for this subject' });
      }

      // Deactivate any existing active sessions for this teacher and subject
      await connection.execute(
        'UPDATE qr_sessions SET is_active = FALSE WHERE teacher_id = ? AND subject_id = ? AND is_active = TRUE',
        [teacherId, subjectId]
      );

      // Create new QR session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      const qrData = {
        sessionId,
        teacherId,
        subjectId,
        latitude,
        longitude,
        expiresAt
      };

      const [result] = await connection.execute(
        'INSERT INTO qr_sessions (session_id, teacher_id, subject_id, latitude, longitude, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [sessionId, teacherId, subjectId, latitude, longitude, expiresAt]
      );

      // Generate QR code
      const qrCodeData = JSON.stringify(qrData);
      const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('✅ QR code generated successfully');
      res.json({
        message: 'QR code generated successfully',
        qrCode: qrCodeImage,
        sessionId: sessionId,
        expiresAt: expiresAt,
        subject: subjectAccess[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ QR generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/teacher/attendance-report/{subjectId}:
 *   get:
 *     summary: Get attendance report for a subject
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
app.get('/api/teacher/attendance-report/:subjectId', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacherId = req.user.userId;
    
    console.log('📊 Fetching attendance report for subject:', subjectId);
    
    const connection = await pool.getConnection();
    
    try {
      // Verify teacher has access to this subject
      const [subjectAccess] = await connection.execute(
        'SELECT s.* FROM subjects s JOIN teacher_subjects ts ON s.id = ts.subject_id WHERE ts.teacher_id = ? AND s.id = ?',
        [teacherId, subjectId]
      );
      
      if (subjectAccess.length === 0) {
        return res.status(403).json({ error: 'You are not authorized to view this subject' });
      }

      // Get total QR sessions (classes) for this subject by this teacher
      const [totalClassesResult] = await connection.execute(`
        SELECT COUNT(*) as total_classes
        FROM qr_sessions 
        WHERE teacher_id = ? AND subject_id = ?
      `, [teacherId, subjectId]);
      
      const totalClasses = totalClassesResult[0].total_classes;
      console.log(`📚 Total classes (QR sessions) for subject ${subjectId}: ${totalClasses}`);

      // Get attendance records for this subject
      const [attendanceRecords] = await connection.execute(`
        SELECT 
          a.id,
          s.full_name,
          s.enrollment_number,
          s.email,
          a.marked_at,
          a.distance_from_teacher,
          sub.subject_name,
          sub.subject_code
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN subjects sub ON a.subject_id = sub.id
        WHERE a.subject_id = ? AND a.teacher_id = ? AND a.is_valid = TRUE
        ORDER BY a.marked_at DESC
      `, [subjectId, teacherId]);

      console.log(`📋 Found ${attendanceRecords.length} attendance records`);

      // Calculate statistics
      const totalAttendance = attendanceRecords.length;
      const uniqueStudents = [...new Set(attendanceRecords.map(record => record.enrollment_number))];
      const totalStudents = uniqueStudents.length;
      
      // Calculate average attendance percentage
      const averageAttendance = totalStudents > 0 && totalClasses > 0 
        ? Math.round((totalAttendance / (totalStudents * totalClasses)) * 100) 
        : 0;

      const stats = {
        total_students: totalStudents,
        total_classes: totalClasses,
        total_attendance: totalAttendance,
        average_attendance: averageAttendance
      };

      console.log('📊 Calculated stats:', stats);

      res.json({
        success: true,
        data: {
          attendance: attendanceRecords,
          stats: stats,
          subject: subjectAccess[0]
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Attendance report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/student/attendance:
 *   get:
 *     summary: Get student's attendance records
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 */
app.get('/api/student/attendance', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.userId;
    console.log('📊 Fetching student attendance for student ID:', studentId);
    
    const connection = await pool.getConnection();
    
    try {
      const [attendance] = await connection.execute(`
        SELECT 
          a.id,
          s.subject_name,
          s.subject_code,
          t.full_name as teacher_name,
          a.marked_at,
          a.distance_from_teacher,
          DATE(a.marked_at) as attendance_date
        FROM attendance a
        JOIN subjects s ON a.subject_id = s.id
        JOIN teachers t ON a.teacher_id = t.id
        WHERE a.student_id = ? AND a.is_valid = TRUE
        ORDER BY a.marked_at DESC
      `, [studentId]);

      console.log('📋 Found attendance records:', attendance.length);
      console.log('📋 Attendance data:', attendance);
      
      res.json({ attendance });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Student attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/student/mark-attendance:
 *   post:
 *     summary: Mark student attendance
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 */
app.post('/api/student/mark-attendance', authenticateToken, async (req, res) => {
  try {
    const { sessionId, latitude, longitude } = req.body;
    const studentId = req.user.userId;
    
    console.log('📍 Attendance marking request:', { studentId, sessionId, latitude, longitude });
    
    if (!sessionId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Session ID and location are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Get QR session details
      const [sessions] = await connection.execute(
        'SELECT * FROM qr_sessions WHERE session_id = ? AND is_active = TRUE AND expires_at > NOW()',
        [sessionId]
      );
      
      if (sessions.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired QR session' });
      }

      const session = sessions[0];

      // Calculate distance from teacher
      const distance = calculateDistance(
        latitude, longitude,
        session.latitude, session.longitude
      );

      console.log(`📏 Distance from teacher: ${distance.toFixed(2)} meters`);

      // Check if student is within allowed distance (20 meters)
      const maxDistance = 20;
      if (distance > maxDistance) {
        return res.status(400).json({ 
          error: `You are too far from the teacher. Distance: ${distance.toFixed(1)}m (Max: ${maxDistance}m)` 
        });
      }

      // Check if attendance already marked for this session
      const [existing] = await connection.execute(
        'SELECT id FROM attendance WHERE student_id = ? AND qr_session_id = ?',
        [studentId, session.id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Attendance already marked for this session' });
      }

      // Mark attendance
      await connection.execute(
        'INSERT INTO attendance (student_id, teacher_id, subject_id, qr_session_id, student_latitude, student_longitude, distance_from_teacher) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [studentId, session.teacher_id, session.subject_id, session.id, latitude, longitude, distance]
      );

      console.log('✅ Attendance marked successfully');
      res.json({
        message: 'Attendance marked successfully',
        distance: distance.toFixed(2)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test email configuration on startup
async function testEmailConfiguration() {
  try {
    await transporter.verify();
    console.log('✅ Email service configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    return false;
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Smart Attendance System API running on port ${PORT}`);
  console.log(`📚 Swagger UI available at: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  
  // Test connections
  const dbConnected = await testDatabaseConnection();
  const emailConfigured = await testEmailConfiguration();
  
  console.log(`📧 Email service configured: ${emailConfigured ? 'Yes' : 'No'}`);
  console.log(`🔐 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  
  if (!dbConnected) {
    console.log('\n🔧 Database Setup Required:');
    console.log('1. Start MySQL service');
    console.log('2. Create database: CREATE DATABASE smart_attendance_system;');
    console.log('3. Run database script: mysql -u root -p smart_attendance_system < database.sql');
  }
  
  if (!emailConfigured) {
    console.log('\n📧 Email Setup Required:');
    console.log('1. Enable 2FA on Gmail');
    console.log('2. Generate App Password');
    console.log('3. Update EMAIL_USER and EMAIL_PASSWORD in .env');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});