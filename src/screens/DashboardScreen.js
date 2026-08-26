import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTrackers } from '../context/TrackerContext';

const FEATURES = [
  { key: 'todos', icon: '✅', title: 'To-Do List', subtitle: 'Daily tasks, habits & one-offs' },
  { key: 'phoneUsage', icon: '📱', title: 'Phone Usage', subtitle: 'Log and track screen time' },
  { key: 'trips', icon: '✈️', title: 'Trips', subtitle: 'Dates, cost, and type per trip' },
];

export default function DashboardScreen({ onSelectFeature, onOpenTrackers }) {
  const { trackers } = useTrackers();
  const activeCount = trackers.filter((t) => !t.archived).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.heading}>Logbook</Text>
      <Text style={styles.subheading}>What do you want to track?</Text>

      <View style={styles.cards}>
        {FEATURES.map((f) => (
          <TouchableOpacity key={f.key} style={styles.card} onPress={() => onSelectFeature(f.key)}>
            <Text style={styles.cardIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardSubtitle}>{f.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.card} onPress={onOpenTrackers}>
          <Text style={styles.cardIcon}>🗂</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Custom Trackers</Text>
            <Text style={styles.cardSubtitle}>
              {activeCount === 0 ? 'Books, habits, anything you define' : `${activeCount} tracker${activeCount === 1 ? '' : 's'}`}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
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
  heading: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 28 },
  subheading: { color: '#9CA3AF', fontSize: 14, marginTop: 4, marginBottom: 24 },
  cards: { gap: 12 },
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
  cardSubtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  chevron: { color: '#6B7280', fontSize: 22 },
});
