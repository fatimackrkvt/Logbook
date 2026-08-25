import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@logbook/phone_usage';

// shape: { categories: [{id,name,archived}], entries: [{id,date,categoryId,minutes,note}] }
export async function loadPhoneUsage() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { categories: [], entries: [] };
  } catch (e) {
    console.warn('Failed to load phone usage data', e);
    return { categories: [], entries: [] };
  }
}

export async function savePhoneUsage(data) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save phone usage data', e);
  }
}
