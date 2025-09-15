import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Users, GraduationCap } from 'lucide-react-native';

export default function RoleSelection() {
  const handleRoleSelection = (role: 'student' | 'teacher') => {
    if (role === 'student') {
      router.push('/student/auth');
    } else {
      router.push('/teacher/login');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f1f5f9', '#e2e8f0']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>SMART ATTENDANCE</Text>
            <Text style={styles.appSubtitle}>SYSTEM</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>
              Select how you want to access the{'\n'}attendance system
            </Text>

            {/* Role Cards */}
            <View style={styles.rolesContainer}>
              {/* Student Card */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('student')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, styles.studentIconBg]}>
                  <Users size={28} color="#4f46e5" />
                </View>
                <Text style={styles.roleTitle}>Student</Text>
                <TouchableOpacity
                  style={[styles.continueButton, styles.studentButton]}
                  onPress={() => handleRoleSelection('student')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue as Student</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Teacher Card */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('teacher')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, styles.teacherIconBg]}>
                  <GraduationCap size={28} color="#059669" />
                </View>
                <Text style={styles.roleTitle}>Teacher</Text>
                <TouchableOpacity
                  style={[styles.continueButton, styles.teacherButton]}
                  onPress={() => handleRoleSelection('teacher')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue as Teacher</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
  },
  rolesContainer: {
    width: '100%',
    gap: 24,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  studentIconBg: {
    backgroundColor: '#e0e7ff',
  },
  teacherIconBg: {
    backgroundColor: '#d1fae5',
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 24,
  },
  continueButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentButton: {
    backgroundColor: '#4f46e5',
  },
  teacherButton: {
    backgroundColor: '#059669',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});