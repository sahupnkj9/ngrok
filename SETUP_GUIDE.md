# 🚀 Smart Attendance System - Complete Setup Guide

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** - [Download here](https://git-scm.com/)

### VS Code Extensions (Recommended)
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- MySQL (by Jun Han)
- Thunder Client (for API testing)

## 🗄️ Database Setup

### Step 1: Install MySQL
1. Download and install MySQL from the official website
2. During installation, remember your root password
3. Start MySQL service

### Step 2: Create Database
1. Open MySQL Workbench or command line
2. Connect to MySQL server with root credentials
3. Run the database setup:

```sql
-- Copy the entire content from backend/database.sql and run it
-- This will create the complete database schema with sample data
```

### Step 3: Verify Database
```sql
-- Check if database was created successfully
SHOW DATABASES;
USE attendance_system;
SHOW TABLES;

-- Verify sample data
SELECT * FROM teachers;
SELECT * FROM students;
SELECT * FROM subjects;
```

## 📧 Gmail Setup for OTP

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. In Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Select "Mail" and generate password
4. Copy the 16-character password (this is your EMAIL_PASSWORD)

### Step 3: Configure Environment
1. Copy `backend/.env.example` to `backend/.env`
2. Update with your credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=attendance_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# Security Configuration
OTP_EXPIRY_MINUTES=10
MAX_DISTANCE_METERS=20

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🖥️ VS Code Setup

### Step 1: Clone/Download Project
```bash
# If you have the project files
cd your-project-directory

# Or create new directory and copy files
mkdir smart-attendance-system
cd smart-attendance-system
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify environment file
cp .env.example .env
# Edit .env file with your configurations

# Test database connection
npm run dev
```

### Step 3: Frontend Setup
```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Start Expo development server
npm run dev
```

## 🔧 Running the Application

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
**Expected Output:**
```
🚀 Smart Attendance System API running on port 3000
📧 Email service configured: Yes
🔐 JWT Secret configured: Yes
```

### Terminal 2: Frontend App
```bash
npm run dev
```
**Expected Output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## 🧪 Testing the System

### Test Student Registration
1. Open the app and select "Student"
2. Fill registration form with test data:
   - **Full Name**: John Doe
   - **Email**: your-test-email@gmail.com
   - **Enrollment**: CS2024001
   - **Branch**: Computer Science
   - **Year**: 3

3. Click "SIGN UP" - you should receive OTP email
4. Enter OTP to complete registration

### Test Teacher Login
1. Select "Teacher" from role selection
2. Use pre-configured teacher email: `john.smith@university.edu`
3. Click "SEND OTP" - you should receive OTP email
4. Enter OTP to login

### Sample Teacher Accounts (Pre-configured)
- `john.smith@university.edu` - Computer Science
- `sarah.johnson@university.edu` - Mathematics  
- `michael.brown@university.edu` - Physics
- `emily.davis@university.edu` - Computer Science
- `robert.wilson@university.edu` - Electronics

## 🔍 Troubleshooting

### Common Issues

#### 1. "Sending OTP..." Stuck
**Cause**: Backend server not running or connection failed
**Solution**:
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# If not working, restart backend
cd backend
npm run dev
```

#### 2. Email Not Sending
**Cause**: Gmail configuration issue
**Solution**:
- Verify 2FA is enabled on Gmail
- Check App Password is correct (16 characters)
- Ensure EMAIL_USER and EMAIL_PASSWORD are set in .env

#### 3. Database Connection Error
**Cause**: MySQL not running or wrong credentials
**Solution**:
```bash
# Check MySQL status
mysql -u root -p

# Verify database exists
SHOW DATABASES;
```

#### 4. Network Error in App
**Cause**: API URL mismatch
**Solution**:
- Ensure backend runs on `http://localhost:3000`
- Check your computer's IP address for mobile testing
- Update API_BASE_URL if needed

### Debug Mode
Enable detailed logging by checking browser/Metro console:
```javascript
// Check console for detailed API logs
console.log('API Request:', endpoint);
console.log('Response:', data);
```

## 📱 Mobile Testing

### For Physical Device
1. Ensure your phone and computer are on same WiFi
2. Note your computer's IP address
3. Update API_BASE_URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
```

### For Simulator/Emulator
- iOS Simulator: Use `http://localhost:3000/api`
- Android Emulator: Use `http://10.0.2.2:3000/api`

## 🔐 Security Notes

### Production Deployment
1. **Environment Variables**: Never commit .env files
2. **HTTPS**: Use SSL certificates in production
3. **Database Security**: Create dedicated database user
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Server-side validation for all inputs

### Email Security
- Use dedicated email account for OTP sending
- Rotate App Passwords regularly
- Monitor email sending logs

## 📊 Database Management

### Useful Queries
```sql
-- Check recent registrations
SELECT * FROM temp_registrations ORDER BY created_at DESC LIMIT 10;

-- Check active OTPs
SELECT * FROM login_otps WHERE otp_expiry > NOW();

-- View all students
SELECT * FROM students ORDER BY created_at DESC;

-- Check teacher subjects
SELECT t.full_name, s.subject_name 
FROM teachers t 
JOIN teacher_subjects ts ON t.id = ts.teacher_id 
JOIN subjects s ON ts.subject_id = s.id;
```

### Maintenance
```sql
-- Clean expired data manually
CALL CleanExpiredOTPs();
CALL CleanExpiredQRSessions();

-- Check system stats
SELECT 
  (SELECT COUNT(*) FROM students) as total_students,
  (SELECT COUNT(*) FROM teachers) as total_teachers,
  (SELECT COUNT(*) FROM subjects) as total_subjects;
```

## 🎯 Next Steps

Once the basic authentication is working:
1. Test QR code generation (teachers)
2. Test QR code scanning (students)
3. Verify geolocation restrictions
4. Test attendance reporting
5. Configure production deployment

## 📞 Support

If you encounter any issues:
1. Check the console logs in VS Code terminal
2. Verify all environment variables are set
3. Ensure MySQL service is running
4. Test API endpoints using Thunder Client or Postman

The system is designed to be robust and production-ready with comprehensive error handling and security features!