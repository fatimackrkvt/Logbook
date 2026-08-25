import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePhoneUsage } from '../context/PhoneUsageContext';
import { todayStr } from '../utils/recurrence';

export default function AddUsageEntryModal({ visible, onClose, onManageCategories }) {
  const { categories, getOrCreateCategory, addEntry } = usePhoneUsage();
  const [date, setDate] = useState(todayStr());
  const [categoryId, setCategoryId] = useState(null);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');

  const active = categories.filter((c) => !c.archived);

  useEffect(() => {
    if (visible) {
      setDate(todayStr());
      setCategoryId(active[0]?.id || null);
      setNewCategoryText('');
      setHours('');
      setMinutes('');
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function handleUseNewCategory() {
    if (!newCategoryText.trim()) return;
    const cat = getOrCreateCategory(newCategoryText);
    setCategoryId(cat.id);
    setNewCategoryText('');
  }

  function handleSave() {
    const totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
    if (!categoryId || totalMinutes <= 0) return;
    addEntry({ date, categoryId, minutes: totalMinutes, note });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.heading}>Log phone usage</Text>

            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-08-21" placeholderTextColor="#9CA3AF" />

            <Text style={styles.label}>Category</Text>
            <View style={styles.row}>
              {active.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, categoryId === c.id && styles.chipActive]}
                  onPress={() => setCategoryId(c.id)}
                >
                  <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.newCategoryRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Or add a new category…"
                placeholderTextColor="#9CA3AF"
                value={newCategoryText}
                onChangeText={setNewCategoryText}
                onSubmitEditing={handleUseNewCategory}
              />
              <TouchableOpacity style={styles.smallBtn} onPress={handleUseNewCategory}>
                <Text style={styles.smallBtnText}>Use</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onManageCategories}>
              <Text style={styles.manageLink}>Manage categories</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Time spent</Text>
            <View style={styles.timeRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Hours"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={hours}
                onChangeText={setHours}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minutes"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={minutes}
                onChangeText={setMinutes}
              />
            </View>

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
              placeholder="e.g. mostly scrolling before bed"
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
  input: { backgroundColor: '#374151', color: '#fff', borderRadius: 10, padding: 12, fontSize: 15 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#374151', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { color: '#D1D5DB', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  newCategoryRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  smallBtn: { backgroundColor: '#374151', paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  smallBtnText: { color: '#818CF8', fontWeight: '600' },
  manageLink: { color: '#6B7280', fontSize: 12, marginTop: 8, textDecorationLine: 'underline' },
  timeRow: { flexDirection: 'row', gap: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
