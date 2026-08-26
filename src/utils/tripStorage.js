import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@logbook/trips';

// shape: { trips: [{id,title,type,startDate,endDate,cost,currency,note}] }
export async function loadTrips() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { trips: [] };
  } catch (e) {
    console.warn('Failed to load trips', e);
    return { trips: [] };
  }
}

export async function saveTrips(data) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save trips', e);
  }
}
