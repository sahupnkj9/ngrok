import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, User, Mail, Hash, BookOpen, Calendar, Smartphone, Settings } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    enrollmentNumber: user?.enrollmentNumber || '',
    branch: user?.branch || '',
    year: user?.year || '',
  });

  const handleSave = () => {
    // Here you would typically call an API to update the profile
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleDeviceChangeRequest = () => {
    Alert.alert(
      'Device Change Request',
      'Do you want to request a device change? This will require admin approval.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            // Here you would call an API to create a device change request
            Alert.alert('Request Submitted', 'Your device change request has been submitted for admin approval.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
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

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(!isEditing)}
        >
          <Settings size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color="#3b82f6" />
              </View>
            </View>
            <Text style={styles.profileName}>{user?.fullName}</Text>
            <Text style={styles.profileRole}>Student</Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <User size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={formData.fullName}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
                  />
                ) : (
                  <Text style={styles.infoValue}>{user?.fullName}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Mail size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Hash size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Enrollment Number</Text>
                <Text style={styles.infoValue}>{user?.enrollmentNumber}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <BookOpen size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Branch</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={formData.branch}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, branch: value }))}
                  />
                ) : (
                  <Text style={styles.infoValue}>{user?.branch}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Year</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={formData.year}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, year: value }))}
                  />
                ) : (
                  <Text style={styles.infoValue}>{user?.year}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleDeviceChangeRequest}>
              <View style={styles.actionIcon}>
                <Smartphone size={20} color="#f59e0b" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Request Device Change</Text>
                <Text style={styles.actionSubtitle}>Change your registered device</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
              <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
                <Settings size={20} color="#ef4444" />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: '#ef4444' }]}>Logout</Text>
                <Text style={styles.actionSubtitle}>Sign out of your account</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
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
  editButton: {
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
  profileCard: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingVertical: 4,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});