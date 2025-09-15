import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getDeviceId } from '@/utils/deviceInfo';
import ApiService from '@/services/api';

export default function StudentAuth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    enrollmentNumber: '',
    branch: '',
    year: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.enrollmentNumber || !formData.branch || !formData.year) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting registration process...');
      const deviceId = await getDeviceId();
      console.log('Device ID:', deviceId);
      
      console.log('📤 Sending registration request with data:', {
        fullName: formData.fullName,
        email: formData.email,
        enrollmentNumber: formData.enrollmentNumber,
        branch: formData.branch,
        year: formData.year,
        deviceId,
      });
      
      const response = await ApiService.registerStudent({
        ...formData,
        deviceId,
      });

      console.log('📥 Registration response:', response);
      
      if (response.success) {
        setShowOTPInput(true);
        Alert.alert('✅ OTP Sent', `Please check your email (${formData.email}) for the verification code.`);
      } else {
        console.error('❌ Registration failed:', response.error);
        Alert.alert('❌ Registration Failed', response.error || 'Failed to send OTP. Please check if the backend server is running on http://localhost:3000');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert('❌ Network Error', 'Cannot connect to backend server. Please ensure:\n\n1. Backend server is running on http://localhost:3000\n2. MySQL database is connected\n3. Gmail credentials are configured');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Verifying OTP:', { email: formData.email, otp: formData.otp });
      
      const response = await ApiService.verifyStudentRegistration(formData.email, formData.otp);
      
      console.log('📥 OTP verification response:', response);

      if (response.success) {
        await login(response.data.token, {
          ...response.data.student,
          role: 'student' as const,
        });
        Alert.alert('✅ Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/student/dashboard') }
        ]);
      } else {
        console.error('❌ OTP verification failed:', response.error);
        Alert.alert('❌ Verification Failed', response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      Alert.alert('❌ Network Error', 'Failed to verify OTP. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Starting login process for:', formData.email);
      
      const deviceId = await getDeviceId();
      console.log('📱 Device ID:', deviceId);
      
      const response = await ApiService.loginStudent(formData.email, deviceId);
      
      console.log('📥 Login response:', response);

      if (response.success) {
        setShowOTPInput(true);
        Alert.alert('✅ OTP Sent', `Please check your email (${formData.email}) for the verification code.`);
      } else {
        console.error('❌ Login failed:', response.error);
        Alert.alert('❌ Login Failed', response.error || 'Failed to send OTP. Please check your email and try again.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('❌ Network Error', 'Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Verifying login OTP for:', formData.email);
      
      const deviceId = await getDeviceId();
      const response = await ApiService.verifyStudentLogin(formData.email, formData.otp, deviceId);
      
      console.log('📥 Login verification response:', response);

      if (response.success) {
        await login(response.data.token, {
          ...response.data.student,
          role: 'student' as const,
        });
        router.replace('/student/dashboard');
      } else {
        console.error('❌ Login verification failed:', response.error);
        Alert.alert('❌ Verification Failed', response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ Login verification error:', error);
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

  // OTP Input Screen
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
                We've sent a 6-digit code to{'\n'}{formData.email}
              </Text>

              <View style={styles.otpContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChangeText={(value) => handleInputChange('otp', value)}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, loading && styles.disabledButton]} 
                onPress={isLogin ? handleVerifyLogin : handleVerifyRegistration}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton}
                onPress={isLogin ? handleLogin : handleSignUp}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backToFormButton}
                onPress={() => setShowOTPInput(false)}
              >
                <Text style={styles.backToFormText}>Back to {isLogin ? 'Login' : 'Registration'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Login Screen
  if (isLogin) {
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
              <Text style={styles.welcomeSubtitle}>Dear Student</Text>

              {renderSocialButtons()}
              
              <Text style={styles.orText}>Or</Text>
              
              <View style={styles.loginSection}>
                <Text style={styles.loginTitle}>Login Via</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Email ID"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.actionButton, loading && styles.disabledButton]} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>
                    {loading ? 'SENDING OTP...' : 'SEND OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.switchMode}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={styles.switchModeText}>
                    Don't have an Account? <Text style={styles.linkText}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Registration Screen
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
            <Text style={styles.createAccountTitle}>Create Account</Text>

            {renderSocialButtons()}
            
            <Text style={styles.orText}>Or</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Full Name"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Email ID"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enrollment Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Enrollment Number"
                  value={formData.enrollmentNumber}
                  onChangeText={(value) => handleInputChange('enrollmentNumber', value)}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.inputLabel}>Branch</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Branch"
                    value={formData.branch}
                    onChangeText={(value) => handleInputChange('branch', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.inputLabel}>Year</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Year"
                    value={formData.year}
                    onChangeText={(value) => handleInputChange('year', value)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, loading && styles.disabledButton]} 
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>
                  {loading ? 'SENDING OTP...' : 'SIGN UP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchMode}
                onPress={() => setIsLogin(true)}
              >
                <Text style={styles.switchModeText}>
                  Already have an Account? <Text style={styles.linkText}>Sign In</Text>
                </Text>
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
  createAccountTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 32,
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
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  halfInputContainer: {
    flex: 1,
    marginBottom: 20,
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
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
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
    borderColor: '#4f46e5',
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
  switchMode: {
    alignItems: 'center',
    marginTop: 24,
  },
  switchModeText: {
    fontSize: 14,
    color: '#64748b',
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '600',
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
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#4f46e5',
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