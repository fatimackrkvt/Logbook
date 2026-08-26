import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTrips } from '../context/TripContext';
import { TRIP_TYPES, daySpan, costPerDay, formatCost } from '../utils/tripHelpers';

export default function TripStatsModal({ visible, onClose }) {
  const { trips } = useTrips();
  const [filter, setFilter] = useState('all'); // 'all' | 'local' | 'domestic' | 'abroad'

  const filtered = useMemo(
    () => (filter === 'all' ? trips : trips.filter((t) => t.type === filter)),
    [trips, filter]
  );

  const summary = useMemo(() => {
    const count = filtered.length;
    const totalCost = filtered.reduce((sum, t) => sum + (t.cost || 0), 0);
    const totalDays = filtered.reduce((sum, t) => sum + daySpan(t.startDate, t.endDate), 0);
    const avgPerDay = totalDays > 0 ? totalCost / totalDays : 0;
    return { count, totalCost, totalDays, avgPerDay };
  }, [filtered]);

  const byType = useMemo(() => {
    return Object.keys(TRIP_TYPES).map((key) => {
      const list = trips.filter((t) => t.type === key);
      const totalCost = list.reduce((sum, t) => sum + (t.cost || 0), 0);
      const totalDays = list.reduce((sum, t) => sum + daySpan(t.startDate, t.endDate), 0);
      return { key, label: TRIP_TYPES[key].label, count: list.length, totalCost, avgPerDay: totalDays > 0 ? totalCost / totalDays : 0 };
    });
  }, [trips]);

  const topByCost = useMemo(
    () => [...filtered].filter((t) => t.cost > 0).sort((a, b) => b.cost - a.cost).slice(0, 5),
    [filtered]
  );
  const topByPerDay = useMemo(
    () =>
      [...filtered]
        .filter((t) => t.cost > 0)
        .map((t) => ({ ...t, perDay: costPerDay(t.cost, t.startDate, t.endDate) }))
        .sort((a, b) => b.perDay - a.perDay)
        .slice(0, 5),
    [filtered]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Trip Stats</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeX}>✕</Text></TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.chip, filter === 'all' && styles.chipActive]} onPress={() => setFilter('all')}>
              <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>All</Text>
            </TouchableOpacity>
            {Object.entries(TRIP_TYPES).map(([key, meta]) => (
              <TouchableOpacity key={key} style={[styles.chip, filter === key && styles.chipActive]} onPress={() => setFilter(key)}>
                <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>{meta.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>{summary.count}</Text>
                <Text style={styles.summaryLabel}>Trips</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>{formatCost(summary.totalCost, '')}</Text>
                <Text style={styles.summaryLabel}>Total spent</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryValue}>{formatCost(summary.avgPerDay, '')}</Text>
                <Text style={styles.summaryLabel}>Avg / day</Text>
              </View>
            </View>

            {filter === 'all' && (
              <>
                <Text style={styles.sectionLabel}>By type</Text>
                {byType.map((t) => (
                  <View key={t.key} style={styles.typeRow}>
                    <Text style={styles.typeName}>{t.label}</Text>
                    <Text style={styles.typeStats}>
                      {t.count} trip{t.count === 1 ? '' : 's'} · {formatCost(t.totalCost, '')} · {formatCost(t.avgPerDay, '')}/day
                    </Text>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionLabel}>Most expensive (total)</Text>
            {topByCost.length === 0 ? (
              <Text style={styles.emptySmall}>No cost data yet.</Text>
            ) : (
              topByCost.map((t) => (
                <View key={t.id} style={styles.rankRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rankTitle}>{t.title}</Text>
                    <Text style={styles.rankSubtitle}>{t.startDate} · {TRIP_TYPES[t.type]?.label}</Text>
                  </View>
                  <Text style={styles.rankValue}>{formatCost(t.cost, t.currency)}</Text>
                </View>
              ))
            )}

            <Text style={styles.sectionLabel}>Most expensive (per day)</Text>
            {topByPerDay.length === 0 ? (
              <Text style={styles.emptySmall}>No cost data yet.</Text>
            ) : (
              topByPerDay.map((t) => (
                <View key={t.id} style={styles.rankRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rankTitle}>{t.title}</Text>
                    <Text style={styles.rankSubtitle}>{t.startDate} · {TRIP_TYPES[t.type]?.label}</Text>
                  </View>
                  <Text style={styles.rankValue}>{formatCost(t.perDay, t.currency)}/day</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '85%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700' },
  closeX: { color: '#9CA3AF', fontSize: 16, padding: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#1F2937' },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryBox: { flex: 1, backgroundColor: '#1F2937', borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  summaryLabel: { color: '#9CA3AF', fontSize: 11, marginTop: 3 },
  sectionLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  emptySmall: { color: '#6B7280', fontSize: 12 },
  typeRow: { paddingVertical: 6, borderBottomColor: '#1F2937', borderBottomWidth: 1 },
  typeName: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  typeStats: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomColor: '#1F2937', borderBottomWidth: 1 },
  rankTitle: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  rankSubtitle: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  rankValue: { color: '#22C55E', fontSize: 13, fontWeight: '700', marginLeft: 8 },
});
