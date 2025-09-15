export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'student' | 'teacher';
  enrollmentNumber?: string;
  branch?: string;
  year?: string;
  department?: string;
  employeeId?: string;
}

export interface StudentRegistrationData {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  branch: string;
  year: string;
  deviceId: string;
}

export interface LoginCredentials {
  email: string;
  deviceId?: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
  deviceId?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    token: string;
    student?: User;
    teacher?: User;
  };
}