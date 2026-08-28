import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function NoteModal({ visible, initialText, initialDuration, onSave, onSkip }) {
  const [text, setText] = useState(initialText || '');
  const [duration, setDuration] = useState(initialDuration ? String(initialDuration) : '');

  useEffect(() => {
    setText(initialText || '');
    setDuration(initialDuration ? String(initialDuration) : '');
  }, [initialText, initialDuration, visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.heading}>Add a note (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. read chapter 3, felt slow this morning"
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />
          <Text style={styles.label}>Duration in minutes (optional)</Text>
          <TextInput
            style={styles.durationInput}
            placeholder="e.g. 30"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => onSkip()}>
              <Text style={styles.skipText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(text, parseInt(duration, 10) || 0)}>
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
  heading: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  label: { color: '#9CA3AF', fontSize: 12, marginTop: 12, marginBottom: 6 },
  durationInput: { backgroundColor: '#374151', color: '#fff', borderRadius: 10, padding: 10, fontSize: 14, width: 100 },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  skipText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
