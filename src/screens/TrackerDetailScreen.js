import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTrackers } from '../context/TrackerContext';
import { formatDaySpan, minutesBetweenTimes } from '../utils/trackerHelpers';
import { formatDuration } from '../utils/phoneUsageAggregate';
import AddTrackerEntryModal from '../components/AddTrackerEntryModal';

export default function TrackerDetailScreen({ trackerId, onBack }) {
  const { trackers, entriesForTracker, deleteEntry, archiveTracker } = useTrackers();
  const [addVisible, setAddVisible] = useState(false);

  const tracker = trackers.find((t) => t.id === trackerId);

  const entries = useMemo(() => {
    if (!tracker) return [];
    const list = entriesForTracker(trackerId);
    if (tracker.template === 'range') return [...list].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [tracker, trackerId, entriesForTracker]);

  if (!tracker) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>‹ Trackers</Text></TouchableOpacity>
        <Text style={styles.empty}>This tracker no longer exists.</Text>
      </SafeAreaView>
    );
  }

  function handleDeleteEntry(entry) {
    Alert.alert('Delete this entry?', 'This can\'t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) },
    ]);
  }

  function handleArchiveTracker() {
    Alert.alert(
      `Archive "${tracker.name}"?`,
      'It will disappear from your dashboard, but nothing is deleted — you can restore it later from Manage Trackers.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => { archiveTracker(tracker.id); onBack(); } },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>‹ Trackers</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{tracker.icon} {tracker.name}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleArchiveTracker}>
          <Text style={styles.actionBtnText}>Archive tracker</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <Text style={styles.empty}>Nothing logged yet. Tap + to add your first entry.</Text>
      ) : (
        <ScrollView style={{ marginTop: 8 }} contentContainerStyle={{ paddingBottom: 100 }}>
          {entries.map((e) => (
            <View key={e.id} style={styles.entryRow}>
              <View style={{ flex: 1 }}>
                {tracker.template === 'range' && (
                  <>
                    <Text style={styles.entryTitle}>{e.title}</Text>
                    <Text style={styles.entrySubtitle}>
                      {e.startDate} → {e.endDate}{formatDaySpan(e.startDate, e.endDate) ? `  ·  ${formatDaySpan(e.startDate, e.endDate)}` : ''}
                    </Text>
                  </>
                )}
                {tracker.template === 'event' && (
                  <>
                    <Text style={styles.entryTitle}>{e.date}</Text>
                    <Text style={styles.entrySubtitle}>{formatDuration(e.minutes)}</Text>
                  </>
                )}
                {tracker.template === 'dailyTwoTime' && (
                  <>
                    <Text style={styles.entryTitle}>{e.date}</Text>
                    <Text style={styles.entrySubtitle}>
                      {tracker.labels?.timeA || 'Start'} {e.timeA} → {tracker.labels?.timeB || 'End'} {e.timeB}
                      {minutesBetweenTimes(e.timeA, e.timeB) != null ? `  ·  ${formatDuration(minutesBetweenTimes(e.timeA, e.timeB))}` : ''}
                    </Text>
                  </>
                )}
                {e.note ? <Text style={styles.entryNote}>{e.note}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleDeleteEntry(e)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTrackerEntryModal visible={addVisible} tracker={tracker} onClose={() => setAddVisible(false)} />
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
  actionBtnText: { color: '#F59E0B', fontWeight: '600', fontSize: 13 },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 60, fontSize: 14 },
  entryRow: { backgroundColor: '#1F2937', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' },
  entryTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  entrySubtitle: { color: '#818CF8', fontSize: 13, fontWeight: '600', marginTop: 3 },
  entryNote: { color: '#9CA3AF', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { padding: 6, marginLeft: 8 },
  deleteText: { fontSize: 16 },
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
