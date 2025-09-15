# 🚀 Smart Attendance System - Complete Setup & Testing Guide

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** (optional) - [Download here](https://git-scm.com/)

### VS Code Extensions (Recommended)
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- MySQL (by Jun Han)
- Thunder Client (for API testing)
- Expo Tools

## 🗄️ Step 1: Database Setup

### Install and Start MySQL
```bash
# Windows: Download installer from MySQL website
# macOS: brew install mysql && brew services start mysql
# Ubuntu: sudo apt install mysql-server && sudo systemctl start mysql
```

### Create Database
```bash
# Open MySQL command line
mysql -u root -p

# Create database and run schema
CREATE DATABASE smart_attendance_system;
exit;

# Run the complete database script
mysql -u root -p smart_attendance_system < backend/database.sql
```

### Verify Database Setup
```sql
mysql -u root -p
USE smart_attendance_system;
SHOW TABLES;

-- Should show these tables:
-- students, teachers, subjects, qr_sessions, attendance
-- temp_registrations, login_otps, device_change_requests
-- admin_users, attendance_summary, system_logs

-- Check sample data
SELECT COUNT(*) FROM teachers; -- Should be 5
SELECT COUNT(*) FROM subjects; -- Should be 10
SELECT * FROM teachers LIMIT 3;
```

## 📧 Step 2: Gmail Configuration

### Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Factor Authentication

### Generate App Password
1. In **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Select **Mail** and generate password
4. Copy the **16-character password** (this is your EMAIL_PASSWORD)

### Example App Password
```
Generated password: abcd efgh ijkl mnop
Use in .env: EMAIL_PASSWORD=abcdefghijklmnop
```

## 🖥️ Step 3: Backend Setup

### Navigate to Backend Directory
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
```

### Update .env File
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=smart_attendance_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
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

### Start Backend Server
```bash
npm run dev
```

### Expected Output
```
🚀 Smart Attendance System API running on port 3000
📧 Email service configured: Yes
🔐 JWT Secret configured: Yes
✅ Database connected successfully
```

## 📱 Step 4: Frontend Setup

### Open New Terminal (keep backend running)
```bash
# Navigate to project root (not backend folder)
cd ..
```

### Install Dependencies
```bash
npm install
```

### Start Frontend
```bash
npm run dev
```

### Expected Output
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Press w │ open web
```

## 🔗 Step 5: Integration & Testing

### Test Backend API
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","timestamp":"2025-01-XX","version":"1.0.0"}
```

### Test Frontend Connection
1. Open the app (press 'w' for web or scan QR for mobile)
2. Select "Student" role
3. Try to register - if it shows "Sending OTP..." and gets stuck, check:
   - Backend server is running on port 3000
   - Database connection is working
   - Gmail credentials are correct

## 🧪 Step 6: Complete Testing Flow

### Test Student Registration
1. **Select Student Role**
2. **Fill Registration Form**:
   - Full Name: John Doe
   - Email: your-test-email@gmail.com
   - Enrollment: CS2024001
   - Branch: Computer Science
   - Year: 3
3. **Click "SIGN UP"** - Should receive OTP email
4. **Enter OTP** - Should complete registration

### Test Teacher Login
1. **Select Teacher Role**
2. **Enter Email**: `john.smith@university.edu`
3. **Click "SEND OTP"** - Should receive OTP email
4. **Enter OTP** - Should login successfully

### Test QR Code Generation (Teacher)
1. **Login as Teacher**
2. **Go to Generate QR**
3. **Select Subject**
4. **Click Generate** - Should create QR code with location

### Test Attendance Marking (Student)
1. **Login as Student**
2. **Go to Scan QR**
3. **Scan Teacher's QR Code**
4. **Should mark attendance** (if within 20 meters)

## 🔍 Troubleshooting

### Backend Issues

#### "Database connection failed"
```bash
# Check MySQL service
# Windows: Services → MySQL → Start
# macOS: brew services restart mysql
# Ubuntu: sudo systemctl restart mysql

# Test connection
mysql -u root -p
```

#### "Email sending failed"
```bash
# Check Gmail configuration
# Verify 2FA is enabled
# Verify App Password is correct (16 characters)
# Test email credentials
```

#### "Port 3000 already in use"
```bash
# Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -ti:3000 | xargs kill -9
```

### Frontend Issues

#### "Network Error"
- Ensure backend is running on `http://localhost:3000`
- Check API_BASE_URL in `services/api.ts`
- For mobile testing, use your computer's IP address

#### "Metro bundler issues"
```bash
# Clear cache and restart
npx expo start --clear
```

## 📱 Mobile Testing

### For Physical Device
1. **Install Expo Go** app
2. **Ensure same WiFi** network
3. **Update API URL** in `services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
   ```

### For Simulator
- **iOS Simulator**: Use `http://localhost:3000/api`
- **Android Emulator**: Use `http://10.0.2.2:3000/api`

## 🧪 Pre-configured Test Data

### Teachers (for OTP login)
- `john.smith@university.edu` - Computer Science
- `sarah.johnson@university.edu` - Mathematics
- `michael.brown@university.edu` - Physics
- `emily.davis@university.edu` - Computer Science
- `robert.wilson@university.edu` - Electronics

### Subjects Available
- Data Structures and Algorithms (CS201)
- Database Management Systems (CS301)
- Object Oriented Programming (CS202)
- Computer Networks (CS401)
- Software Engineering (CS302)

### Admin Account
- Username: `admin`
- Password: `admin123`

## 🔧 Development Workflow

### Daily Development
```bash
# Terminal 1: Backend (always keep running)
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Database operations
mysql -u root -p smart_attendance_system
```

### Testing API Endpoints
Use Thunder Client or Postman:

```bash
# Health Check
GET http://localhost:3000/api/health

# Student Registration
POST http://localhost:3000/api/student/register
{
  "fullName": "Test Student",
  "email": "test@example.com",
  "enrollmentNumber": "CS2024999",
  "branch": "Computer Science",
  "year": "3",
  "deviceId": "test_device_123"
}

# Teacher Login
POST http://localhost:3000/api/teacher/login
{
  "email": "john.smith@university.edu"
}
```

## 🚨 Common Issues & Solutions

### 1. "Sending OTP..." Stuck
**Cause**: Backend not running or Gmail not configured
**Solution**: 
- Check backend terminal for errors
- Verify Gmail App Password setup
- Test API health endpoint

### 2. "Database connection error"
**Cause**: MySQL not running or wrong credentials
**Solution**:
- Start MySQL service
- Check .env database credentials
- Verify database exists

### 3. "Network error"
**Cause**: API URL mismatch
**Solution**:
- Ensure backend runs on port 3000
- Check your computer's IP for mobile testing
- Update API_BASE_URL if needed

### 4. "Invalid or expired OTP"
**Cause**: OTP expired (10 minutes) or wrong code
**Solution**:
- Request new OTP
- Check email spam folder
- Verify email address is correct

## 📊 Success Indicators

### Backend Running Successfully
```
🚀 Smart Attendance System API running on port 3000
📧 Email service configured: Yes
🔐 JWT Secret configured: Yes
✅ Database connected successfully
```

### Frontend Running Successfully
```
› Metro waiting on exp://192.168.x.x:8081
› Press w │ open web
› Press r │ reload app
```

### OTP Email Working
- Professional email template received
- 6-digit OTP code visible
- Email arrives within 30 seconds

## 🎯 Next Steps After Setup

1. **Test Complete Flow**: Registration → OTP → Login → Dashboard
2. **Test QR Generation**: Teacher generates QR with location
3. **Test Attendance**: Student scans QR within 20 meters
4. **Test Reports**: View attendance analytics
5. **Test Security**: Try device change requests

The system is now production-ready with enterprise-level security and comprehensive features!