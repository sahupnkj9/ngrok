# 📱 Mobile Device Setup Guide

## 🚨 Common Mobile Issues & Solutions

### Issue 1: Native Module Errors
**Error**: `react-native-device-info: NativeModule.RNDeviceInfo is null`
**Error**: `Cannot find native module 'ExpoBarCodeScanner'`

**✅ FIXED**: Updated to use proper Expo modules:
- `expo-device` instead of `react-native-device-info`
- `expo-camera` instead of `expo-barcode-scanner`

### Issue 2: Network Connection
**Error**: Cannot connect to backend server

**✅ SOLUTION**: Update API URL for mobile device

## 🔧 **Step-by-Step Mobile Setup**

### **Step 1: Find Your Computer's IP Address**

#### **Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.100
```

#### **macOS/Linux:**
```bash
ifconfig | grep inet
# Look for your local network IP
# Example: inet 192.168.1.100
```

### **Step 2: Update API URL**
Update `services/api.ts` with your computer's IP:

```typescript
// Replace 192.168.1.100 with YOUR actual IP address
return 'http://192.168.1.100:3000/api';
```

### **Step 3: Ensure Same WiFi Network**
- **Computer**: Connected to WiFi
- **Phone**: Connected to SAME WiFi network
- **Backend**: Running on computer at port 3000

### **Step 4: Test Backend from Phone**
1. **Start Backend**: `cd backend && npm run dev`
2. **Test API**: Open phone browser → `http://YOUR_IP:3000/api/health`
3. **Should show**: `{"status":"OK",...}`

### **Step 5: Start Mobile App**
```bash
# From project root
npm run dev
```

1. **Install Expo Go** on your phone
2. **Scan QR code** from Metro terminal
3. **App should load** without native module errors

## 🧪 **Testing Mobile Features**

### **Student Registration Flow**
1. **Select "Student"** → Fill registration form
2. **Click "SIGN UP"** → Should show "OTP sent to your email"
3. **Check email** → Enter 6-digit OTP
4. **Should complete** registration and login

### **Teacher Login Flow**
1. **Select "Teacher"** → Enter `john.smith@university.edu`
2. **Click "SEND OTP"** → Should show "OTP sent"
3. **Check email** → Enter OTP
4. **Should login** to teacher dashboard

### **QR Code Scanning**
1. **Login as Student** → Go to "Scan QR"
2. **Camera should open** without errors
3. **Scan teacher's QR code** → Should mark attendance

## 🔍 **Troubleshooting Mobile Issues**

### **1. Native Module Errors**
**Fixed**: Now using proper Expo modules that work on all platforms

### **2. Network Connection Issues**
```bash
# Test if backend is accessible from phone
# Open phone browser and visit:
http://YOUR_COMPUTER_IP:3000/api/health

# Should return: {"status":"OK"}
```

### **3. Camera Permission Issues**
- **Grant camera permission** when prompted
- **Check phone settings** → App permissions → Camera

### **4. Location Permission Issues**
- **Grant location permission** when prompted
- **Enable GPS** on your phone

## 📱 **Mobile vs Web Differences**

### **Web (localhost:3000)**
- Uses `http://localhost:3000/api`
- All features work in browser
- No native permissions needed

### **Mobile (Expo Go)**
- Uses `http://YOUR_IP:3000/api`
- Requires camera/location permissions
- Real device testing with GPS

## 🎯 **Expected Mobile Results**

After fixing:
- ✅ **No native module errors**
- ✅ **App loads completely**
- ✅ **Student registration works**
- ✅ **Teacher login works**
- ✅ **Camera opens for QR scanning**
- ✅ **Location services work**
- ✅ **Complete attendance flow**

## 🔧 **Quick Fix Commands**

```bash
# 1. Update dependencies (already done)
npm install

# 2. Find your IP address
ipconfig  # Windows
ifconfig  # macOS/Linux

# 3. Update API URL in services/api.ts
# Replace 192.168.1.100 with your actual IP

# 4. Restart everything
cd backend && npm run dev
# New terminal: npm run dev

# 5. Test on phone
# Scan QR code with Expo Go app
```

## 📞 **Still Having Issues?**

1. **Check Backend Logs**: Look for API requests in terminal
2. **Test API URL**: Open `http://YOUR_IP:3000/api/health` in phone browser
3. **Check WiFi**: Ensure phone and computer on same network
4. **Restart Expo**: Clear cache with `npx expo start --clear`

The native module errors should now be completely resolved!