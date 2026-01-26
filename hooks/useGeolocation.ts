'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseGeolocationReturn {
  location: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  getCurrentLocation: () => Promise<GeolocationPosition>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(false);
  const [cacheTime, setCacheTime] = useState<number>(0);

  const CACHE_DURATION = 30000; // 30秒缓存

  const getCurrentLocation = useCallback(async (): Promise<GeolocationPosition> => {
    // 使用缓存的位置（30秒内）
    if (location && Date.now() - cacheTime < CACHE_DURATION) {
      return location;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const err = new Error('浏览器不支持地理定位') as any;
        err.code = 0;
        setError(err);
        setLoading(false);
        reject(err);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setCacheTime(Date.now());
          setLoading(false);
          resolve(position);
        },
        (error) => {
          setError(error);
          setLoading(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [location, cacheTime]);

  // 自动获取位置（可选）
  useEffect(() => {
    // 仅在需要时调用，不自动获取
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
  };
}
