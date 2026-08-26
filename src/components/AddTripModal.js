import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTrips } from '../context/TripContext';
import { todayStr } from '../utils/recurrence';
import { TRIP_TYPES, daySpan, costPerDay, formatCost } from '../utils/tripHelpers';

export default function AddTripModal({ visible, onClose }) {
  const { addTrip } = useTrips();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('local');
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setType('local');
      setStartDate(todayStr());
      setEndDate(todayStr());
      setCost('');
      setCurrency('');
      setNote('');
    }
  }, [visible]);

  const days = useMemo(() => daySpan(startDate, endDate), [startDate, endDate]);
  const perDay = useMemo(() => {
    const c = parseFloat(cost);
    return isNaN(c) ? null : costPerDay(c, startDate, endDate);
  }, [cost, startDate, endDate]);

  function handleSave() {
    if (!title.trim() || !startDate || !endDate) return;
    addTrip({
      title,
      type,
      startDate,
      endDate,
      cost: parseFloat(cost) || 0,
      currency: currency.trim(),
      note,
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.heading}>New trip</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Weekend in Antalya"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {Object.entries(TRIP_TYPES).map(([key, meta]) => (
                <TouchableOpacity key={key} style={[styles.chip, type === key && styles.chipActive]} onPress={() => setType(key)}>
                  <Text style={[styles.chipText, type === key && styles.chipTextActive]}>{meta.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Start date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholderTextColor="#9CA3AF" />
            <Text style={styles.label}>End date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholderTextColor="#9CA3AF" />
            <Text style={styles.hint}>{days} day{days === 1 ? '' : 's'}</Text>

            <Text style={styles.label}>Cost</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Total cost"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={cost}
                onChangeText={setCost}
              />
              <TextInput
                style={[styles.input, { width: 90 }]}
                placeholder="Currency"
                placeholderTextColor="#9CA3AF"
                value={currency}
                onChangeText={setCurrency}
              />
            </View>
            {perDay != null && (
              <Text style={styles.hint}>{formatCost(perDay, currency)} / day</Text>
            )}

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
              placeholder="Highlights, who you went with, etc."
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
  heading: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { color: '#9CA3AF', marginTop: 14, marginBottom: 8, fontSize: 13 },
  hint: { color: '#818CF8', fontSize: 12, marginTop: 6, fontWeight: '600' },
  input: { backgroundColor: '#374151', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#374151', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { color: '#D1D5DB', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
