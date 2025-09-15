-- =====================================================
-- SMART ATTENDANCE SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================

CREATE DATABASE IF NOT EXISTS smart_attendance_system;
USE smart_attendance_system;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    device_change_approved BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url VARCHAR(500) NULL,
    phone_number VARCHAR(15) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_students_email (email),
    INDEX idx_students_enrollment (enrollment_number),
    INDEX idx_students_device (device_id),
    INDEX idx_students_branch_year (branch, year)
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) DEFAULT 'Assistant Professor',
    phone_number VARCHAR(15) NULL,
    office_location VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_teachers_email (email),
    INDEX idx_teachers_employee (employee_id),
    INDEX idx_teachers_department (department)
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(255) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_subjects_code (subject_code),
    INDEX idx_subjects_department (department),
    INDEX idx_subjects_semester (semester)
);

-- =====================================================
-- RELATIONSHIP TABLES
-- =====================================================

-- Teacher Subject Assignment
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25',
    semester INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (teacher_id, subject_id, academic_year, semester),
    INDEX idx_teacher_subjects_teacher (teacher_id),
    INDEX idx_teacher_subjects_subject (subject_id)
);

-- =====================================================
-- AUTHENTICATION & SECURITY TABLES
-- =====================================================

-- Temporary Registration Data (for OTP verification)
CREATE TABLE IF NOT EXISTS temp_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    otp_expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_temp_email (email),
    INDEX idx_temp_otp (otp),
    INDEX idx_temp_expiry (otp_expiry)
);

-- Login OTPs Table
CREATE TABLE IF NOT EXISTS login_otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    otp_expiry TIMESTAMP NOT NULL,
    device_id VARCHAR(255) NULL,
    user_type ENUM('student', 'teacher') NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_email_type (email, user_type),
    INDEX idx_otp_email (email),
    INDEX idx_otp_expiry (otp_expiry),
    INDEX idx_otp_type (user_type)
);

-- Device Change Requests
CREATE TABLE IF NOT EXISTS device_change_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    old_device_id VARCHAR(255) NOT NULL,
    new_device_id VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT NULL,
    admin_notes TEXT NULL,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_device_requests_status (status),
    INDEX idx_device_requests_student (student_id)
);

-- =====================================================
-- QR CODE & ATTENDANCE TABLES
-- =====================================================

-- QR Code Sessions
CREATE TABLE IF NOT EXISTS qr_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255) NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_qr_session_id (session_id),
    INDEX idx_qr_expiry (expires_at),
    INDEX idx_qr_teacher (teacher_id),
    INDEX idx_qr_subject (subject_id),
    INDEX idx_qr_active (is_active)
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    qr_session_id INT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    student_latitude DECIMAL(10, 8) NOT NULL,
    student_longitude DECIMAL(11, 8) NOT NULL,
    distance_from_teacher DECIMAL(8, 2) NOT NULL, -- in meters
    is_valid BOOLEAN DEFAULT TRUE,
    attendance_date DATE GENERATED ALWAYS AS (DATE(marked_at)) STORED,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (qr_session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, qr_session_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_subject (subject_id),
    INDEX idx_attendance_teacher (teacher_id),
    INDEX idx_attendance_session (qr_session_id)
);

-- =====================================================
-- ADMIN & MANAGEMENT TABLES
-- =====================================================

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_admin_username (username),
    INDEX idx_admin_email (email),
    INDEX idx_admin_role (role)
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    user_type ENUM('student', 'teacher', 'admin') NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_logs_user (user_id, user_type),
    INDEX idx_logs_action (action),
    INDEX idx_logs_date (created_at)
);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@university.edu', '$2a$10$rZ1zR2QJqS1qV3jL4kN5XOzC4sE6hF7iG8jH9kL0mN1oP2qR3sT4u', 'System Administrator', 'super_admin'),
('moderator', 'moderator@university.edu', '$2a$10$rZ1zR2QJqS1qV3jL4kN5XOzC4sE6hF7iG8jH9kL0mN1oP2qR3sT4u', 'System Moderator', 'moderator');

