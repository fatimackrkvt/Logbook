import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTrackers } from '../context/TrackerContext';
import { TEMPLATES } from '../utils/trackerHelpers';

const ICON_OPTIONS = ['📌', '📚', '🧹', '😴', '🏃', '💧', '🎯', '💰', '🌱', '🎸'];

export default function CreateTrackerModal({ visible, onClose, onCreated }) {
  const { addTracker } = useTrackers();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [template, setTemplate] = useState(null);
  const [labelA, setLabelA] = useState('');
  const [labelB, setLabelB] = useState('');

  function reset() {
    setName('');
    setIcon('📌');
    setTemplate(null);
    setLabelA('');
    setLabelB('');
  }

  function handleSave() {
    if (!name.trim() || !template) return;
    const labels =
      template === 'dailyTwoTime'
        ? { timeA: labelA.trim() || 'Start', timeB: labelB.trim() || 'End' }
        : {};
    const tracker = addTracker({ name, icon, template, labels });
    reset();
    onClose();
    onCreated?.(tracker);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.heading}>New tracker</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Books, House Cleaning, Sleep"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Icon</Text>
            <View style={styles.row}>
              {ICON_OPTIONS.map((i) => (
                <TouchableOpacity key={i} style={[styles.iconChip, icon === i && styles.chipActive]} onPress={() => setIcon(i)}>
                  <Text style={styles.iconText}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>What shape of data is this?</Text>
            {Object.entries(TEMPLATES).map(([key, meta]) => (
              <TouchableOpacity
                key={key}
                style={[styles.templateCard, template === key && styles.templateCardActive]}
                onPress={() => setTemplate(key)}
              >
                <Text style={styles.templateLabel}>{meta.label}</Text>
                <Text style={styles.templateDesc}>{meta.description}</Text>
              </TouchableOpacity>
            ))}

            {template === 'dailyTwoTime' && (
              <>
                <Text style={styles.label}>What are the two times called?</Text>
                <View style={styles.timeLabelRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="e.g. Bedtime"
                    placeholderTextColor="#9CA3AF"
                    value={labelA}
                    onChangeText={setLabelA}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="e.g. Wake time"
                    placeholderTextColor="#9CA3AF"
                    value={labelB}
                    onChangeText={setLabelB}
                  />
                </View>
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onClose(); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!name.trim() || !template) && { opacity: 0.4 }]}
                disabled={!name.trim() || !template}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Create</Text>
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
  input: { backgroundColor: '#374151', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconChip: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: '#6366F1' },
  iconText: { fontSize: 20 },
  templateCard: { backgroundColor: '#374151', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent' },
  templateCardActive: { borderColor: '#6366F1', backgroundColor: '#312E81' },
  templateLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  templateDesc: { color: '#9CA3AF', fontSize: 12, marginTop: 3 },
  timeLabelRow: { flexDirection: 'row', gap: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
