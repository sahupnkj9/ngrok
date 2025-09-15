export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: number;
  credits: number;
}

export interface QRSession {
  id: number;
  session_id: string;
  subject_id: number;
  teacher_id: number;
  latitude: number;
  longitude: number;
  expires_at: string;
  is_active: boolean;
  qrCode?: string;
  subject?: Subject;
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  teacher_id: number;
  subject_id: number;
  marked_at: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  distance_from_teacher: number;
}

export interface AttendanceRequest {
  sessionId: string;
  latitude: number;
  longitude: number;
}

export interface QRGenerationRequest {
  subjectId: number;
  latitude: number;
  longitude: number;
}