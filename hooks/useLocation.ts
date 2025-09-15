import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { PermissionService } from '@/utils/permissions';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Check permission first
      const hasPermission = await PermissionService.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      // Get current position
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      setLocation({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async (): Promise<void> => {
    await getCurrentLocation();
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refreshLocation,
  };
};