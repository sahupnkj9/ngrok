# Smart Attendance System - Backend API

A comprehensive QR-based attendance system backend with OTP authentication, geolocation verification, and device binding security.

## 🚀 Features

### 🔐 Security Features
- **OTP-based Authentication**: Email OTP verification for both students and teachers
- **Device ID Binding**: Students can only mark attendance from registered devices
- **Geolocation Verification**: 20-meter radius check between teacher and student
- **Dynamic QR Codes**: 10-minute validity with automatic expiration
- **JWT Authentication**: Secure token-based authentication
- **Admin Approval System**: Device change requests require admin approval

### 📧 Email Integration
- **Gmail SMTP**: Professional email templates for OTP delivery
- **Automatic Cleanup**: Expired OTPs are automatically removed
- **Rate Limiting**: Prevents spam and abuse

### 📊 Comprehensive Database
- **Complete Schema**: 12+ tables with proper relationships
- **Performance Optimized**: Strategic indexes for fast queries
- **Audit Trail**: Complete logging of all activities
- **Data Integrity**: Foreign key constraints and validation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Gmail account with App Password

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
```bash
# Create database and tables
mysql -u root -p < database.sql
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
nano .env
```

### 4. Gmail Setup for OTP
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### 🎓 Student Authentication
```
POST /api/student/register           # Send registration OTP
POST /api/student/verify-registration # Verify OTP & complete registration
POST /api/student/login              # Send login OTP
POST /api/student/verify-login       # Verify OTP & login
```

### 👨‍🏫 Teacher Authentication
```
POST /api/teacher/login              # Send login OTP
POST /api/teacher/verify-login       # Verify OTP & login
```

### 📱 QR Code & Attendance
```
POST /api/teacher/generate-qr        # Generate location-based QR code
POST /api/student/mark-attendance    # Mark attendance with location verification
GET  /api/teacher/active-sessions    # Get active QR sessions
```

### 📊 Reports & Analytics
```
GET /api/student/attendance          # Student's attendance history
GET /api/teacher/subjects            # Teacher's assigned subjects
GET /api/teacher/attendance-report/:subjectId # Subject attendance report
```

### 🔧 Device Management
```
POST /api/student/request-device-change # Request device change
GET  /api/admin/device-change-requests  # Get pending requests (Admin)
POST /api/admin/process-device-request/:id # Approve/reject request (Admin)
```

## 🗄️ Database Schema

### Core Tables
- **students**: Student information with device binding
- **teachers**: Pre-registered teacher accounts
- **subjects**: Course subjects and details
- **qr_sessions**: Dynamic QR sessions with location data
- **attendance**: Attendance records with geolocation

### Security Tables
- **temp_registrations**: Temporary data during OTP verification
- **login_otps**: OTP storage with expiration
- **device_change_requests**: Device change approval workflow
- **admin_users**: System administrators
- **system_logs**: Complete audit trail

### Performance Features
- **Strategic Indexes**: Optimized for common queries
- **Views**: Pre-computed joins for reporting
- **Stored Procedures**: Automated cleanup and calculations
- **Triggers**: Automatic logging and summary updates

## 🔒 Security Implementation

### Authentication Flow
1. **Registration**: Email → OTP → Device Binding → Account Creation
2. **Login**: Email + Device → OTP → JWT Token
3. **Device Change**: Request → Admin Approval → New Device Binding

### Data Protection
- **SQL Injection Prevention**: Prepared statements
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevents brute force attacks
- **Secure Headers**: Helmet.js for security headers

### Location Security
- **Real-time Verification**: GPS coordinates checked on attendance
- **Distance Calculation**: Haversine formula for accurate distance
- **Location Logging**: All coordinates stored for audit

## 📈 Performance Features

### Database Optimization
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed columns for fast lookups
- **Automatic Cleanup**: Scheduled events for maintenance

### Caching Strategy
- **JWT Tokens**: 24-hour validity with refresh capability
- **Session Management**: Efficient session handling
- **Query Results**: Optimized for common report queries

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_system

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Security
OTP_EXPIRY_MINUTES=10
MAX_DISTANCE_METERS=20
```

### Production Deployment
1. **SSL/TLS**: Enable HTTPS
2. **Database Security**: Use dedicated database user
3. **Environment Variables**: Use secure secret management
4. **Monitoring**: Set up logging and monitoring
5. **Backup**: Automated database backups

## 🧪 Testing

### Sample Data
- **5 Teachers**: Pre-configured with subjects
- **5 Students**: Ready for testing
- **10 Subjects**: Across multiple departments
- **Admin Account**: Username: `admin`, Password: `admin123`

### Test Scenarios
1. **Student Registration**: Complete OTP flow
2. **Device Binding**: Test device restrictions
3. **QR Generation**: Location-based QR codes
4. **Attendance Marking**: Distance verification
5. **Device Change**: Admin approval workflow

## 📞 Support

### Common Issues
- **Email Not Sending**: Check Gmail App Password setup
- **Database Connection**: Verify MySQL credentials
- **OTP Expiry**: OTPs are valid for 10 minutes only
- **Location Issues**: Ensure GPS permissions are granted

### Monitoring
- **Health Check**: `GET /api/health`
- **System Stats**: `GET /api/admin/stats`
- **Error Logs**: Check console output for detailed errors

## 📄 License
MIT License - See LICENSE file for details

---
**Smart Attendance System v1.0.0**  
Built with ❤️ for educational institutions