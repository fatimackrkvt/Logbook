import AsyncStorage from '@react-native-async-storage/async-storage';

const TODOS_KEY = '@todo_app/todos';

export async function loadTodos() {
  try {
    const raw = await AsyncStorage.getItem(TODOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load todos', e);
    return [];
  }
}

export async function saveTodos(todos) {
  try {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (e) {
    console.warn('Failed to save todos', e);
  }
}
