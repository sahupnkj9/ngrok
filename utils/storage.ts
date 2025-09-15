import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  DEVICE_ID: 'deviceId',
  LAST_LOGIN: 'lastLogin',
  APP_SETTINGS: 'appSettings',
};

export const StorageService = {
  // Generic storage methods
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Specific methods for common operations
  async setAuthToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setUserData(userData: object): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  async getUserData(): Promise<object | null> {
    const data = await this.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async setDeviceId(deviceId: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  },

  async getDeviceId(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.DEVICE_ID);
  },

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.LAST_LOGIN,
    ]);
  },
};