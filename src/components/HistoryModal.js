import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTodos } from '../context/TodoContext';
import { todayStr, addDays } from '../utils/recurrence';
import { formatDuration } from '../utils/phoneUsageAggregate';
import DayEntryModal from './DayEntryModal';

const STATUS_META = {
  done: { symbol: '✓', color: '#22C55E', label: 'Done' },
  missed: { symbol: '✕', color: '#EF4444', label: 'Missed' },
  skipped: { symbol: '–', color: '#9CA3AF', label: 'Skipped' },
};

function pastDates(days) {
  const today = todayStr();
  const out = [];
  for (let i = 1; i <= days; i++) out.push(addDays(today, -i));
  return out; // yesterday first, going back
}

export default function HistoryModal({ visible, todo, onClose }) {
  const { setCompletion } = useTodos();
  const [editingDate, setEditingDate] = useState(null); // date string, or null when picker closed
  const [pickerOpen, setPickerOpen] = useState(false);

  const entries = useMemo(() => {
    if (!todo) return [];
    return Object.entries(todo.completions || {})
      .map(([date, status]) => ({ date, status, note: todo.notes?.[date], duration: todo.durations?.[date] }))
      .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
  }, [todo]);

  const totals = useMemo(() => {
    const t = { done: 0, missed: 0, skipped: 0 };
    entries.forEach((e) => { t[e.status] = (t[e.status] || 0) + 1; });
    return t;
  }, [entries]);

  if (!todo) return null;

  const last14Days = pastDates(14);

  function handleSaveDay(status, note, duration) {
    setCompletion(todo.id, editingDate, status, note, duration);
    setEditingDate(null);
  }

  function handleClearDay() {
    setCompletion(todo.id, editingDate, null);
    setEditingDate(null);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>{todo.title}</Text>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalItem, { color: STATUS_META.done.color }]}>{totals.done} done</Text>
            <Text style={[styles.totalItem, { color: STATUS_META.missed.color }]}>{totals.missed} missed</Text>
            <Text style={[styles.totalItem, { color: STATUS_META.skipped.color }]}>{totals.skipped} skipped</Text>
          </View>

          <TouchableOpacity style={styles.logPastBtn} onPress={() => setPickerOpen(true)}>
            <Text style={styles.logPastText}>+ Log a past day</Text>
          </TouchableOpacity>

          {entries.length === 0 ? (
            <Text style={styles.empty}>No log entries yet.</Text>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => {
                const meta = STATUS_META[item.status];
                return (
                  <TouchableOpacity style={styles.row} onPress={() => setEditingDate(item.date)}>
                    <View style={[styles.badge, { borderColor: meta.color }]}>
                      <Text style={{ color: meta.color, fontWeight: '700' }}>{meta.symbol}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.date}>{item.date} · {meta.label}</Text>
                      {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
                      {item.duration ? <Text style={styles.duration}>⏱ {formatDuration(item.duration)}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={{ marginTop: 8 }}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Picker: choose which of the last 14 days to log */}
      <Modal visible={pickerOpen} animationType="fade" transparent>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.heading}>Pick a day to log</Text>
            <FlatList
              data={last14Days}
              keyExtractor={(d) => d}
              style={{ marginTop: 8 }}
              renderItem={({ item: date }) => {
                const status = todo.completions[date];
                return (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => {
                      setPickerOpen(false);
                      setEditingDate(date);
                    }}
                  >
                    <Text style={styles.date}>
                      {date}{status ? `  ·  already logged (${STATUS_META[status].label})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setPickerOpen(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DayEntryModal
        visible={editingDate !== null}
        date={editingDate}
        initialStatus={editingDate ? todo.completions[editingDate] : null}
        initialNote={editingDate ? todo.notes?.[editingDate] : ''}
        initialDuration={editingDate ? todo.durations?.[editingDate] : null}
        onSave={handleSaveDay}
        onClear={handleClearDay}
        onCancel={() => setEditingDate(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700' },
  totalsRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  logPastBtn: { marginTop: 14, alignSelf: 'flex-start' },
  logPastText: { color: '#818CF8', fontWeight: '600', fontSize: 14 },
  totalItem: { fontSize: 13, fontWeight: '600' },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 30 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomColor: '#374151', borderBottomWidth: 1 },
  badge: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  date: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  note: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  duration: { color: '#818CF8', fontSize: 12, marginTop: 2, fontWeight: '600' },
  closeBtn: { marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  closeText: { color: '#818CF8', fontWeight: '700', fontSize: 15 },
});
