# 🌐 Smart Attendance System with Ngrok - Complete Setup Guide

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MySQL** (v8 or higher) 
3. **Ngrok account** - [Sign up here](https://ngrok.com/)
4. **Gmail account** with App Password for OTP

## 🚀 Step-by-Step Setup

### 1. Database Setup

```bash
# Start MySQL service
# Windows: Start MySQL service from Services
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE smart_attendance_system;
exit;

# Run database script (use any migration file from supabase/migrations/)
mysql -u root -p smart_attendance_system < supabase/migrations/20250810032348_fancy_wildflower.sql
```

### 2. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your settings:
# - DB_PASSWORD: Your MySQL root password
# - EMAIL_USER: Your Gmail address
# - EMAIL_PASSWORD: Your Gmail App Password (16 characters)
# - JWT_SECRET: A long random string
```

### 3. Gmail App Password Setup

1. **Enable 2FA** on your Gmail account
2. Go to **Google Account Settings** → **Security** → **2-Step Verification**
3. Scroll to **App passwords** → **Mail** → **Generate**
4. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)
5. Use this in your `.env` file as `EMAIL_PASSWORD=abcdefghijklmnop` (no spaces)

### 4. Ngrok Setup

```bash
# Install ngrok globally
npm install -g ngrok

# Sign up at https://ngrok.com/ and get your auth token
# Configure ngrok with your auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### 5. Running with Ngrok

```bash
# From project root directory
npm run start:ngrok
```

This will:
- Start the backend server on port 3000
- Start ngrok tunnel pointing to localhost:3000
- Display the public ngrok URL

### 6. Update API Configuration

After ngrok starts, you'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the https URL** and update `services/api.ts`:

```typescript
// In services/api.ts, update the production URL:
return 'https://abc123.ngrok.io/api';  // Use your actual ngrok URL
```

### 7. Start Frontend

```bash
# In a new terminal, from project root
npm run dev
```

## 🧪 Testing the Setup

### Test Backend API
```bash
# Test your ngrok URL
curl https://your-ngrok-url.ngrok.io/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

### Test Teacher Login
1. Open app → Select "Teacher"
2. Enter: `john.smith@university.edu`
3. Click "SEND OTP" → Check email for OTP
4. Enter OTP → Should login successfully

### Test Student Registration
1. Select "Student" → Fill registration form
2. Click "SIGN UP" → Check email for OTP
3. Enter OTP → Should complete registration

## 📱 Mobile Device Testing

For testing on physical devices:

1. **Update API URL** in `services/api.ts`:
```typescript
return 'https://your-ngrok-url.ngrok.io/api';
```

2. **Restart the frontend**:
```bash
npm run dev
```

3. **Scan QR code** with Expo Go app on your phone

## 🔧 Troubleshooting

### Ngrok Issues
- **"command not found"**: Install ngrok globally: `npm install -g ngrok`
- **"tunnel not found"**: Sign up at ngrok.com and add auth token
- **"account limit exceeded"**: Free ngrok accounts have limits, upgrade if needed

### Backend Issues
- **Database connection failed**: Check MySQL is running and credentials in `.env`
- **Email not sending**: Verify Gmail App Password setup
- **Port 3000 in use**: Kill process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

### Frontend Issues
- **Network error**: Ensure ngrok URL is updated in `services/api.ts`
- **Metro bundler issues**: Clear cache: `npx expo start --clear`

## 🎯 Pre-configured Test Data

### Teachers (for OTP login):
- `john.smith@university.edu`
- `sarah.johnson@university.edu`
- `michael.brown@university.edu`
- `emily.davis@university.edu`
- `robert.wilson@university.edu`

### Admin Account:
- Username: `admin`
- Password: `admin123`

## 🌐 Sharing with Others

Once ngrok is running:

1. **Share the ngrok URL** with teachers/students
2. **API Documentation**: `https://your-ngrok-url.ngrok.io/api-docs`
3. **Mobile App**: Share the Expo QR code or build APK

## 📊 Features Available

✅ **Student Registration**: OTP-based with device binding  
✅ **Teacher Login**: Pre-registered accounts with OTP  
✅ **QR Generation**: Location-based QR codes (10min validity)  
✅ **Attendance Marking**: 20-meter radius verification  
✅ **Real-time Reports**: Attendance analytics  
✅ **Device Security**: Device change approval system  
✅ **Admin Panel**: Complete system management  

## 🔄 Development Workflow

```bash
# Terminal 1: Start with ngrok
npm run start:ngrok

# Terminal 2: Start frontend (after updating API URL)
npm run dev

# Terminal 3: Database operations (if needed)
mysql -u root -p smart_attendance_system
```

The system is now accessible from anywhere in the world via your ngrok URL!