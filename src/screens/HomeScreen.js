import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTodos } from '../context/TodoContext';
import { isDueOn, todayStr, TYPE_LABELS } from '../utils/recurrence';
import TodoItem from '../components/TodoItem';
import AddTodoModal from '../components/AddTodoModal';
import OverviewScreen from './OverviewScreen';

export default function HomeScreen({ onBack }) {
  const { todos, loaded } = useTodos();
  const [modalVisible, setModalVisible] = useState(false);
  const [overviewVisible, setOverviewVisible] = useState(false);
  const today = todayStr();

  const sections = useMemo(() => {
    const todaysTodos = todos.filter((t) => isDueOn(t, today));
    const groups = {};
    todaysTodos.forEach((t) => {
      const label = TYPE_LABELS[t.type] || t.type;
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });
    const order = Object.values(TYPE_LABELS);
    return order
      .filter((label) => groups[label])
      .map((label) => ({ title: label, data: groups[label] }));
  }, [todos, today]);

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
      <TouchableOpacity style={styles.overviewBtn} onPress={() => setOverviewVisible(true)}>
        <Text style={styles.overviewBtnText}>📊 Log</Text>
      </TouchableOpacity>

      {!loaded ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : sections.length === 0 ? (
        <Text style={styles.empty}>Nothing on the agenda today. Add something below.</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TodoItem todo={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          stickySectionHeadersEnabled={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTodoModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <OverviewScreen visible={overviewVisible} onClose={() => setOverviewVisible(false)} />
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
  header: {
    marginTop: 24,
    marginBottom: 4,
  },
  backLink: { color: '#818CF8', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800' },
  date: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  overviewBtn: { backgroundColor: '#1F2937', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 16 },
  overviewBtnText: { color: '#818CF8', fontWeight: '600', fontSize: 13 },
  sectionHeader: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
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
