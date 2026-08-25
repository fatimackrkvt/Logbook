import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePhoneUsage } from '../context/PhoneUsageContext';
import AddUsageEntryModal from '../components/AddUsageEntryModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function PhoneUsageScreen({ onBack }) {
  const { categories, entries, loaded, deleteEntry } = usePhoneUsage();
  const [addVisible, setAddVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || 'Unknown';

  const sections = useMemo(() => {
    const byDate = {};
    entries.forEach((e) => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => (a < b ? 1 : -1)) // newest date first
      .map(([date, data]) => ({
        title: date,
        totalLabel: formatDuration(data.reduce((sum, e) => sum + e.minutes, 0)),
        data: data.sort((a, b) => b.minutes - a.minutes),
      }));
  }, [entries]);

  function handleDelete(entry) {
    Alert.alert(
      'Delete this entry?',
      `${categoryName(entry.categoryId)} · ${formatDuration(entry.minutes)} on ${entry.date}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>‹ Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Phone Usage</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setManageVisible(true)}>
          <Text style={styles.actionBtnText}>Categories</Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : sections.length === 0 ? (
        <Text style={styles.empty}>No usage logged yet. Tap + to add your first entry.</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionTotal}>{section.totalLabel}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.entryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryCategory}>{categoryName(item.categoryId)}</Text>
                <Text style={styles.entryDuration}>{formatDuration(item.minutes)}</Text>
                {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddUsageEntryModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onManageCategories={() => {
          setAddVisible(false);
          setManageVisible(true);
        }}
      />
      <ManageCategoriesModal visible={manageVisible} onClose={() => setManageVisible(false)} />
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
  heading: { color: '#fff', fontSize: 26, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', marginTop: 10, marginBottom: 6 },
  actionBtn: { backgroundColor: '#1F2937', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  actionBtnText: { color: '#818CF8', fontWeight: '600', fontSize: 13 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 60, fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 6 },
  sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '700' },
  sectionTotal: { color: '#818CF8', fontSize: 13, fontWeight: '700' },
  entryRow: { backgroundColor: '#1F2937', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { padding: 6, marginLeft: 8 },
  deleteText: { fontSize: 16 },
  entryCategory: { color: '#fff', fontSize: 15, fontWeight: '600' },
  entryDuration: { color: '#22C55E', fontSize: 13, fontWeight: '700', marginTop: 2 },
  entryNote: { color: '#9CA3AF', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
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
