import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTrips } from '../context/TripContext';
import { TRIP_TYPES, daySpan, costPerDay, formatCost } from '../utils/tripHelpers';
import AddTripModal from '../components/AddTripModal';
import TripStatsModal from './TripStatsModal';

export default function TripsScreen({ onBack }) {
  const { trips, loaded, deleteTrip } = useTrips();
  const [addVisible, setAddVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  const sorted = useMemo(() => [...trips].sort((a, b) => (a.startDate < b.startDate ? 1 : -1)), [trips]);

  function handleDelete(trip) {
    Alert.alert('Delete this trip?', `"${trip.title}" will be removed. This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(trip.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backLink}>‹ Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>✈️ Trips</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setStatsVisible(true)}>
          <Text style={styles.actionBtnText}>📊 Stats</Text>
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : sorted.length === 0 ? (
        <Text style={styles.empty}>No trips logged yet. Tap + to add your first one.</Text>
      ) : (
        <ScrollView style={{ marginTop: 8 }} contentContainerStyle={{ paddingBottom: 100 }}>
          {sorted.map((t) => {
            const days = daySpan(t.startDate, t.endDate);
            const perDay = t.cost > 0 ? costPerDay(t.cost, t.startDate, t.endDate) : null;
            return (
              <View key={t.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{t.title}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{TRIP_TYPES[t.type]?.label || t.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.subtitle}>
                    {t.startDate} → {t.endDate}  ·  {days} day{days === 1 ? '' : 's'}
                  </Text>
                  {t.cost > 0 && (
                    <Text style={styles.cost}>
                      {formatCost(t.cost, t.currency)}{perDay != null ? `  ·  ${formatCost(perDay, t.currency)}/day` : ''}
                    </Text>
                  )}
                  {t.note ? <Text style={styles.note}>{t.note}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => handleDelete(t)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>🗑</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTripModal visible={addVisible} onClose={() => setAddVisible(false)} />
      <TripStatsModal visible={statsVisible} onClose={() => setStatsVisible(false)} />
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
  card: { backgroundColor: '#1F2937', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  title: { color: '#fff', fontSize: 15, fontWeight: '700' },
  typeBadge: { backgroundColor: '#374151', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeText: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  subtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  cost: { color: '#22C55E', fontSize: 13, fontWeight: '700', marginTop: 4 },
  note: { color: '#6B7280', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
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
