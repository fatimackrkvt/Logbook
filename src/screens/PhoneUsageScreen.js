import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePhoneUsage } from '../context/PhoneUsageContext';
import { weeklySummaries, formatDuration } from '../utils/phoneUsageAggregate';
import AddUsageEntryModal from '../components/AddUsageEntryModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';

export default function PhoneUsageScreen({ onBack }) {
  const { categories, entries, loaded, deleteEntry } = usePhoneUsage();
  const [addVisible, setAddVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);

  const subcategoryName = (categoryId, subId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.subcategories?.find((s) => s.id === subId)?.name || 'Unknown';
  };

  const weeks = useMemo(() => weeklySummaries(entries, categories), [entries, categories]);

  function handleDelete(entry, categoryName) {
    Alert.alert(
      'Delete this entry?',
      `${categoryName} · ${formatDuration(entry.minutes)}`,
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
      ) : weeks.length === 0 ? (
        <Text style={styles.empty}>No usage logged yet. Tap + to add your first entry.</Text>
      ) : (
        <ScrollView style={{ marginTop: 8 }} contentContainerStyle={{ paddingBottom: 100 }}>
          {weeks.map((w) => {
            const expanded = expandedWeek === w.weekStart;
            return (
              <View key={w.weekStart} style={styles.weekBlock}>
                <TouchableOpacity style={styles.weekHeader} onPress={() => setExpandedWeek(expanded ? null : w.weekStart)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.weekTitle}>Week of {w.weekStart}</Text>
                    <Text style={styles.weekSubtitle}>
                      {w.byCategory.slice(0, 3).map((c) => `${c.name} ${formatDuration(c.minutes)}`).join(' · ')}
                      {w.byCategory.length > 3 ? '…' : ''}
                    </Text>
                  </View>
                  <Text style={styles.weekTotal}>{formatDuration(w.totalMinutes)}</Text>
                  <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
                </TouchableOpacity>

                {expanded && (
                  <View style={styles.weekBody}>
                    <Text style={styles.detailLabel}>By category</Text>
                    {w.byCategory.map((c) => (
                      <View key={c.categoryId} style={styles.catRow}>
                        <Text style={styles.catRowName}>{c.name}</Text>
                        <Text style={styles.catRowMinutes}>{formatDuration(c.minutes)}</Text>
                      </View>
                    ))}

                    <Text style={[styles.detailLabel, { marginTop: 14 }]}>Entries</Text>
                    {w.entries.map((e) => {
                      const catName = categories.find((c) => c.id === e.categoryId)?.name || 'Unknown';
                      return (
                        <View key={e.id} style={styles.entryRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.entryTitle}>
                              {catName}
                              {e.mode === 'daily' ? `  ·  ${e.date}` : '  ·  week total'}
                            </Text>
                            {e.breakdown && (
                              <Text style={styles.entryBreakdown}>
                                {e.breakdown
                                  .map((b) => `${subcategoryName(e.categoryId, b.subcategoryId)} ${formatDuration(b.minutes)}`)
                                  .join(', ')}
                              </Text>
                            )}
                            {e.note ? <Text style={styles.entryNote}>{e.note}</Text> : null}
                          </View>
                          <Text style={styles.entryMinutes}>{formatDuration(e.minutes)}</Text>
                          <TouchableOpacity onPress={() => handleDelete(e, catName)} style={styles.deleteBtn}>
                            <Text style={styles.deleteText}>🗑</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
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
  weekBlock: { marginBottom: 8 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 12, padding: 14, gap: 8 },
  weekTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  weekSubtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 3 },
  weekTotal: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
  chevron: { color: '#9CA3AF', fontSize: 14 },
  weekBody: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 },
  detailLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  catRowName: { color: '#D1D5DB', fontSize: 13 },
  catRowMinutes: { color: '#818CF8', fontSize: 13, fontWeight: '600' },
  entryRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderTopColor: '#374151', borderTopWidth: 1 },
  entryTitle: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  entryBreakdown: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  entryNote: { color: '#6B7280', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  entryMinutes: { color: '#22C55E', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  deleteBtn: { padding: 4, marginLeft: 8 },
  deleteText: { fontSize: 14 },
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
