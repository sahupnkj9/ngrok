import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Users, RefreshCw } from 'lucide-react-native';
import { getCurrentLocation } from '@/utils/location';
import ApiService from '@/services/api';

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface QRSession {
  qrCode: string;
  sessionId: string;
  expiresAt: string;
}

export default function GenerateQR() {
  const { subjectId } = useLocalSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [qrSession, setQRSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId && subjects.length > 0) {
      const subject = subjects.find(s => s.id === parseInt(subjectId as string));
      if (subject) {
        setSelectedSubject(subject);
      }
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrSession) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(qrSession.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setQRSession(null);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [qrSession]);

  const fetchSubjects = async () => {
    try {
      const response = await ApiService.getTeacherSubjects();
      if (response.success) {
        setSubjects(response.data?.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const generateQRCode = async () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject first');
      return;
    }

    setLoading(true);
    try {
      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Unable to get your location. Please enable location services.');
        return;
      }

      // Generate QR code
      const response = await ApiService.generateQR({
        subjectId: selectedSubject.id,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (response.success) {
        setQRSession(response.data);
        Alert.alert('Success', 'QR code generated successfully!');
      } else {
        Alert.alert('Error', response.error || 'Failed to generate QR code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate QR Code</Text>
        <View style={styles.placeholder} />
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
                  onPress={() => setSelectedSubject(subject)}
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

        {/* Generate Button */}
        {selectedSubject && !qrSession && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.generateButton, loading && styles.disabledButton]}
              onPress={generateQRCode}
              disabled={loading}
            >
              <MapPin size={20} color="white" />
              <Text style={styles.generateButtonText}>
                {loading ? 'Generating...' : 'Generate QR Code'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.generateHint}>
              Make sure you're in the classroom before generating the QR code
            </Text>
          </View>
        )}

        {/* QR Code Display */}
        {qrSession && (
          <View style={styles.section}>
            <View style={styles.qrContainer}>
              <View style={styles.qrHeader}>
                <Clock size={20} color="#f59e0b" />
                <Text style={styles.qrTimer}>
                  {formatTime(timeRemaining)} remaining
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={generateQRCode}
                  disabled={loading}
                >
                  <RefreshCw size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.qrCodeWrapper}>
                <Image
                  source={{ uri: qrSession.qrCode }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.qrInfo}>
                <Text style={styles.qrSubject}>{selectedSubject?.subject_name}</Text>
                <Text style={styles.qrCode}>{selectedSubject?.subject_code}</Text>
                <Text style={styles.qrInstructions}>
                  Students can scan this QR code to mark their attendance
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Select the subject for which you want to take attendance
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Make sure you're in the classroom before generating QR code
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                QR code will be valid for 10 minutes only
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Students must be within 20 meters to mark attendance
              </Text>
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
  generateButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  generateHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  qrTimer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 4,
  },
  qrCodeWrapper: {
    width: 250,
    height: 250,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrCodeImage: {
    width: '100%',
    height: '100%',
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  qrCode: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 8,
  },
  qrInstructions: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});