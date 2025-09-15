import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { QrCode, Users, ChartBar as BarChart3, BookOpen, LogOut, Plus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: number;
}

interface ActiveSession {
  id: number;
  subject_name: string;
  expires_at: string;
  student_count: number;
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching teacher dashboard data...');
      const [subjectsResponse, sessionsResponse] = await Promise.all([
        ApiService.getTeacherSubjects(),
        ApiService.getActiveQRSessions(),
      ]);

      console.log('📚 Subjects response:', subjectsResponse);
      console.log('🔄 Sessions response:', sessionsResponse);

      if (subjectsResponse.success) {
        const subjectsList = subjectsResponse.data?.subjects || [];
        console.log('📚 Loaded subjects:', subjectsList.length);
        setSubjects(subjectsList);
      }

      if (sessionsResponse.success) {
        const sessionsList = sessionsResponse.data?.sessions || [];
        console.log('🔄 Active sessions:', sessionsList.length);
        setActiveSessions(sessionsList);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes > 0 ? `${minutes}m remaining` : 'Expired';
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
                {user?.department} Department
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
              onPress={() => router.push('/teacher/generate-qr')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                <QrCode size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Generate QR</Text>
              <Text style={styles.actionSubtitle}>Start Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#dcfce7' }]}
              onPress={() => router.push('/teacher/attendance-reports')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#16a34a' }]}>
                <BarChart3 size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionSubtitle}>View Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active QR Sessions</Text>
            <View style={styles.sessionsList}>
              {activeSessions.map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionIcon}>
                      <QrCode size={20} color="#3b82f6" />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionSubject}>{session.subject_name}</Text>
                      <Text style={styles.sessionTime}>
                        {formatTimeRemaining(session.expires_at)}
                      </Text>
                    </View>
                    <View style={styles.sessionStats}>
                      <Text style={styles.sessionCount}>{session.student_count}</Text>
                      <Text style={styles.sessionLabel}>Students</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* My Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Subjects</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : subjects.length > 0 ? (
            <View style={styles.subjectsList}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectCard}
                  onPress={() => router.push(`/teacher/subject-details/${subject.id}`)}
                >
                  <View style={styles.subjectHeader}>
                    <BookOpen size={20} color="#6b7280" />
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{subject.subject_name}</Text>
                      <Text style={styles.subjectCode}>{subject.subject_code}</Text>
                      <Text style={styles.subjectDetails}>
                        Semester {subject.semester} • {subject.department}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.quickQRButton}
                      onPress={() => router.push(`/teacher/generate-qr?subjectId=${subject.id}`)}
                    >
                      <Plus size={16} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <BookOpen size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Subjects Assigned</Text>
              <Text style={styles.emptySubtitle}>
                Contact admin to get subjects assigned to your account
              </Text>
            </View>
          )}
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>This Week</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeSessions.length}</Text>
                <Text style={styles.statLabel}>Active Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{subjects.length}</Text>
                <Text style={styles.statLabel}>Total Subjects</Text>
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
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: '#f59e0b',
  },
  sessionStats: {
    alignItems: 'center',
  },
  sessionCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  sessionLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectInfo: {
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
  subjectDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickQRButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
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