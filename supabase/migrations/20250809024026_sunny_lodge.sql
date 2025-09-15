-- =====================================================
-- SMART ATTENDANCE SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS smart_attendance_system;
USE smart_attendance_system;

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS qr_sessions;
DROP TABLE IF EXISTS device_change_requests;
DROP TABLE IF EXISTS login_otps;
DROP TABLE IF EXISTS temp_registrations;
DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS subject_teachers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS students;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Students table with device binding
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year_of_study INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_model VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_device_id (device_id)
);

-- Teachers table (pre-registered)
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_email (email)
);

-- Subjects table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_subject_code (subject_code),
    INDEX idx_department (department)
);

-- Subject-Teacher mapping
CREATE TABLE subject_teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subject_teacher (subject_id, teacher_id, academic_year)
);

-- =====================================================
-- AUTHENTICATION TABLES
-- =====================================================

-- Temporary registrations for OTP verification
CREATE TABLE temp_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year_of_study INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_model VARCHAR(100),
    otp VARCHAR(6) NOT NULL,
    otp_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_otp (otp),
    INDEX idx_expires (otp_expires_at)
);

-- Login OTPs for both students and teachers
CREATE TABLE login_otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    user_type ENUM('student', 'teacher') NOT NULL,
    device_id VARCHAR(255),
    otp_expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_otp (otp),
    INDEX idx_expires (otp_expires_at)
);

-- Device change requests (admin approval required)
CREATE TABLE device_change_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    old_device_id VARCHAR(255) NOT NULL,
    new_device_id VARCHAR(255) NOT NULL,
    new_device_model VARCHAR(100),
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);

-- =====================================================
-- ATTENDANCE SYSTEM TABLES
-- =====================================================

-- QR Sessions (dynamic QR codes with location)
CREATE TABLE qr_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_code VARCHAR(50) UNIQUE NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    session_name VARCHAR(100) NOT NULL,
    location_latitude DECIMAL(10, 8) NOT NULL,
    location_longitude DECIMAL(11, 8) NOT NULL,
    location_address TEXT,
    max_distance_meters INT DEFAULT 20,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_session_code (session_code),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- Attendance records
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    qr_session_id INT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    student_latitude DECIMAL(10, 8) NOT NULL,
    student_longitude DECIMAL(11, 8) NOT NULL,
    distance_from_teacher DECIMAL(8, 2) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (qr_session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_session (student_id, qr_session_id),
    INDEX idx_student_id (student_id),
    INDEX idx_session_id (qr_session_id),
    INDEX idx_marked_at (marked_at)
);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- System logs for audit trail
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_type ENUM('student', 'teacher', 'admin', 'system') NOT NULL,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    additional_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_type (user_type),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Student attendance summary view
CREATE VIEW student_attendance_summary AS
SELECT 
    s.id as student_id,
    s.student_id,
    s.name as student_name,
    s.department,
    s.year_of_study,
    COUNT(a.id) as total_attendance,
    COUNT(DISTINCT DATE(a.marked_at)) as days_present,
    COUNT(DISTINCT qs.subject_id) as subjects_attended
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id AND a.is_valid = TRUE
LEFT JOIN qr_sessions qs ON a.qr_session_id = qs.id
WHERE s.is_active = TRUE
GROUP BY s.id, s.student_id, s.name, s.department, s.year_of_study;

-- Subject attendance summary view
CREATE VIEW subject_attendance_summary AS
SELECT 
    sub.id as subject_id,
    sub.subject_code,
    sub.subject_name,
    sub.department,
    t.name as teacher_name,
    COUNT(DISTINCT qs.id) as total_sessions,
    COUNT(a.id) as total_attendance_marks,
    COUNT(DISTINCT a.student_id) as unique_students_attended,
    ROUND(AVG(CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END) * 100, 2) as attendance_percentage
