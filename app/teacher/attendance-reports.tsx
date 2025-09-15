import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Users, Calendar, Download } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: number;
}

interface AttendanceRecord {
  id: number;
  full_name: string;
  enrollment_number: string;
  email: string;
  marked_at: string;
  distance_from_teacher: number;
}

interface AttendanceStats {
  total_students: number;
  total_classes: number;
  total_attendance: number;
  average_attendance: number;
}

export default function AttendanceReports() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [reportStats, setReportStats] = useState<AttendanceStats>({
    total_students: 0,
    total_classes: 0,
    total_attendance: 0,
    average_attendance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      console.log('📚 Fetching teacher subjects...');
      const response = await ApiService.getTeacherSubjects();
      console.log('📥 Subjects response:', response);
      
      if (response.success && response.data?.subjects) {
        const subjectsList = response.data.subjects;
        console.log('📚 Loaded subjects:', subjectsList.length);
        setSubjects(subjectsList);
        
        // Auto-select first subject
        if (subjectsList.length > 0) {
          handleSubjectChange(subjectsList[0]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = async (subject: Subject) => {
    setSelectedSubject(subject);
    setLoading(true);
    
    try {
      console.log('📊 Fetching attendance report for subject ID:', subject.id);
      const response = await ApiService.getAttendanceReport(subject.id);
      console.log('📥 Attendance report response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure
        const reportData = response.data.data || response.data;
        
        console.log('📋 Report data structure:', reportData);
        
        if (reportData.attendance) {
          console.log('📋 Attendance data:', reportData.attendance.length, 'records');
          setAttendanceData(reportData.attendance);
        } else {
          console.log('📋 No attendance data found');
          setAttendanceData([]);
        }
        
        if (reportData.stats) {
          console.log('📊 Stats:', reportData.stats);
          setReportStats(reportData.stats);
        } else {
          console.log('📊 No stats found, using defaults');
          setReportStats({
            total_students: 0,
            total_classes: 0,
            total_attendance: 0,
            average_attendance: 0
          });
        }
      } else {
        console.log('❌ Failed to fetch attendance report:', response.error);
        setAttendanceData([]);
        setReportStats({
          total_students: 0,
          total_classes: 0,
          total_attendance: 0,
          average_attendance: 0
        });
      }
    } catch (error) {
      console.error('❌ Error fetching attendance report:', error);
      setAttendanceData([]);
      setReportStats({
        total_students: 0,
        total_classes: 0,
        total_attendance: 0,
        average_attendance: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate unique students for display
  const uniqueStudents = attendanceData.reduce((acc, record) => {
    const existing = acc.find(student => student.enrollmentNumber === record.enrollment_number);
    if (!existing) {
      acc.push({
        name: record.full_name,
        enrollmentNumber: record.enrollment_number,
        email: record.email,
        attendanceCount: 1
      });
    } else {
      existing.attendanceCount += 1;
    }
    return acc;
  }, [] as Array<{name: string, enrollmentNumber: string, email: string, attendanceCount: number}>);

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Reports</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Download size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Subject Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
            <View style={styles.subjectList}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectCard,
                    selectedSubject?.id === subject.id && styles.selectedSubjectCard,
                  ]}
                  onPress={() => handleSubjectChange(subject)}
                >
                  <Text style={[
                    styles.subjectName,
                    selectedSubject?.id === subject.id && styles.selectedSubjectName,
                  ]}>
                    {subject.subject_name}
                  </Text>
                  <Text style={[
                    styles.subjectCode,
                    selectedSubject?.id === subject.id && styles.selectedSubjectCode,
                  ]}>
                    {subject.subject_code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Users size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{reportStats.total_students}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#16a34a" />
              <Text style={styles.statNumber}>{reportStats.total_classes}</Text>
              <Text style={styles.statLabel}>Total Classes</Text>
            </View>
            <View style={styles.statCard}>
              <Download size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>
                {reportStats.average_attendance}%
              </Text>
              <Text style={styles.statLabel}>Avg Attendance</Text>
            </View>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Student Attendance</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : uniqueStudents.length > 0 ? (
            <View style={styles.studentList}>
              {uniqueStudents.map((student) => {
                const attendancePercentage = reportStats.total_classes > 0 
                  ? (student.attendanceCount / reportStats.total_classes) * 100 
                  : 0;
                const getStatusColor = (percentage: number) => {
                  if (percentage >= 75) return '#16a34a';
                  if (percentage >= 60) return '#f59e0b';
                  return '#ef4444';
                };

                return (
                  <View key={student.enrollmentNumber} style={styles.studentCard}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentEnrollment}>{student.enrollmentNumber}</Text>
                      <Text style={styles.attendanceCount}>
                        {student.attendanceCount} of {reportStats.total_classes} classes
                      </Text>
                    </View>
                    <View style={styles.attendanceStats}>
                      <Text style={[
                        styles.attendancePercentage,
                        { color: getStatusColor(attendancePercentage) }
                      ]}>
                        {Math.round(attendancePercentage)}%
                      </Text>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${attendancePercentage}%`,
                              backgroundColor: getStatusColor(attendancePercentage)
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Users size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Attendance Data</Text>
              <Text style={styles.emptySubtitle}>
                Generate QR codes to start collecting attendance
              </Text>
            </View>
          )}
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {attendanceData.length > 0 ? (
            <View style={styles.recentList}>
              {attendanceData.slice(0, 10).map((record, index) => (
                <View key={index} style={styles.recentCard}>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>{record.full_name}</Text>
                    <Text style={styles.recentEnrollment}>{record.enrollment_number}</Text>
                  </View>
                  <View style={styles.recentTime}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.recentDate}>{formatDate(record.marked_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Recent Attendance</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  filterButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  subjectScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  subjectList: {
    flexDirection: 'row',
    gap: 12,
  },
  subjectCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedSubjectCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedSubjectName: {
    color: '#1d4ed8',
  },
  subjectCode: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedSubjectCode: {
    color: '#3b82f6',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  studentList: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  studentEnrollment: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 2,
  },
  attendanceCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  attendanceStats: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  attendancePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  recentList: {
    gap: 12,
  },
  recentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  recentEnrollment: {
    fontSize: 12,
    color: '#6b7280',
  },
  recentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});