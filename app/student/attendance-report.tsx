import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, TrendingUp, BookOpen } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';

interface AttendanceRecord {
  id: number;
  subject_name: string;
  subject_code: string;
  marked_at: string;
  teacher_name: string;
}

interface SubjectStats {
  subject_name: string;
  subject_code: string;
  total_classes: number;
  attended_classes: number;
  percentage: number;
}

export default function AttendanceReport() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      console.log('📊 Fetching student attendance report...');
      const response = await ApiService.getStudentAttendance();
      console.log('📥 Student attendance report response:', response);
      
      if (response.success) {
        // Handle both nested and direct response structures
        const records = response.data?.attendance || response.data || [];
        console.log('📋 Student attendance records found:', records.length);
        console.log('📋 Records data:', records);
        setAttendanceRecords(records);
        
        // Calculate subject-wise stats
        const stats = calculateSubjectStats(records);
        console.log('📊 Calculated subject stats:', stats);
        setSubjectStats(stats);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubjectStats = (records: AttendanceRecord[]): SubjectStats[] => {
    const subjectMap = new Map<string, SubjectStats>();

    records.forEach((record) => {
      const key = record.subject_code;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subject_name: record.subject_name,
          subject_code: record.subject_code,
          total_classes: 10, // Default fallback - will be updated from API
          attended_classes: 0,
          percentage: 0,
        });
      }
      
      const stats = subjectMap.get(key)!;
      stats.attended_classes += 1;
      stats.percentage = (stats.attended_classes / stats.total_classes) * 100;
    });

    return Array.from(subjectMap.values());
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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return '#16a34a';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const overallAttendance = subjectStats.length > 0 
    ? Math.round(subjectStats.reduce((sum, stat) => sum + stat.percentage, 0) / subjectStats.length)
    : 0;

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overall Stats */}
        <View style={styles.section}>
          <View style={styles.overallCard}>
            <View style={styles.overallHeader}>
              <TrendingUp size={24} color="#3b82f6" />
              <Text style={styles.overallTitle}>Overall Attendance</Text>
            </View>
            <Text style={[styles.overallPercentage, { color: getAttendanceColor(overallAttendance) }]}>
              {overallAttendance}%
            </Text>
            <Text style={styles.overallSubtitle}>
              {attendanceRecords.length} classes attended this semester
            </Text>
          </View>
        </View>

        {/* Subject-wise Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : subjectStats.length > 0 ? (
            <View style={styles.subjectList}>
              {subjectStats.map((stat) => (
                <View key={stat.subject_code} style={styles.subjectCard}>
                  <View style={styles.subjectHeader}>
                    <BookOpen size={20} color="#6b7280" />
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{stat.subject_name}</Text>
                      <Text style={styles.subjectCode}>{stat.subject_code}</Text>
                    </View>
                    <Text style={[styles.subjectPercentage, { color: getAttendanceColor(stat.percentage) }]}>
                      {Math.round(stat.percentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${stat.percentage}%`,
                          backgroundColor: getAttendanceColor(stat.percentage)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.classCount}>
                    {stat.attended_classes} of {stat.total_classes} classes attended
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Calendar size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Attendance Data</Text>
              <Text style={styles.emptySubtitle}>
                Start attending classes to see your attendance report
              </Text>
            </View>
          )}
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          {attendanceRecords.length > 0 ? (
            <View style={styles.recentList}>
              {attendanceRecords.slice(0, 10).map((record) => (
                <View key={record.id} style={styles.recentCard}>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentSubject}>{record.subject_name}</Text>
                    <Text style={styles.recentTeacher}>by {record.teacher_name}</Text>
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
  placeholder: {
    width: 40,
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
  overallCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  overallPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overallSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  subjectList: {
    gap: 16,
  },
  subjectCard: {
    backgroundColor: 'white',
    padding: 20,
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
    marginBottom: 12,
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
    color: '#6b7280',
  },
  subjectPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  classCount: {
    fontSize: 12,
    color: '#6b7280',
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
  recentSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  recentTeacher: {
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