FROM subjects sub
JOIN subject_teachers st ON sub.id = st.subject_id AND st.is_active = TRUE
JOIN teachers t ON st.teacher_id = t.id
LEFT JOIN qr_sessions qs ON sub.id = qs.subject_id AND qs.is_active = TRUE
LEFT JOIN attendance a ON qs.id = a.qr_session_id AND a.is_valid = TRUE
WHERE sub.is_active = TRUE
GROUP BY sub.id, sub.subject_code, sub.subject_name, sub.department, t.name;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Cleanup expired OTPs
DELIMITER //
CREATE PROCEDURE CleanupExpiredOTPs()
BEGIN
    DELETE FROM temp_registrations WHERE otp_expires_at < NOW();
    DELETE FROM login_otps WHERE otp_expires_at < NOW() OR is_used = TRUE;
END //
DELIMITER ;

-- Get student attendance percentage for a subject
DELIMITER //
CREATE PROCEDURE GetStudentAttendancePercentage(
    IN p_student_id INT,
    IN p_subject_id INT,
    OUT p_percentage DECIMAL(5,2)
)
BEGIN
    DECLARE total_sessions INT DEFAULT 0;
    DECLARE attended_sessions INT DEFAULT 0;
    
    SELECT COUNT(*) INTO total_sessions
    FROM qr_sessions 
    WHERE subject_id = p_subject_id AND is_active = TRUE;
    
    SELECT COUNT(*) INTO attended_sessions
    FROM attendance a
    JOIN qr_sessions qs ON a.qr_session_id = qs.id
    WHERE a.student_id = p_student_id 
    AND qs.subject_id = p_subject_id 
    AND a.is_valid = TRUE;
    
    IF total_sessions > 0 THEN
        SET p_percentage = (attended_sessions / total_sessions) * 100;
    ELSE
        SET p_percentage = 0;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Log student registration
DELIMITER //
CREATE TRIGGER after_student_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (user_type, user_id, action, description)
    VALUES ('student', NEW.id, 'REGISTRATION', 
            CONCAT('Student registered: ', NEW.name, ' (', NEW.student_id, ')'));
END //
DELIMITER ;

-- Log attendance marking
DELIMITER //
CREATE TRIGGER after_attendance_insert
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (user_type, user_id, action, description, additional_data)
    VALUES ('student', NEW.student_id, 'ATTENDANCE_MARKED', 
            'Attendance marked for QR session',
            JSON_OBJECT('qr_session_id', NEW.qr_session_id, 'distance', NEW.distance_from_teacher));
END //
DELIMITER ;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample teachers
INSERT INTO teachers (teacher_id, name, email, phone, department, designation) VALUES
('T001', 'Dr. John Smith', 'john.smith@university.edu', '+1234567890', 'Computer Science', 'Professor'),
('T002', 'Dr. Sarah Johnson', 'sarah.johnson@university.edu', '+1234567891', 'Computer Science', 'Associate Professor'),
('T003', 'Dr. Michael Brown', 'michael.brown@university.edu', '+1234567892', 'Information Technology', 'Assistant Professor'),
('T004', 'Dr. Emily Davis', 'emily.davis@university.edu', '+1234567893', 'Computer Science', 'Professor'),
('T005', 'Dr. Robert Wilson', 'robert.wilson@university.edu', '+1234567894', 'Information Technology', 'Associate Professor');

-- Insert sample subjects
INSERT INTO subjects (subject_code, subject_name, department, semester, credits) VALUES
('CS101', 'Introduction to Programming', 'Computer Science', 1, 4),
('CS201', 'Data Structures and Algorithms', 'Computer Science', 3, 4),
('CS301', 'Database Management Systems', 'Computer Science', 5, 3),
('CS401', 'Software Engineering', 'Computer Science', 7, 3),
('IT101', 'Computer Networks', 'Information Technology', 2, 3),
('IT201', 'Web Development', 'Information Technology', 4, 4),
('IT301', 'Mobile Application Development', 'Information Technology', 6, 3),
('CS202', 'Object Oriented Programming', 'Computer Science', 4, 4),
('CS302', 'Operating Systems', 'Computer Science', 6, 3),
('IT401', 'Cybersecurity Fundamentals', 'Information Technology', 8, 3);

