// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-url.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Security Configuration
export const SECURITY_CONFIG = {
  MAX_DISTANCE_METERS: 20,
  QR_VALIDITY_MINUTES: 10,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  JWT_EXPIRY: '24h',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Smart Attendance System',
  VERSION: '1.0.0',
  UNIVERSITY_NAME: 'Your University',
  SUPPORT_EMAIL: 'support@university.edu',
};

// Colors
export const COLORS = {
  primary: '#4f46e5',
  secondary: '#16a34a',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  white: '#ffffff',
  black: '#000000',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Typography
export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    xxxxl: 32,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};