-- Insert sample teachers
INSERT IGNORE INTO teachers (full_name, email, employee_id, department, designation, phone_number, office_location) VALUES
('Dr. John Smith', 'john.smith@university.edu', 'EMP001', 'Computer Science', 'Professor', '+1234567890', 'CS Building, Room 301'),
('Prof. Sarah Johnson', 'sarah.johnson@university.edu', 'EMP002', 'Mathematics', 'Associate Professor', '+1234567891', 'Math Building, Room 205'),
('Dr. Michael Brown', 'michael.brown@university.edu', 'EMP003', 'Physics', 'Assistant Professor', '+1234567892', 'Physics Lab, Room 101'),
('Dr. Emily Davis', 'emily.davis@university.edu', 'EMP004', 'Computer Science', 'Professor', '+1234567893', 'CS Building, Room 405'),
('Prof. Robert Wilson', 'robert.wilson@university.edu', 'EMP005', 'Electronics', 'Associate Professor', '+1234567894', 'ECE Building, Room 302');

-- Insert sample subjects
INSERT IGNORE INTO subjects (subject_name, subject_code, department, semester, credits, description) VALUES
('Data Structures and Algorithms', 'CS201', 'Computer Science', 3, 4, 'Fundamental data structures and algorithmic techniques'),
('Database Management Systems', 'CS301', 'Computer Science', 5, 3, 'Design and implementation of database systems'),
('Object Oriented Programming', 'CS202', 'Computer Science', 3, 4, 'Programming using object-oriented paradigms'),
('Computer Networks', 'CS401', 'Computer Science', 7, 3, 'Network protocols and distributed systems'),
('Software Engineering', 'CS302', 'Computer Science', 5, 3, 'Software development methodologies and practices'),
('Calculus II', 'MATH201', 'Mathematics', 3, 4, 'Advanced calculus and mathematical analysis'),
('Linear Algebra', 'MATH301', 'Mathematics', 5, 3, 'Vector spaces and linear transformations'),
('Quantum Physics', 'PHY301', 'Physics', 5, 3, 'Quantum mechanics and atomic physics'),
('Digital Electronics', 'ECE201', 'Electronics', 3, 4, 'Digital circuits and logic design'),
('Microprocessors', 'ECE301', 'Electronics', 5, 3, 'Microprocessor architecture and programming');

-- Assign subjects to teachers
INSERT IGNORE INTO teacher_subjects (teacher_id, subject_id, academic_year, semester) VALUES
-- Dr. John Smith (CS)
(1, 1, '2024-25', 3), -- Data Structures
(1, 2, '2024-25', 5), -- Database Management
(1, 4, '2024-25', 7), -- Computer Networks

-- Prof. Sarah Johnson (Math)
(2, 6, '2024-25', 3), -- Calculus II
(2, 7, '2024-25', 5), -- Linear Algebra

-- Dr. Michael Brown (Physics)
(3, 8, '2024-25', 5), -- Quantum Physics

-- Dr. Emily Davis (CS)
(4, 3, '2024-25', 3), -- OOP
(4, 5, '2024-25', 5), -- Software Engineering

-- Prof. Robert Wilson (ECE)
(5, 9, '2024-25', 3), -- Digital Electronics
(5, 10, '2024-25', 5); -- Microprocessors

-- Insert sample students for testing
INSERT IGNORE INTO students (full_name, email, enrollment_number, branch, year, device_id, is_verified, phone_number) VALUES
('Alice Johnson', 'alice.johnson@student.edu', 'CS2021001', 'Computer Science', '3', 'device_alice_001', TRUE, '+1234567801'),
('Bob Smith', 'bob.smith@student.edu', 'CS2021002', 'Computer Science', '3', 'device_bob_002', TRUE, '+1234567802'),
('Charlie Brown', 'charlie.brown@student.edu', 'CS2021003', 'Computer Science', '3', 'device_charlie_003', TRUE, '+1234567803'),
('Diana Prince', 'diana.prince@student.edu', 'CS2019001', 'Computer Science', '5', 'device_diana_004', TRUE, '+1234567804'),
('Eve Wilson', 'eve.wilson@student.edu', 'MATH2021001', 'Mathematics', '3', 'device_eve_005', TRUE, '+1234567805');

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to clean expired OTPs
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanExpiredOTPs()
BEGIN
    DELETE FROM login_otps WHERE otp_expiry < NOW();
    DELETE FROM temp_registrations WHERE otp_expiry < NOW();
END //
DELIMITER ;

-- =====================================================
-- EVENTS FOR AUTOMATIC CLEANUP
-- =====================================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event to clean expired OTPs every hour
CREATE EVENT IF NOT EXISTS cleanup_expired_otps
ON SCHEDULE EVERY 1 HOUR
DO
  CALL CleanExpiredOTPs();

-- Display setup completion message
SELECT 'Smart Attendance System Database Setup Complete!' as message;
SELECT 'Sample data inserted for testing' as note;
SELECT 'Teachers available for OTP testing' as info;