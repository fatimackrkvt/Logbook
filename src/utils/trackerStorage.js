import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@logbook/trackers';

// shape: { trackers: [{id,name,icon,template,labels,archived}], entries: [...] }
export async function loadTrackers() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { trackers: [], entries: [] };
  } catch (e) {
    console.warn('Failed to load trackers', e);
    return { trackers: [], entries: [] };
  }
}

export async function saveTrackers(data) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save trackers', e);
  }
}
