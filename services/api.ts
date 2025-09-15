// API Configuration - Update this for your environment
const API_BASE_URL = (() => {
  if (__DEV__) {
    // For physical device testing, you need to use your computer's IP
    // Find your IP: Windows (ipconfig), macOS/Linux (ifconfig)
    return 'http://192.168.1.100:3000/api';  // Replace with your actual computer IP
    // For web/simulator use: 'http://localhost:3000/api'
  } else {
    // Production URL
    return 'https://1a18fe50f950.ngrok-free.app/api';
  }
})();

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔧 Development Mode:', __DEV__);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 Making request to: ${API_BASE_URL}${endpoint}`);
      console.log(`📤 Request method: ${options.method || 'GET'}`);
      console.log(`📦 Request body:`, options.body);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`📥 Response status: ${response.status}`);
      
      let data;
      try {
        data = await response.json();
        console.log('📋 Response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        const textResponse = await response.text();
        console.log('📄 Raw response:', textResponse);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error: any) {
      console.error('❌ API Request Error:', error);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. Please check if the backend server is running.',
        };
      }
      
      if (error.message?.includes('fetch')) {
        return {
          success: false,
          error: 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:3000',
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error. Please check if the backend server is running on http://localhost:3000',
      };
    }
  }

  // ==================== STUDENT APIs ====================

  // Student Registration - Step 1: Send OTP
  async registerStudent(studentData: {
    fullName: string;
    email: string;
    enrollmentNumber: string;
    branch: string;
    year: string;
    deviceId: string;
  }): Promise<ApiResponse> {
    return this.makeRequest('/student/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  // Student Registration - Step 2: Verify OTP
  async verifyStudentRegistration(email: string, otp: string): Promise<ApiResponse> {
    return this.makeRequest('/student/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Student Login - Step 1: Send OTP
  async loginStudent(email: string, deviceId: string): Promise<ApiResponse> {
    return this.makeRequest('/student/login', {
      method: 'POST',
      body: JSON.stringify({ email, deviceId }),
    });
  }

  // Student Login - Step 2: Verify OTP
  async verifyStudentLogin(email: string, otp: string, deviceId: string): Promise<ApiResponse> {
    return this.makeRequest('/student/verify-login', {
      method: 'POST',
      body: JSON.stringify({ email, otp, deviceId }),
    });
  }

  // Mark Attendance
  async markAttendance(attendanceData: {
    sessionId: string;
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse> {
    return this.makeRequest('/student/mark-attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  // Get Student Attendance
  async getStudentAttendance(): Promise<ApiResponse> {
    return this.makeRequest('/student/attendance');
  }

  // Request Device Change
  async requestDeviceChange(newDeviceId: string, reason: string): Promise<ApiResponse> {
    return this.makeRequest('/student/request-device-change', {
      method: 'POST',
      body: JSON.stringify({ newDeviceId, reason }),
    });
  }

  // ==================== TEACHER APIs ====================

  // Teacher Login - Step 1: Send OTP
  async loginTeacher(email: string): Promise<ApiResponse> {
    return this.makeRequest('/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Teacher Login - Step 2: Verify OTP
  async verifyTeacherLogin(email: string, otp: string): Promise<ApiResponse> {
    return this.makeRequest('/teacher/verify-login', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Generate QR Code
  async generateQR(qrData: {
    subjectId: number;
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse> {
    return this.makeRequest('/teacher/generate-qr', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  }

  // Get Teacher Subjects
  async getTeacherSubjects(): Promise<ApiResponse> {
    return this.makeRequest('/teacher/subjects');
  }

  // Get Attendance Report
  async getAttendanceReport(subjectId: number): Promise<ApiResponse> {
    return this.makeRequest(`/teacher/attendance-report/${subjectId}`, {
      method: 'GET',
    });
  }

  // Get Active QR Sessions
  async getActiveQRSessions(): Promise<ApiResponse> {
    return this.makeRequest('/teacher/active-sessions');
  }

  // ==================== ADMIN APIs ====================

  // Get Device Change Requests
  async getDeviceChangeRequests(): Promise<ApiResponse> {
    return this.makeRequest('/admin/device-change-requests');
  }

  // Process Device Change Request
  async processDeviceRequest(requestId: number, action: 'approve' | 'reject', adminNotes?: string): Promise<ApiResponse> {
    return this.makeRequest(`/admin/process-device-request/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action, adminNotes }),
    });
  }

  // Get System Stats
  async getSystemStats(): Promise<ApiResponse> {
    return this.makeRequest('/admin/stats');
  }

  // ==================== UTILITY APIs ====================

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }
}

export default ApiService.getInstance();