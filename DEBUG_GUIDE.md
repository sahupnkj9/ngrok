# 🔍 Smart Attendance System - Debug Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Sending OTP..." Stuck Forever

**Symptoms:**
- Click "SEND OTP" button
- Shows "SENDING OTP..." but never completes
- OTP input screen never appears

**Causes & Solutions:**

#### A. Backend Server Not Running
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# If no response, start backend:
cd backend
npm run dev

# Should show:
# 🚀 Smart Attendance System API running on port 3000
# 📧 Email service configured: Yes
# 🔐 JWT Secret configured: Yes
```

#### B. Database Connection Issues
```bash
# Test database connection
cd backend
node test-connection.js

# Should show:
# ✅ Database connected successfully
# 📋 Found 12+ tables in database
# 👨‍🏫 Teachers: 5
# 📚 Subjects: 10
```

#### C. Gmail Configuration Issues
```bash
# Check email configuration
cd backend
node test-connection.js

# Should show:
# ✅ Email service configured successfully
# 📧 Email User: your-email@gmail.com
```

**Gmail Setup Checklist:**
- [ ] 2FA enabled on Gmail account
- [ ] App Password generated (16 characters)
- [ ] EMAIL_USER set in .env
- [ ] EMAIL_PASSWORD set in .env (use App Password, not regular password)

### Issue 2: Database Connection Failed

**Error:** `Database connection failed`

**Solutions:**
```bash
# 1. Check if MySQL is running
# Windows: Services → MySQL → Start
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# 2. Test MySQL connection
mysql -u root -p

# 3. Check if database exists
USE smart_attendance_system;
SHOW TABLES;

# 4. If no tables, run database script
mysql -u root -p smart_attendance_system < backend/database.sql
```

### Issue 3: Email Not Sending

**Error:** `Email configuration failed`

**Solutions:**
1. **Enable 2FA on Gmail:**
   - Google Account → Security → 2-Step Verification → Enable

2. **Generate App Password:**
   - 2-Step Verification → App passwords → Mail → Generate
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update .env file:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # No spaces, 16 characters
   ```

4. **Test email configuration:**
   ```bash
   cd backend
   node test-connection.js
   ```

### Issue 4: Frontend Cannot Connect to Backend

**Error:** `Network error` or `Cannot connect to backend server`

**Solutions:**
1. **Check API URL in `services/api.ts`:**
   ```typescript
   // For local development
   return 'http://localhost:3000/api';
   
   // For mobile device testing
   return 'http://YOUR_COMPUTER_IP:3000/api';  // e.g., 192.168.1.100
   ```

2. **Test backend health:**
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

3. **Check Windows firewall:**
   - Allow Node.js through Windows Firewall
   - Allow port 3000 for local connections

## 🧪 Step-by-Step Testing

### Test 1: Backend Health Check
```bash
# Start backend
cd backend
npm run dev

# In another terminal, test API
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","timestamp":"2025-01-XX","version":"1.0.0"}
```

### Test 2: Database Connection
```bash
cd backend
node test-connection.js

# Expected output:
# ✅ Database connected successfully
# 📋 Found 12 tables in database
# 👨‍🏫 Teachers: 5
# 📚 Subjects: 10
# ✅ Email service configured successfully
```

### Test 3: OTP Email Test
```bash
# Test teacher OTP endpoint
curl -X POST http://localhost:3000/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@university.edu"}'

# Should return:
# {"message":"OTP sent successfully to your email","email":"john.smith@university.edu"}

# Check your email for OTP
```

### Test 4: Student Registration Test
```bash
# Test student registration endpoint
curl -X POST http://localhost:3000/api/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "email": "your-test-email@gmail.com",
    "enrollmentNumber": "CS2024999",
    "branch": "Computer Science",
    "year": "3",
    "deviceId": "test_device_123"
  }'

# Should return:
# {"message":"OTP sent successfully to your email","email":"your-test-email@gmail.com"}
```

## 🔧 Environment Setup Checklist

### Backend Environment (.env)
```env
# Database (Required)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_attendance_system

# JWT (Required)
JWT_SECRET=your-super-secret-jwt-key-here

# Email (Required for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# Server
PORT=3000
NODE_ENV=development
```

### Gmail App Password Setup
1. **Google Account Settings** → **Security**
2. **2-Step Verification** → **Enable**
3. **App passwords** → **Mail** → **Generate**
4. **Copy 16-character password** (e.g., `abcd efgh ijkl mnop`)
5. **Use in .env** as `EMAIL_PASSWORD=abcdefghijklmnop` (no spaces)

## 📱 Mobile Testing

### For Physical Device
1. **Find your computer's IP:**
   ```bash
   # Windows
   ipconfig | findstr IPv4
   
   # macOS/Linux
   ifconfig | grep inet
   ```

2. **Update API URL in `services/api.ts`:**
   ```typescript
   return 'http://192.168.1.100:3000/api';  // Use your actual IP
   ```

3. **Restart Expo:**
   ```bash
   npm run dev
   ```

## 🎯 Success Indicators

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

### OTP Working Successfully
- Professional email received within 30 seconds
- 6-digit OTP code clearly visible
- OTP input screen appears after clicking "SEND OTP"
- Registration/login completes after OTP verification

## 📞 Support

If issues persist:
1. **Check console logs** in both terminals for detailed error messages
2. **Run connection test:** `cd backend && node test-connection.js`
3. **Verify all environment variables** are set correctly
4. **Test API endpoints** using curl or Postman
5. **Check MySQL service** is running and accessible

The system is designed to be robust and production-ready with comprehensive error handling!