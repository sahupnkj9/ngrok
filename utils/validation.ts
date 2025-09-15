export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const validateEnrollmentNumber = (enrollmentNumber: string): boolean => {
  return enrollmentNumber.length >= 6 && enrollmentNumber.length <= 20;
};

export const validateFullName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
};

export const validateBranch = (branch: string): boolean => {
  return branch.trim().length >= 2;
};

export const validateYear = (year: string): boolean => {
  const yearNum = parseInt(year);
  return yearNum >= 1 && yearNum <= 5;
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateStudentRegistration = (data: {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  branch: string;
  year: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!validateFullName(data.fullName)) {
    errors.push('Full name must be at least 2 characters and contain only letters');
  }

  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!validateEnrollmentNumber(data.enrollmentNumber)) {
    errors.push('Enrollment number must be between 6-20 characters');
  }

  if (!validateBranch(data.branch)) {
    errors.push('Branch must be at least 2 characters');
  }

  if (!validateYear(data.year)) {
    errors.push('Year must be between 1-5');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};