import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Clock } from 'lucide-react-native';
import { getCurrentLocation } from '@/utils/location';
import ApiService from '@/services/api';

export default function ScanQR() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || scanning) return;
    
    setScanned(true);
    setScanning(true);

    try {
      // Parse QR data
      const qrData = JSON.parse(data);
      
      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Unable to get your location. Please enable location services.');
        resetScanner();
        return;
      }

      // Mark attendance
      const response = await ApiService.markAttendance({
        sessionId: qrData.sessionId,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          'Your attendance has been marked successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to mark attendance');
        resetScanner();
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code or network error');
      resetScanner();
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>Camera Permission Required</Text>
          <Text style={styles.errorText}>
            Please grant camera permission to scan QR codes for attendance.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={getCameraPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Scanner */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionCard}>
            <MapPin size={20} color="#3b82f6" />
            <Text style={styles.instructionText}>
              Make sure you're within 20 meters of your teacher
            </Text>
          </View>
          <View style={styles.instructionCard}>
            <Clock size={20} color="#f59e0b" />
            <Text style={styles.instructionText}>
              QR codes are valid for 10 minutes only
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={resetScanner}
            disabled={scanning}
          >
            <Text style={styles.scanAgainText}>
              {scanning ? 'Processing...' : 'Scan Again'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3b82f6',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    gap: 12,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  bottomActions: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scanAgainButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});