-- Map subjects to teachers
INSERT INTO subject_teachers (subject_id, teacher_id, academic_year) VALUES
(1, 1, '2024-25'), -- CS101 -> Dr. John Smith
(2, 1, '2024-25'), -- CS201 -> Dr. John Smith
(3, 2, '2024-25'), -- CS301 -> Dr. Sarah Johnson
(4, 2, '2024-25'), -- CS401 -> Dr. Sarah Johnson
(5, 3, '2024-25'), -- IT101 -> Dr. Michael Brown
(6, 3, '2024-25'), -- IT201 -> Dr. Michael Brown
(7, 5, '2024-25'), -- IT301 -> Dr. Robert Wilson
(8, 4, '2024-25'), -- CS202 -> Dr. Emily Davis
(9, 4, '2024-25'), -- CS302 -> Dr. Emily Davis
(10, 5, '2024-25'); -- IT401 -> Dr. Robert Wilson

-- Insert sample students
INSERT INTO students (student_id, name, email, phone, department, year_of_study, device_id, device_model) VALUES
('2024CS001', 'Alice Johnson', 'alice.johnson@student.edu', '+1234567801', 'Computer Science', 2, 'DEVICE001', 'iPhone 14'),
('2024CS002', 'Bob Smith', 'bob.smith@student.edu', '+1234567802', 'Computer Science', 2, 'DEVICE002', 'Samsung Galaxy S23'),
('2024IT001', 'Charlie Brown', 'charlie.brown@student.edu', '+1234567803', 'Information Technology', 1, 'DEVICE003', 'iPhone 13'),
('2024CS003', 'Diana Prince', 'diana.prince@student.edu', '+1234567804', 'Computer Science', 3, 'DEVICE004', 'OnePlus 11'),
('2024IT002', 'Eve Wilson', 'eve.wilson@student.edu', '+1234567805', 'Information Technology', 2, 'DEVICE005', 'Google Pixel 7');

-- =====================================================
-- EVENTS (Scheduled Tasks)
-- =====================================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Cleanup expired OTPs every 30 minutes
CREATE EVENT IF NOT EXISTS cleanup_expired_otps
ON SCHEDULE EVERY 30 MINUTE
DO
  CALL CleanupExpiredOTPs();

-- Cleanup old system logs (keep only last 90 days)
CREATE EVENT IF NOT EXISTS cleanup_old_logs
ON SCHEDULE EVERY 1 DAY
DO
  DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for better performance
CREATE INDEX idx_attendance_date ON attendance (DATE(marked_at));
CREATE INDEX idx_qr_sessions_date ON qr_sessions (DATE(created_at));
CREATE INDEX idx_students_department_year ON students (department, year_of_study);
CREATE INDEX idx_subjects_department_semester ON subjects (department, semester);

-- =====================================================
-- ADMIN USER (Optional)
-- =====================================================

-- Create admin table for system administration
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admins (username, password_hash, name, email, role) VALUES
('admin', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'System Administrator', 'admin@university.edu', 'super_admin');

-- =====================================================
-- FINAL SETUP VERIFICATION
-- =====================================================

-- Show table count
SELECT 
    'Tables Created' as Status,
    COUNT(*) as Count
FROM information_schema.tables 
WHERE table_schema = 'smart_attendance_system';

-- Show sample data count
SELECT 'Students' as Table_Name, COUNT(*) as Records FROM students
UNION ALL
SELECT 'Teachers' as Table_Name, COUNT(*) as Records FROM teachers
UNION ALL
SELECT 'Subjects' as Table_Name, COUNT(*) as Records FROM subjects
UNION ALL
SELECT 'Subject_Teachers' as Table_Name, COUNT(*) as Records FROM subject_teachers;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

SELECT 'Database setup completed successfully!' as Message;
SELECT 'You can now start the backend server and test the application.' as Next_Step;