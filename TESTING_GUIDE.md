# 🧪 Smart Attendance System - Testing Guide

## 🚀 Quick Start Testing

### Option 1: Start Both Services Together
```bash
npm run start:both
```

### Option 2: Start Services Separately
```bash
# Terminal 1: Backend
npm run start:backend

# Terminal 2: Frontend (after backend is running)
npm run dev
```

## 📧 Email Testing Setup

### Gmail Configuration Checklist
- [ ] 2FA enabled on Gmail account
- [ ] App Password generated (16 characters)
- [ ] EMAIL_USER set in .env
- [ ] EMAIL_PASSWORD set in .env (use App Password, not regular password)

### Test Email Configuration
```bash
# Test if backend can send emails
curl -X POST http://localhost:3000/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@university.edu"}'
```

## 🧪 Complete Testing Scenarios

### Scenario 1: Student Registration Flow
1. **Open App** → Select "Student"
2. **Fill Form**:
   - Full Name: `Test Student`
   - Email: `your-email@gmail.com`
   - Enrollment: `CS2024001`
   - Branch: `Computer Science`
   - Year: `3`
3. **Click "SIGN UP"** → Should show "OTP sent to your email"
4. **Check Email** → Should receive professional OTP email
5. **Enter OTP** → Should complete registration and login

### Scenario 2: Teacher Login Flow
1. **Open App** → Select "Teacher"
2. **Enter Email**: `john.smith@university.edu`
3. **Click "SEND OTP"** → Should show "OTP sent to your email"
4. **Check Email** → Should receive OTP
5. **Enter OTP** → Should login to teacher dashboard

### Scenario 3: QR Code Generation
1. **Login as Teacher**
2. **Go to Dashboard** → Click "Generate QR"
3. **Select Subject** → Click "Generate QR Code"
4. **Should show QR code** with 10-minute countdown timer

### Scenario 4: Attendance Marking
1. **Login as Student**
2. **Go to Dashboard** → Click "Scan QR"
3. **Scan Teacher's QR Code**
4. **Should mark attendance** (if within 20 meters of teacher)

## 🔍 Debug & Troubleshooting

### Check Backend Status
```bash
# Test API health
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","timestamp":"2025-01-XX","version":"1.0.0"}
```

### Check Database Connection
```sql
mysql -u root -p
USE smart_attendance_system;

-- Check tables exist
SHOW TABLES;

-- Check sample data
SELECT * FROM teachers LIMIT 3;
SELECT * FROM subjects LIMIT 5;
```

### Check Email Configuration
```bash
# Look for these logs in backend terminal:
# ✅ Email service configured: Yes
# ✅ Database connected successfully

# If email fails, check:
# - Gmail 2FA enabled
# - App Password correct (16 chars)
# - EMAIL_USER and EMAIL_PASSWORD in .env
```

### Frontend Debug
```bash
# Check console logs in browser/Metro for:
# 🔗 API Base URL: http://localhost:3000/api
# Making request to: /api/student/register
# Response status: 200
```

## 📱 Mobile Testing

### Update API URL for Physical Device
1. **Find your computer's IP**:
   ```bash
   # Windows: ipconfig
   # macOS/Linux: ifconfig | grep inet
   ```

2. **Update API URL** in `services/api.ts`:
   ```typescript
   return 'http://YOUR_COMPUTER_IP:3000/api';  // e.g., 192.168.1.100
   ```

3. **Restart Expo**: `npm run dev`

### Test on Device
1. **Install Expo Go** app
2. **Scan QR code** from Metro terminal
3. **Test complete flow** on mobile device

## 🎯 Expected Results

### Successful Student Registration
- ✅ OTP email received within 30 seconds
- ✅ Professional email template with university branding
- ✅ 6-digit OTP code clearly visible
- ✅ Registration completes after OTP verification
- ✅ Student dashboard loads with profile info

### Successful Teacher Login
- ✅ OTP email sent to pre-registered teacher
- ✅ Teacher dashboard loads with subjects
- ✅ Can generate QR codes for subjects
- ✅ Can view attendance reports

### Successful QR Generation
- ✅ QR code displays with countdown timer
- ✅ Location captured automatically
- ✅ QR expires after 10 minutes
- ✅ Students can scan and mark attendance

## 🔧 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
EMAIL_USER=your-production-email
JWT_SECRET=super-secure-production-secret
```

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Secure database credentials
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Audit logging enabled

## 📞 Support

If you encounter issues:
1. **Check Backend Logs**: Look for error messages in terminal
2. **Check Database**: Verify MySQL is running and accessible
3. **Check Email**: Verify Gmail App Password setup
4. **Check Network**: Ensure API URL is correct for your environment

The system is designed to be robust and production-ready!