import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';

export default function TeacherLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Sending OTP to teacher:', email);
      const response = await ApiService.loginTeacher(email);

      console.log('📥 Teacher OTP response:', response);
      
      if (response.success) {
        setShowOTPInput(true);
        Alert.alert('✅ OTP Sent', `Please check your email (${email}) for the verification code.`);
      } else {
        console.error('❌ Teacher OTP failed:', response.error);
        Alert.alert('❌ OTP Failed', response.error || 'Failed to send OTP. Please check if the backend server is running on http://localhost:3000');
      }
    } catch (error) {
      console.error('❌ Teacher login error:', error);
      Alert.alert('❌ Network Error', 'Cannot connect to backend server. Please ensure:\n\n1. Backend is running on http://localhost:3000\n2. MySQL database is connected\n3. Gmail credentials are configured');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Verifying teacher OTP for:', email);
      
      const response = await ApiService.verifyTeacherLogin(email, otp);
      
      console.log('📥 Teacher verification response:', response);

      if (response.success) {
        await login(response.data.token, {
          ...response.data.teacher,
          role: 'teacher' as const,
        });
        router.replace('/teacher/dashboard');
      } else {
        console.error('❌ Teacher verification failed:', response.error);
        Alert.alert('❌ Verification Failed', response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ Teacher verification error:', error);
      Alert.alert('❌ Network Error', 'Failed to verify OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderSocialButtons = () => (
    <View style={styles.socialContainer}>
      <TouchableOpacity style={styles.socialButton}>
        <Text style={styles.socialButtonText}>G</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton}>
        <Text style={styles.socialButtonText}>f</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton}>
        <Text style={styles.socialButtonText}>🍎</Text>
      </TouchableOpacity>
    </View>
  );

  // OTP Verification Screen
  if (showOTPInput) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.gradient}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.appTitle}>SMART ATTENDANCE</Text>
              <Text style={styles.appSubtitle}>SYSTEM</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.otpTitle}>Enter Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                We've sent a 6-digit code to{'\n'}{email}
              </Text>

              <View style={styles.otpContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, loading && styles.disabledButton]} 
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backToFormButton}
                onPress={() => setShowOTPInput(false)}
              >
                <Text style={styles.backToFormText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Login Screen
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>SMART ATTENDANCE</Text>
            <Text style={styles.appSubtitle}>SYSTEM</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.tagline}>Seamless QR-based attendance</Text>
            
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Dear Teacher</Text>

            {renderSocialButtons()}
            
            <Text style={styles.orText}>Or</Text>
            
            <View style={styles.loginSection}>
              <Text style={styles.loginTitle}>Login Via</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Email ID"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, loading && styles.disabledButton]} 
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  {loading ? 'SENDING OTP...' : 'SEND OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Back to Role Selection</Text>
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
    paddingTop: 60,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  socialButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
    marginBottom: 32,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  otpContainer: {
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 24,
    color: '#1e293b',
    borderWidth: 2,
    borderColor: '#16a34a',
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginSection: {
    width: '100%',
    marginTop: 20,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  backToFormButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToFormText: {
    fontSize: 14,
    color: '#64748b',
  },
});