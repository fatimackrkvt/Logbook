import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTrackers } from '../context/TrackerContext';
import { todayStr } from '../utils/recurrence';

export default function AddTrackerEntryModal({ visible, tracker, onClose }) {
  const { addEntry } = useTrackers();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [date, setDate] = useState(todayStr());
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [timeA, setTimeA] = useState('');
  const [timeB, setTimeB] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setStartDate(todayStr());
      setEndDate(todayStr());
      setDate(todayStr());
      setHours('');
      setMinutes('');
      setTimeA('');
      setTimeB('');
      setNote('');
    }
  }, [visible]);

  if (!tracker) return null;

  function handleSave() {
    if (tracker.template === 'range') {
      if (!title.trim() || !startDate || !endDate) return;
      addEntry(tracker.id, { title: title.trim(), startDate, endDate, note });
    } else if (tracker.template === 'event') {
      const totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
      if (!date || totalMinutes <= 0) return;
      addEntry(tracker.id, { date, minutes: totalMinutes, note });
    } else if (tracker.template === 'dailyTwoTime') {
      if (!date || !timeA || !timeB) return;
      addEntry(tracker.id, { date, timeA, timeB, note });
    }
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.heading}>{tracker.icon} New {tracker.name} entry</Text>

            {tracker.template === 'range' && (
              <>
                <Text style={styles.label}>Title</Text>
                <TextInput style={styles.input} placeholder="e.g. Project Hail Mary" placeholderTextColor="#9CA3AF" value={title} onChangeText={setTitle} />
                <Text style={styles.label}>Start date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholderTextColor="#9CA3AF" />
                <Text style={styles.label}>End date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholderTextColor="#9CA3AF" />
              </>
            )}

            {tracker.template === 'event' && (
              <>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={date} onChangeText={setDate} placeholderTextColor="#9CA3AF" />
                <Text style={styles.label}>Duration</Text>
                <View style={styles.timeRow}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Hours" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={hours} onChangeText={setHours} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="Minutes" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={minutes} onChangeText={setMinutes} />
                </View>
              </>
            )}

            {tracker.template === 'dailyTwoTime' && (
              <>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={date} onChangeText={setDate} placeholderTextColor="#9CA3AF" />
                <Text style={styles.label}>{tracker.labels?.timeA || 'Start'} (HH:MM, 24h)</Text>
                <TextInput style={styles.input} placeholder="23:30" placeholderTextColor="#9CA3AF" value={timeA} onChangeText={setTimeA} />
                <Text style={styles.label}>{tracker.labels?.timeB || 'End'} (HH:MM, 24h)</Text>
                <TextInput style={styles.input} placeholder="07:00" placeholderTextColor="#9CA3AF" value={timeB} onChangeText={setTimeB} />
              </>
            )}

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
              placeholder="Any details…"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              multiline
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '88%' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { color: '#9CA3AF', marginTop: 14, marginBottom: 8, fontSize: 13 },
  input: { backgroundColor: '#374151', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15 },
  timeRow: { flexDirection: 'row', gap: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
