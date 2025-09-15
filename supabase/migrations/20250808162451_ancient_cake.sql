-- =====================================================
-- SMART ATTENDANCE SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================

CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Students Table
CREATE TABLE students (
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
CREATE TABLE teachers (
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
CREATE TABLE subjects (
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
CREATE TABLE teacher_subjects (
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

-- Student Subject Enrollment
CREATE TABLE student_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25',
    semester INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, subject_id, academic_year, semester),
    INDEX idx_student_subjects_student (student_id),
    INDEX idx_student_subjects_subject (subject_id)
);

-- =====================================================
-- AUTHENTICATION & SECURITY TABLES
-- =====================================================

-- Temporary Registration Data (for OTP verification)
CREATE TABLE temp_registrations (
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
CREATE TABLE login_otps (
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
CREATE TABLE device_change_requests (
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
CREATE TABLE qr_sessions (
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
CREATE TABLE attendance (
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
CREATE TABLE admin_users (
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

-- Attendance Summary (for quick reporting)
CREATE TABLE attendance_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-25',
    semester INT NOT NULL,
    total_classes INT DEFAULT 0,
    attended_classes INT DEFAULT 0,
    attendance_percentage DECIMAL(5, 2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_summary (student_id, subject_id, academic_year, semester),
    INDEX idx_summary_student (student_id),
    INDEX idx_summary_subject (subject_id),
    INDEX idx_summary_percentage (attendance_percentage)
);

-- =====================================================
-- AUDIT & LOGGING TABLES
-- =====================================================

-- System Logs
CREATE TABLE system_logs (
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

-- Failed Login Attempts
CREATE TABLE failed_login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NULL,
    user_type ENUM('student', 'teacher') NOT NULL,
    ip_address VARCHAR(45) NULL,
    reason VARCHAR(255) NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_failed_email (email),
    INDEX idx_failed_date (attempted_at)
);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@university.edu', '$2a$10$rZ1zR2QJqS1qV3jL4kN5XOzC4sE6hF7iG8jH9kL0mN1oP2qR3sT4u', 'System Administrator', 'super_admin'),
('moderator', 'moderator@university.edu', '$2a$10$rZ1zR2QJqS1qV3jL4kN5XOzC4sE6hF7iG8jH9kL0mN1oP2qR3sT4u', 'System Moderator', 'moderator');

-- Insert sample teachers
INSERT INTO teachers (full_name, email, employee_id, department, designation, phone_number, office_location) VALUES
('Dr. John Smith', 'john.smith@university.edu', 'EMP001', 'Computer Science', 'Professor', '+1234567890', 'CS Building, Room 301'),
('Prof. Sarah Johnson', 'sarah.johnson@university.edu', 'EMP002', 'Mathematics', 'Associate Professor', '+1234567891', 'Math Building, Room 205'),
('Dr. Michael Brown', 'michael.brown@university.edu', 'EMP003', 'Physics', 'Assistant Professor', '+1234567892', 'Physics Lab, Room 101'),
('Dr. Emily Davis', 'emily.davis@university.edu', 'EMP004', 'Computer Science', 'Professor', '+1234567893', 'CS Building, Room 405'),
('Prof. Robert Wilson', 'robert.wilson@university.edu', 'EMP005', 'Electronics', 'Associate Professor', '+1234567894', 'ECE Building, Room 302');

-- Insert sample subjects
INSERT INTO subjects (subject_name, subject_code, department, semester, credits, description) VALUES
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
INSERT INTO teacher_subjects (teacher_id, subject_id, academic_year, semester) VALUES
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
INSERT INTO students (full_name, email, enrollment_number, branch, year, device_id, is_verified, phone_number) VALUES
('Alice Johnson', 'alice.johnson@student.edu', 'CS2021001', 'Computer Science', '3', 'device_alice_001', TRUE, '+1234567801'),
('Bob Smith', 'bob.smith@student.edu', 'CS2021002', 'Computer Science', '3', 'device_bob_002', TRUE, '+1234567802'),
('Charlie Brown', 'charlie.brown@student.edu', 'CS2021003', 'Computer Science', '3', 'device_charlie_003', TRUE, '+1234567803'),
('Diana Prince', 'diana.prince@student.edu', 'CS2019001', 'Computer Science', '5', 'device_diana_004', TRUE, '+1234567804'),
('Eve Wilson', 'eve.wilson@student.edu', 'MATH2021001', 'Mathematics', '3', 'device_eve_005', TRUE, '+1234567805');

-- Enroll students in subjects
INSERT INTO student_subjects (student_id, subject_id, academic_year, semester) VALUES
-- Alice Johnson (3rd year CS)
(1, 1, '2024-25', 3), -- Data Structures
(1, 3, '2024-25', 3), -- OOP
(1, 6, '2024-25', 3), -- Calculus II
(1, 9, '2024-25', 3), -- Digital Electronics

-- Bob Smith (3rd year CS)
(2, 1, '2024-25', 3), -- Data Structures
(2, 3, '2024-25', 3), -- OOP
(2, 6, '2024-25', 3), -- Calculus II

-- Charlie Brown (3rd year CS)
(3, 1, '2024-25', 3), -- Data Structures
(3, 3, '2024-25', 3), -- OOP

-- Diana Prince (5th year CS)
(4, 2, '2024-25', 5), -- Database Management
(4, 5, '2024-25', 5), -- Software Engineering
(4, 7, '2024-25', 5), -- Linear Algebra
(4, 8, '2024-25', 5), -- Quantum Physics

-- Eve Wilson (3rd year Math)
(5, 6, '2024-25', 3), -- Calculus II
(5, 7, '2024-25', 5); -- Linear Algebra

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to clean expired OTPs
DELIMITER //
CREATE PROCEDURE CleanExpiredOTPs()
BEGIN
    DELETE FROM login_otps WHERE otp_expiry < NOW();
    DELETE FROM temp_registrations WHERE otp_expiry < NOW();
END //
DELIMITER ;

-- Procedure to clean expired QR sessions
DELIMITER //
CREATE PROCEDURE CleanExpiredQRSessions()
BEGIN
    UPDATE qr_sessions SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE;
END //
DELIMITER ;

-- Procedure to update attendance summary
DELIMITER //
CREATE PROCEDURE UpdateAttendanceSummary(IN p_student_id INT, IN p_subject_id INT)
BEGIN
    DECLARE v_total_classes INT DEFAULT 0;
    DECLARE v_attended_classes INT DEFAULT 0;
    DECLARE v_percentage DECIMAL(5,2) DEFAULT 0.00;
    
    -- Count total classes for the subject
    SELECT COUNT(*) INTO v_total_classes
    FROM qr_sessions 
    WHERE subject_id = p_subject_id 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    -- Count attended classes by student
    SELECT COUNT(*) INTO v_attended_classes
    FROM attendance 
    WHERE student_id = p_student_id 
    AND subject_id = p_subject_id 
    AND is_valid = TRUE;
    
    -- Calculate percentage
    IF v_total_classes > 0 THEN
        SET v_percentage = (v_attended_classes / v_total_classes) * 100;
    END IF;
    
    -- Insert or update summary
    INSERT INTO attendance_summary (student_id, subject_id, total_classes, attended_classes, attendance_percentage)
    VALUES (p_student_id, p_subject_id, v_total_classes, v_attended_classes, v_percentage)
    ON DUPLICATE KEY UPDATE
        total_classes = v_total_classes,
        attended_classes = v_attended_classes,
        attendance_percentage = v_percentage,
        last_updated = NOW();
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update attendance summary when attendance is marked
DELIMITER //
CREATE TRIGGER after_attendance_insert
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    CALL UpdateAttendanceSummary(NEW.student_id, NEW.subject_id);
END //
DELIMITER ;

-- Trigger to log attendance marking
DELIMITER //
CREATE TRIGGER after_attendance_log
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (user_id, user_type, action, description, created_at)
    VALUES (NEW.student_id, 'student', 'MARK_ATTENDANCE', 
            CONCAT('Marked attendance for subject ID: ', NEW.subject_id, ', Distance: ', NEW.distance_from_teacher, 'm'), 
            NOW());
END //
DELIMITER ;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Student Attendance View
CREATE VIEW student_attendance_view AS
SELECT 
    s.id as student_id,
    s.full_name as student_name,
    s.enrollment_number,
    s.branch,
    s.year,
    sub.subject_name,
    sub.subject_code,
    t.full_name as teacher_name,
    a.marked_at,
    a.distance_from_teacher,
    a.attendance_date,
    qs.location_name
FROM attendance a
JOIN students s ON a.student_id = s.id
JOIN subjects sub ON a.subject_id = sub.id
JOIN teachers t ON a.teacher_id = t.id
JOIN qr_sessions qs ON a.qr_session_id = qs.id
WHERE a.is_valid = TRUE;

-- Teacher Subject View
CREATE VIEW teacher_subject_view AS
SELECT 
    t.id as teacher_id,
    t.full_name as teacher_name,
    t.email as teacher_email,
    t.department as teacher_department,
    s.id as subject_id,
    s.subject_name,
    s.subject_code,
    s.department as subject_department,
    s.semester,
    s.credits,
    ts.academic_year
FROM teachers t
JOIN teacher_subjects ts ON t.id = ts.teacher_id
JOIN subjects s ON ts.subject_id = s.id
WHERE t.is_active = TRUE AND s.is_active = TRUE;

-- Attendance Statistics View
CREATE VIEW attendance_stats_view AS
SELECT 
    s.id as student_id,
    s.full_name as student_name,
    s.enrollment_number,
    s.branch,
    s.year,
    sub.id as subject_id,
    sub.subject_name,
    sub.subject_code,
    COUNT(a.id) as classes_attended,
    (SELECT COUNT(*) FROM qr_sessions qs WHERE qs.subject_id = sub.id AND qs.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)) as total_classes,
    ROUND((COUNT(a.id) / NULLIF((SELECT COUNT(*) FROM qr_sessions qs WHERE qs.subject_id = sub.id AND qs.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)), 0)) * 100, 2) as attendance_percentage
FROM students s
CROSS JOIN subjects sub
LEFT JOIN attendance a ON s.id = a.student_id AND sub.id = a.subject_id AND a.is_valid = TRUE
WHERE s.is_active = TRUE AND sub.is_active = TRUE
GROUP BY s.id, sub.id;

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

-- Event to clean expired QR sessions every 5 minutes
CREATE EVENT IF NOT EXISTS cleanup_expired_qr_sessions
ON SCHEDULE EVERY 5 MINUTE
DO
  CALL CleanExpiredQRSessions();

-- =====================================================
-- INITIAL CONFIGURATION
-- =====================================================

-- Set timezone
SET time_zone = '+00:00';

-- Display setup completion message
SELECT 'Smart Attendance System Database Setup Complete!' as message;
SELECT 'Sample data inserted for testing' as note;
SELECT 'Remember to configure email settings in .env file' as reminder;