import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const STATUS_META = {
  done: { symbol: '✓', color: '#22C55E', label: 'Done' },
  missed: { symbol: '✕', color: '#EF4444', label: 'Missed' },
  skipped: { symbol: '–', color: '#9CA3AF', label: 'Skipped' },
};

export default function DayEntryModal({ visible, date, initialStatus, initialNote, onSave, onClear, onCancel }) {
  const [status, setStatus] = useState(initialStatus || null);
  const [note, setNote] = useState(initialNote || '');

  useEffect(() => {
    setStatus(initialStatus || null);
    setNote(initialNote || '');
  }, [date, initialStatus, initialNote, visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.heading}>{date}</Text>

          <View style={styles.statusRow}>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.statusBtn,
                  { borderColor: meta.color },
                  status === key && { backgroundColor: meta.color },
                ]}
                onPress={() => setStatus(key)}
              >
                <Text style={{ color: status === key ? '#fff' : meta.color, fontWeight: '700' }}>
                  {meta.symbol} {meta.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Note (optional)"
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View style={styles.actions}>
            {initialStatus && (
              <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
                <Text style={styles.clearText}>Clear entry</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !status && { opacity: 0.4 }]}
              disabled={!status}
              onPress={() => onSave(status, note)}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#1F2937', borderRadius: 16, padding: 20 },
  heading: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statusRow: { flexDirection: 'column', gap: 8, marginBottom: 14 },
  statusBtn: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  input: {
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10, flexWrap: 'wrap' },
  clearBtn: { paddingVertical: 10, paddingHorizontal: 12, marginRight: 'auto' },
  clearText: { color: '#EF4444', fontSize: 14 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
