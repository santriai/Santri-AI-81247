import { PrayerData } from '../types';

const ALADHAN_API_BASE = "https://api.aladhan.com/v1";

export const getPrayerTimes = async (latitude: number, longitude: number, date: Date = new Date(), method: number = 20, school: number = 0): Promise<PrayerData | null> => {
  const fetchWithTimeout = async (url: string, options: any, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const url = `${ALADHAN_API_BASE}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&nocache=${Date.now()}`;

  let lastError: any = null;
  for (let i = 0; i < 2; i++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const json = await response.json();
      if (json.code !== 200) throw new Error(json.data || "Failed to fetch prayer times");
      
      return json.data;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      // Wait a bit before retry
      if (i === 0) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error("All attempts to fetch prayer times failed:", lastError);
  return null;
};

export const getCityName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Using BigDataCloud's free client-side API which is more reliable for browser requests than Nominatim
    // as it doesn't strictly require User-Agent headers and has better CORS support for this use case.
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
    );
    const json = await response.json();
    
    // Check various fields for city name
    return json.city || json.locality || json.principalSubdivision || "Lokasi Anda";
  } catch (error) {
    //
    return "Lokasi Anda";
  }
};

export const getMonthlyPrayerTimes = async (latitude: number, longitude: number, year: number, month: number, method: number = 20, school: number = 0): Promise<any[] | null> => {
  const fetchWithTimeout = async (url: string, options: any, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const url = `${ALADHAN_API_BASE}/calendar?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&month=${month}&year=${year}`;

  let lastError: any = null;
  for (let i = 0; i < 2; i++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const json = await response.json();
      if (json.code !== 200) throw new Error(json.data || "Failed to fetch monthly calendar");
      
      return json.data; // Array of prayer times for each day of the month
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed to fetch monthly calendar:`, error);
      if (i === 0) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error("All attempts to fetch monthly calendar failed:", lastError);
  return null;
};
