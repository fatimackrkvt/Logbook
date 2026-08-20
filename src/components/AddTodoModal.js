import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WEEKDAY_LABELS } from '../utils/recurrence';
import { useTodos } from '../context/TodoContext';

const TYPES = [
  { key: 'once', label: 'One-time' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly (pick days)' },
  { key: 'interval', label: 'Every N days' },
  { key: 'frequency', label: 'X times per week/month' },
];

export default function AddTodoModal({ visible, onClose }) {
  const { addTodo } = useTodos();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('once');
  const [dueDate, setDueDate] = useState(''); // YYYY-MM-DD
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [intervalDays, setIntervalDays] = useState('2');
  const [frequencyCount, setFrequencyCount] = useState('3');
  const [frequencyPeriod, setFrequencyPeriod] = useState('week');

  function reset() {
    setTitle('');
    setType('once');
    setDueDate('');
    setDaysOfWeek([]);
    setIntervalDays('2');
    setFrequencyCount('3');
    setFrequencyPeriod('week');
  }

  function toggleDay(d) {
    setDaysOfWeek((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function handleSave() {
    if (!title.trim()) return;
    addTodo({
      title,
      type,
      dueDate: type === 'once' ? dueDate : null,
      daysOfWeek: type === 'weekly' ? daysOfWeek : null,
      intervalDays: type === 'interval' ? parseInt(intervalDays, 10) || 1 : null,
      frequencyCount: type === 'frequency' ? parseInt(frequencyCount, 10) || 1 : null,
      frequencyPeriod: type === 'frequency' ? frequencyPeriod : null,
    });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.heading}>New To-do</Text>

            <TextInput
              style={styles.input}
              placeholder="What do you need to do?"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Repeats</Text>
            <View style={styles.row}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, type === t.key && styles.chipActive]}
                  onPress={() => setType(t.key)}
                >
                  <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {type === 'once' && (
              <>
                <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-08-25"
                  placeholderTextColor="#9CA3AF"
                  value={dueDate}
                  onChangeText={setDueDate}
                />
              </>
            )}

            {type === 'weekly' && (
              <>
                <Text style={styles.label}>Which days?</Text>
                <View style={styles.row}>
                  {WEEKDAY_LABELS.map((label, idx) => (
                    <TouchableOpacity
                      key={label}
                      style={[styles.chip, daysOfWeek.includes(idx) && styles.chipActive]}
                      onPress={() => toggleDay(idx)}
                    >
                      <Text style={[styles.chipText, daysOfWeek.includes(idx) && styles.chipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {type === 'interval' && (
              <>
                <Text style={styles.label}>Every how many days?</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={intervalDays}
                  onChangeText={setIntervalDays}
                />
              </>
            )}

            {type === 'frequency' && (
              <>
                <Text style={styles.label}>How many times</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={frequencyCount}
                  onChangeText={setFrequencyCount}
                />
                <Text style={styles.label}>Per</Text>
                <View style={styles.row}>
                  {['week', 'month'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.chip, frequencyPeriod === p && styles.chipActive]}
                      onPress={() => setFrequencyPeriod(p)}
                    >
                      <Text style={[styles.chipText, frequencyPeriod === p && styles.chipTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
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
  sheet: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  heading: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { color: '#9CA3AF', marginTop: 14, marginBottom: 8, fontSize: 13 },
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
