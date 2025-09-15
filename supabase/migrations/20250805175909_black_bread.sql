-- Smart Attendance System Database Schema

CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_change_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects Table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(255) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Subject Assignment
CREATE TABLE teacher_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (teacher_id, subject_id, academic_year, semester)
);

-- Student Subject Enrollment
CREATE TABLE student_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, subject_id, academic_year, semester)
);

-- QR Code Sessions
CREATE TABLE qr_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_session_expiry (expires_at),
    INDEX idx_session_id (session_id)
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
    distance_from_teacher DECIMAL(8, 2), -- in meters
    is_valid BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (qr_session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, qr_session_id),
    INDEX idx_attendance_date (marked_at),
    INDEX idx_student_subject (student_id, subject_id)
);

-- Device Change Requests
CREATE TABLE device_change_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    old_device_id VARCHAR(255) NOT NULL,
    new_device_id VARCHAR(255) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT NULL,
    admin_notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Admin Users (for device change approvals)
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Attendance Summary (for reporting)
CREATE TABLE attendance_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    total_classes INT DEFAULT 0,
    attended_classes INT DEFAULT 0,
    attendance_percentage DECIMAL(5, 2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_summary (student_id, subject_id, academic_year, semester)
);

-- Sample Data for Testing

-- Insert sample teachers
INSERT INTO teachers (full_name, email, department, employee_id) VALUES
('Dr. John Smith', 'john.smith@university.edu', 'Computer Science', 'EMP001'),
('Prof. Sarah Johnson', 'sarah.johnson@university.edu', 'Mathematics', 'EMP002'),
('Dr. Michael Brown', 'michael.brown@university.edu', 'Physics', 'EMP003');

-- Insert sample subjects
INSERT INTO subjects (subject_name, subject_code, department, semester, credits) VALUES
('Data Structures', 'CS201', 'Computer Science', 3, 4),
('Database Management', 'CS301', 'Computer Science', 5, 3),
('Calculus II', 'MATH201', 'Mathematics', 3, 4),
('Quantum Physics', 'PHY301', 'Physics', 5, 3);

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@university.edu', '$2a$10$rZ1zR2QJqS1qV3jL4kN5XOzC4sE6hF7iG8jH9kL0mN1oP2qR3sT4u', 'System Administrator', 'super_admin');

-- Assign subjects to teachers
INSERT INTO teacher_subjects (teacher_id, subject_id, academic_year, semester) VALUES
(1, 1, '2024-25', 3),
(1, 2, '2024-25', 5),
(2, 3, '2024-25', 3),
(3, 4, '2024-25', 5);

-- Create indexes for better performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_enrollment ON students(enrollment_number);
CREATE INDEX idx_students_device ON students(device_id);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_qr_sessions_teacher ON qr_sessions(teacher_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, marked_at);

-- Create views for common queries

-- Student Attendance View
CREATE VIEW student_attendance_view AS
SELECT 
    s.id as student_id,
    s.full_name as student_name,
    s.enrollment_number,
    sub.subject_name,
    sub.subject_code,
    t.full_name as teacher_name,
    a.marked_at,
    a.distance_from_teacher,
    DATE(a.marked_at) as attendance_date
FROM attendance a
JOIN students s ON a.student_id = s.id
JOIN subjects sub ON a.subject_id = sub.id
JOIN teachers t ON a.teacher_id = t.id
WHERE a.is_valid = TRUE;

-- Teacher Subject View
CREATE VIEW teacher_subject_view AS
SELECT 
    t.id as teacher_id,
    t.full_name as teacher_name,
    t.email as teacher_email,
    s.id as subject_id,
    s.subject_name,
    s.subject_code,
    s.department,
    s.semester,
    ts.academic_year
FROM teachers t
JOIN teacher_subjects ts ON t.id = ts.teacher_id
JOIN subjects s ON ts.subject_id = s.id
WHERE t.is_active = TRUE;