# Smart Attendance System - Database Setup Instructions

## Prerequisites
- MySQL 8.0 or higher
- Node.js 16+ 
- VS Code (recommended)

## Step-by-Step Setup

### 1. Install MySQL
```bash
# Windows: Download from https://dev.mysql.com/downloads/mysql/
# macOS: brew install mysql
# Ubuntu: sudo apt install mysql-server
```

### 2. Start MySQL Service
```bash
# Windows: Start MySQL service from Services
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql
```

### 3. Create Database
```bash
# Open MySQL command line or MySQL Workbench
mysql -u root -p

# Run the database script
source /path/to/backend/database.sql

# OR copy-paste the entire database.sql content
```

### 4. Verify Database Setup
```sql
USE smart_attendance_system;
SHOW TABLES;
SELECT COUNT(*) FROM teachers;
SELECT COUNT(*) FROM subjects;
```

### 5. Configure Backend Environment
```bash
cd backend
cp .env.example .env

# Edit .env file with your settings:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=smart_attendance_system
```

### 6. Gmail Setup for OTP
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Google Account → Security → 2-Step Verification
   - App passwords → Mail → Generate
3. Update .env with the 16-character app password

### 7. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 8. Test Database Connection
The server should show:
```
✅ Database connected successfully
✅ Server running on port 3000
```

## Sample Accounts

### Teachers (Pre-registered):
- john.smith@university.edu
- sarah.johnson@university.edu  
- michael.brown@university.edu
- emily.davis@university.edu
- robert.wilson@university.edu

### Admin:
- Username: admin
- Password: admin123

## Troubleshooting

### MySQL Connection Issues:
```bash
# Check MySQL service
sudo systemctl status mysql

# Reset MySQL password if needed
sudo mysql_secure_installation
```

### Permission Issues:
```sql
-- Grant permissions to user
GRANT ALL PRIVILEGES ON smart_attendance_system.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Port Conflicts:
- Backend runs on port 3000
- MySQL runs on port 3306
- Make sure these ports are available

## Database Features

✅ **12+ Tables**: Complete schema with relationships  
✅ **Sample Data**: 5 teachers, 10 subjects, 5 students  
✅ **Security**: Device binding, audit logs, admin approval  
✅ **Performance**: Indexes, views, stored procedures  
✅ **Automation**: Triggers and scheduled events  
✅ **OTP System**: Secure email verification  
✅ **Geolocation**: 20-meter radius verification  
✅ **Audit Trail**: Complete system logging  

## Next Steps

1. Run the database script
2. Configure Gmail credentials  
3. Start backend server
4. Test OTP functionality
5. Start frontend application

The system is now ready for testing!