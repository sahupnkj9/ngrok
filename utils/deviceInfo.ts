import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get stored device ID first
    const storedDeviceId = await AsyncStorage.getItem('deviceId');
    if (storedDeviceId) {
      return storedDeviceId;
    }

    // Generate device ID using Expo Device
    let deviceId: string;
    
    if (Device.osName) {
      // Use device info to create unique ID
      deviceId = `${Device.osName}_${Device.modelName}_${Date.now()}`.replace(/\s+/g, '_');
    } else {
      // Fallback to generated ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    await AsyncStorage.setItem('deviceId', deviceId);
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to a generated ID
    const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await AsyncStorage.setItem('deviceId', fallbackId);
    } catch (storageError) {
      console.error('Error storing fallback device ID:', storageError);
    }
    return fallbackId;
  }
};

export const getDeviceInfo = async () => {
  try {
    const deviceId = await getDeviceId();
    
    return {
      deviceId,
      brand: Device.brand || 'Unknown',
      model: Device.modelName || 'Unknown',
      systemVersion: Device.osVersion || 'Unknown',
      osName: Device.osName || 'Unknown',
      deviceType: Device.deviceType || 'Unknown',
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    const deviceId = await getDeviceId();
    return {
      deviceId,
      brand: 'Unknown',
      model: 'Unknown',
      systemVersion: 'Unknown',
      osName: 'Unknown',
      deviceType: 'Unknown',
    };
  }
};