import { useState, useEffect } from 'react';
import { getDeviceId, getDeviceInfo } from '@/utils/deviceInfo';

interface DeviceData {
  deviceId: string;
  brand: string;
  model: string;
  systemVersion: string;
}

interface UseDeviceInfoReturn {
  deviceData: DeviceData | null;
  loading: boolean;
  error: string | null;
}

export const useDeviceInfo = (): UseDeviceInfoReturn => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const info = await getDeviceInfo();
        setDeviceData(info);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get device info';
        setError(errorMessage);
        console.error('Device info error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
  }, []);

  return {
    deviceData,
    loading,
    error,
  };
};