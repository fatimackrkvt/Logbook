import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTodos } from '../context/TodoContext';
import { isDueOn, todayStr } from '../utils/recurrence';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';

export default function HomeScreen({ onBack }) {
  const { todos, loaded } = useTodos();
  const [modalVisible, setModalVisible] = useState(false);
  const today = todayStr();

  const todaysTodos = useMemo(
    () => todos.filter((t) => t.type === 'once' && isDueOn(t, today)),
    [todos, today]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>‹ Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Today</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {!loaded ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : todaysTodos.length === 0 ? (
        <Text style={styles.empty}>Nothing on the agenda today. Add something below.</Text>
      ) : (
        <FlatList
          data={todaysTodos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TodoItem todo={item} />}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTodoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: { marginTop: 24, marginBottom: 4 },
  backLink: { color: '#818CF8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800' },
  date: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 60, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },
});
