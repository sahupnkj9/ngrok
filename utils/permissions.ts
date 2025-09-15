import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Alert } from 'react-native';

export const PermissionService = {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to verify your attendance location.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to scan QR codes for attendance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Camera.requestCameraPermissionsAsync() },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  },

  async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  },

  async checkCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  },
};