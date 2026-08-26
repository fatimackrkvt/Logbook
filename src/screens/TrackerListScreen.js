import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTrackers } from '../context/TrackerContext';
import CreateTrackerModal from '../components/CreateTrackerModal';
import ManageTrackersModal from '../components/ManageTrackersModal';

export default function TrackerListScreen({ onBack, onSelectTracker }) {
  const { trackers } = useTrackers();
  const [createVisible, setCreateVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);

  const activeTrackers = trackers.filter((t) => !t.archived);
  const archivedCount = trackers.length - activeTrackers.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>‹ Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>🗂 Custom Trackers</Text>
      </View>

      <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.cards}>
          {activeTrackers.length === 0 && (
            <Text style={styles.empty}>No trackers yet — create your first one below.</Text>
          )}
          {activeTrackers.map((t) => (
            <TouchableOpacity key={t.id} style={styles.card} onPress={() => onSelectTracker(t.id)}>
              <Text style={styles.cardIcon}>{t.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t.name}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.newCard} onPress={() => setCreateVisible(true)}>
            <Text style={styles.newCardText}>+ New tracker</Text>
          </TouchableOpacity>
        </View>

        {archivedCount > 0 && (
          <TouchableOpacity onPress={() => setManageVisible(true)}>
            <Text style={styles.archivedLink}>{archivedCount} archived tracker{archivedCount === 1 ? '' : 's'} — manage</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CreateTrackerModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={(tracker) => onSelectTracker(tracker.id)}
      />
      <ManageTrackersModal visible={manageVisible} onClose={() => setManageVisible(false)} />
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
  cards: { gap: 12 },
  empty: { color: '#9CA3AF', fontSize: 14, marginBottom: 4 },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chevron: { color: '#6B7280', fontSize: 22 },
  newCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#374151',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  newCardText: { color: '#818CF8', fontWeight: '700', fontSize: 15 },
  archivedLink: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 16, textDecorationLine: 'underline' },
});
