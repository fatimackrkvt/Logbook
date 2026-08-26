import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePhoneUsage } from '../context/PhoneUsageContext';
import { weeklySummaries, formatDuration } from '../utils/phoneUsageAggregate';

const BAR_COLOR = '#6366F1';
const BAR_COLOR_SELECTED = '#818CF8';
const BAR_TRACK = '#374151';
const CAT_COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EC4899', '#38BDF8', '#A78BFA'];

export default function PhoneUsageStatsModal({ visible, onClose }) {
  const { categories, entries } = usePhoneUsage();
  const [selectedWeek, setSelectedWeek] = useState(null);

  const weeks = useMemo(() => weeklySummaries(entries, categories), [entries, categories]);
  const maxWeekMinutes = Math.max(1, ...weeks.map((w) => w.totalMinutes));

  const selected = weeks.find((w) => w.weekStart === selectedWeek);
  const maxCatMinutes = selected ? Math.max(1, ...selected.byCategory.map((c) => c.minutes)) : 1;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Statistics</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          {weeks.length === 0 ? (
            <Text style={styles.empty}>No usage logged yet — nothing to show.</Text>
          ) : (
            <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.sectionLabel}>Weekly total — tap a week for details</Text>
              {weeks.map((w) => {
                const pct = Math.max(4, (w.totalMinutes / maxWeekMinutes) * 100);
                const isSelected = selectedWeek === w.weekStart;
                return (
                  <TouchableOpacity
                    key={w.weekStart}
                    style={styles.barRow}
                    onPress={() => setSelectedWeek(isSelected ? null : w.weekStart)}
                  >
                    <Text style={[styles.weekLabel, isSelected && styles.weekLabelActive]}>{w.weekStart}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct}%`, backgroundColor: isSelected ? BAR_COLOR_SELECTED : BAR_COLOR },
                        ]}
                      />
                    </View>
                    <Text style={styles.totalText}>{formatDuration(w.totalMinutes)}</Text>
                  </TouchableOpacity>
                );
              })}

              {selected && (
                <View style={styles.detailBlock}>
                  <Text style={styles.sectionLabel}>Week of {selected.weekStart} · by category</Text>
                  {selected.byCategory.map((c, i) => {
                    const pct = Math.max(4, (c.minutes / maxCatMinutes) * 100);
                    return (
                      <View key={c.categoryId} style={styles.barRow}>
                        <Text style={styles.catLabel} numberOfLines={1}>{c.name}</Text>
                        <View style={styles.barTrack}>
                          <View
                            style={[styles.barFill, { width: `${pct}%`, backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }]}
                          />
                        </View>
                        <Text style={styles.totalText}>{formatDuration(c.minutes)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          )}
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
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 60 },
  sectionLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  weekLabel: { color: '#9CA3AF', fontSize: 12, width: 78 },
  weekLabelActive: { color: '#818CF8', fontWeight: '700' },
  catLabel: { color: '#9CA3AF', fontSize: 12, width: 78 },
  barTrack: { flex: 1, height: 16, backgroundColor: '#1F2937', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },
  totalText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600', width: 56, textAlign: 'right' },
  detailBlock: { marginTop: 20, paddingTop: 16, borderTopColor: '#1F2937', borderTopWidth: 1 },
});
