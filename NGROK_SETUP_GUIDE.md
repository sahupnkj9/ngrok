# 🌐 Ngrok Setup Guide for Remote Access

## 🚀 Quick Setup for Remote Teacher Access

### **Step 1: Install Ngrok**
```bash
# Install ngrok globally
npm install -g ngrok

# Or download from: https://ngrok.com/download
```

### **Step 2: Setup Ngrok Account**
1. **Sign up**: Go to [https://ngrok.com/](https://ngrok.com/)
2. **Get Auth Token**: Copy your auth token from dashboard
3. **Configure**: Run `ngrok config add-authtoken YOUR_AUTH_TOKEN`

### **Step 3: Start with Ngrok**
```bash
# Start backend with ngrok tunnel
npm run start:ngrok
```

**Expected Output:**
```
📡 Starting Backend Server...
🚀 Smart Attendance System API running on port 3000
🌐 Starting Ngrok tunnel for backend...

ngrok                                                          
                                                               
Session Status                online                           
Account                       your-email@gmail.com             
Version                       3.1.0                            
Region                        United States (us)               
Latency                       45ms                             
Web Interface                 http://127.0.0.1:4040            
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     
                              0       0       0.00    0.00    
```

### **Step 4: Update API URL**
Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update `services/api.ts`:

```typescript
// For remote access via ngrok
const API_BASE_URL = 'https://abc123.ngrok.io/api';
```

### **Step 5: Share with Teacher**
Send your teacher:
1. **API Documentation**: `https://abc123.ngrok.io/api-docs`
2. **Mobile App**: Build and share APK or use Expo Go
3. **Test Credentials**: Pre-registered teacher emails

## 🧪 **Testing Remote Access**

### **Test API Health**
```bash
curl https://abc123.ngrok.io/api/health
```

### **Test Teacher Login**
1. **Open**: `https://abc123.ngrok.io/api-docs`
2. **Try**: `POST /api/teacher/login`
3. **Email**: `john.smith@university.edu`
4. **Should**: Send OTP to email

## 📱 **Mobile App for Teacher**

### **Option 1: Expo Go**
1. **Update API URL** in `services/api.ts` with ngrok URL
2. **Start frontend**: `npm run dev`
3. **Share QR code** with teacher
4. **Teacher installs** Expo Go and scans QR

### **Option 2: Build APK**
```bash
# Build standalone APK
npx expo build:android

# Or use EAS Build
npx eas build --platform android
```

## 🔧 **Troubleshooting**

### **Ngrok Not Working**
```bash
# Check if ngrok is installed
ngrok version

# If not installed
npm install -g ngrok

# Configure auth token
ngrok config add-authtoken YOUR_TOKEN
```

### **API Not Accessible**
1. **Check ngrok URL**: Make sure it's https://
2. **Update API_BASE_URL**: In services/api.ts
3. **Restart frontend**: After updating API URL

### **Teacher Can't Access**
1. **Share correct URL**: https://abc123.ngrok.io/api-docs
2. **Check internet**: Both you and teacher need internet
3. **Keep ngrok running**: Don't close the terminal

## 🎯 **For Your Teacher**

Send this to your teacher:

---

**🎓 Smart Attendance System - Teacher Access**

**API Documentation**: `https://abc123.ngrok.io/api-docs`

**Test Login**:
1. Open the API docs link above
2. Click `POST /api/teacher/login`
3. Enter your email address
4. Check email for OTP
5. Use `POST /api/teacher/verify-login` with OTP

**Pre-registered Teacher Emails**:
- `john.smith@university.edu`
- `sarah.johnson@university.edu`
- `michael.brown@university.edu`
- `emily.davis@university.edu`
- `robert.wilson@university.edu`

**Mobile App**: [Share Expo Go QR code or APK file]

---

## 📊 **Features Available**

✅ **Teacher Login**: OTP-based authentication  
✅ **QR Generation**: Location-based QR codes  
✅ **Attendance Reports**: Real-time analytics  
✅ **Student Management**: View attendance records  
✅ **Dashboard**: Complete overview  

The system is now accessible from anywhere in the world!