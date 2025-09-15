# 🔧 Quick Fix Guide - OTP Not Working

## 🚨 The Issue
The error `nodemailer.createTransporter is not a function` means the nodemailer import was incorrect.

## ✅ Fixed Issues
1. **Nodemailer Import**: Changed `createTransporter` to `createTransport`
2. **Dependencies**: Removed conflicting crypto package
3. **Error Handling**: Added better debugging

## 🚀 Quick Steps to Fix

### **1. Reinstall Backend Dependencies**
```bash
cd backend
npm install
```

### **2. Test Email Configuration**
```bash
cd backend
node test-connection.js
```

**Expected Output:**
```
✅ Database connected successfully
📋 Found 14 tables in database
👨‍🏫 Teachers: 5
📚 Subjects: 10
✅ Email service configured successfully
📧 Email User: your-email@gmail.com
```

### **3. Configure Gmail (If Email Still Fails)**

#### **Step A: Enable 2FA**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable

#### **Step B: Generate App Password**
1. Security → 2-Step Verification → App passwords
2. Select "Mail" → Generate
3. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)

#### **Step C: Update .env File**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16 characters, no spaces
```

### **4. Start Backend**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Smart Attendance System API running on port 3000
📚 Swagger UI available at: http://localhost:3000/api-docs
📧 Email service configured: Yes
🔐 JWT Secret configured: Yes
```

### **5. Test API with Swagger**
1. **Open Browser**: `http://localhost:3000/api-docs`
2. **Test Health**: Click `/api/health` → Try it out → Execute
3. **Test Teacher OTP**: 
   - Click `/api/teacher/login`
   - Enter: `{"email": "john.smith@university.edu"}`
   - Execute
   - **Should return**: Success message
   - **Check email** for OTP

### **6. Start Frontend**
```bash
# From project root
npm run dev
```

## 🧪 **Test Complete Flow**

### **Student Registration**
1. Select "Student" → Fill form → Click "SIGN UP"
2. Should show "OTP sent to your email"
3. Check email for 6-digit OTP
4. Enter OTP → Should complete registration

### **Teacher Login**
1. Select "Teacher" → Enter `john.smith@university.edu`
2. Click "SEND OTP" → Should show "OTP sent"
3. Check email for OTP
4. Enter OTP → Should login to dashboard

## 🔍 **If OTP Still Doesn't Work**

### **Check Gmail Setup**
- Verify 2FA is enabled
- Use App Password (16 chars), not regular password
- Check spam folder for OTP emails

### **Test Email Manually**
```bash
# Test teacher OTP endpoint
curl -X POST http://localhost:3000/api/teacher/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@university.edu"}'
```

### **Check Backend Logs**
Look for these messages in terminal:
```
📧 Sending OTP to: john.smith@university.edu
✅ OTP sent successfully
```

## 📱 **Mobile Testing**

For testing on mobile device:
1. Find your computer's IP: `ipconfig` (Windows)
2. Update `services/api.ts`:
   ```typescript
   return 'http://YOUR_IP:3000/api';  // e.g., 192.168.1.100
   ```

The Swagger UI at `http://localhost:3000/api-docs` will be your best friend for testing all API endpoints!