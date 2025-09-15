import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { QrCode, MapPin, Calendar, User, LogOut, ChartBar as BarChart3 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';

interface AttendanceRecord {
  id: number;
  subject_name: string;
  subject_code: string;
  marked_at: string;
  teacher_name: string;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      console.log('📊 Fetching student attendance data...');
      const response = await ApiService.getStudentAttendance();
      console.log('📥 Student attendance response:', response);
      
      if (response.success) {
        // Handle both nested and direct response structures
        const attendanceList = response.data?.attendance || response.data || [];
        console.log('📋 Student attendance records:', attendanceList.length);
        console.log('📋 Attendance data:', attendanceList);
        setAttendanceRecords(attendanceList);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <Text style={styles.userDetails}>
                {user?.enrollmentNumber} • {user?.branch} • Year {user?.year}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#dbeafe' }]}
              onPress={() => router.push('/student/scan-qr')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                <QrCode size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Scan QR</Text>
              <Text style={styles.actionSubtitle}>Mark Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#dcfce7' }]}
              onPress={() => router.push('/student/attendance-report')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#16a34a' }]}>
                <BarChart3 size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionSubtitle}>View Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : attendanceRecords.length > 0 ? (
            <View style={styles.attendanceList}>
              {attendanceRecords.slice(0, 5).map((record) => (
                <View key={record.id} style={styles.attendanceCard}>
                  <View style={styles.attendanceInfo}>
                    <Text style={styles.subjectName}>{record.subject_name}</Text>
                    <Text style={styles.subjectCode}>{record.subject_code}</Text>
                    <Text style={styles.teacherName}>by {record.teacher_name}</Text>
                  </View>
                  <View style={styles.attendanceTime}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.timeText}>{formatDate(record.marked_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Calendar size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Attendance Records</Text>
              <Text style={styles.emptySubtitle}>
                Start scanning QR codes to mark your attendance
              </Text>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>This Month</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{attendanceRecords.length}</Text>
                <Text style={styles.statLabel}>Classes Attended</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {attendanceRecords.length > 0 ? '95%' : '0%'}
                </Text>
                <Text style={styles.statLabel}>Attendance Rate</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    padding: 8,
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
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  attendanceList: {
    gap: 12,
  },
  attendanceCard: {
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
  attendanceInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subjectCode: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 12,
    color: '#6b7280',
  },
  attendanceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
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
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
});