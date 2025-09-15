# Smart Attendance System

A comprehensive QR-based attendance system built with React Native (Expo) frontend and Node.js backend with MySQL database.

## Features

### Security Features
- **Device ID Binding**: Students can only mark attendance from registered devices
- **Geolocation Verification**: 20-meter radius check between teacher and student
- **Dynamic QR Codes**: 10-minute validity with automatic expiration
- **JWT Authentication**: Secure token-based authentication
- **Admin Approval**: Device change requests require admin approval

### Student Features
- Secure registration with device binding
- QR code scanning for attendance
- Real-time location verification
- Attendance history and reports
- Device change request system

### Teacher Features
- Pre-registered teacher accounts
- Dynamic QR code generation for subjects
- Location-based attendance sessions
- Real-time attendance monitoring
- Comprehensive attendance reports
- Subject-wise attendance filtering

## Technology Stack

### Frontend
- React Native with Expo
- Expo Router for navigation
- React Native Reanimated for animations
- Expo Location for geolocation
- Expo Barcode Scanner for QR scanning

### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- bcryptjs for password hashing
- QRCode library for QR generation

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Expo CLI
- React Native development environment

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials and JWT secret.

5. Set up the database:
```bash
mysql -u root -p < database.sql
```

6. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm run dev
```

## Database Schema

### Core Tables
- **students**: Student information and device binding
- **teachers**: Pre-registered teacher accounts
- **subjects**: Course subjects and details
- **qr_sessions**: Dynamic QR code sessions with location data
- **attendance**: Attendance records with geolocation verification
- **device_change_requests**: Admin-approved device changes

### Security Tables
- **admin_users**: System administrators
- **attendance_summary**: Aggregated attendance statistics

## API Endpoints

### Authentication
- `POST /api/student/register` - Student registration
- `POST /api/student/login` - Student login with device verification
- `POST /api/teacher/login` - Teacher login

### Attendance
- `POST /api/teacher/generate-qr` - Generate dynamic QR code
- `POST /api/student/mark-attendance` - Mark attendance with location verification
- `GET /api/teacher/attendance-report/:subjectId` - Get attendance reports

### Security Features
- Device ID verification for all student operations
- Geolocation validation within 20-meter radius
- JWT token authentication for all protected routes
- Admin approval workflow for device changes

## Security Measures

1. **Device Binding**: Each student account is tied to a specific device ID
2. **Location Verification**: Real-time GPS coordinate matching
3. **Dynamic QR Codes**: Time-limited QR codes prevent replay attacks
4. **Admin Oversight**: Device change requests require manual approval
5. **Audit Trail**: Complete logging of all attendance activities

## Development Guidelines

### Adding New Features
1. Follow the existing code structure and patterns
2. Implement proper error handling and validation
3. Add appropriate database indexes for performance
4. Include security checks for all new endpoints
5. Update documentation and API specifications

### Security Considerations
- Always validate user input and sanitize data
- Implement rate limiting for authentication endpoints
- Use HTTPS in production environments
- Regularly update dependencies for security patches
- Monitor and log suspicious activities

## Production Deployment

### Backend
1. Use environment variables for all configuration
2. Set up SSL/TLS certificates
3. Configure database connection pooling
4. Implement logging and monitoring
5. Set up automated backups

### Frontend
1. Build for production using Expo EAS Build
2. Configure app store deployment
3. Set up crash reporting and analytics
4. Implement over-the-air updates

## Support and Maintenance

### Regular Tasks
- Database backup and maintenance
- Security updates and patches
- Performance monitoring and optimization
- User support and issue resolution

### Monitoring
- Server performance and uptime
- Database query optimization
- Mobile app crash reports
- User feedback and feature requests

## License

This project is licensed under the MIT License.