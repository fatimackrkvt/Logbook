import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePhoneUsage } from '../context/PhoneUsageContext';
import { todayStr, weekStart } from '../utils/recurrence';

export default function AddUsageEntryModal({ visible, onClose, onManageCategories }) {
  const { categories, getOrCreateCategory, getOrCreateSubcategory, addEntry } = usePhoneUsage();

  const [mode, setMode] = useState('daily'); // 'daily' | 'weekly'
  const [date, setDate] = useState(todayStr());
  const [categoryId, setCategoryId] = useState(null);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [entryStyle, setEntryStyle] = useState('total'); // 'total' | 'details'
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [subMinutes, setSubMinutes] = useState({}); // { subcategoryId: minutesString }
  const [newSubText, setNewSubText] = useState('');
  const [note, setNote] = useState('');

  const active = categories.filter((c) => !c.archived);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const activeSubs = (selectedCategory?.subcategories || []).filter((s) => !s.archived);

  useEffect(() => {
    if (visible) {
      setMode('daily');
      setDate(todayStr());
      setCategoryId(active[0]?.id || null);
      setNewCategoryText('');
      setEntryStyle('total');
      setHours('');
      setMinutes('');
      setSubMinutes({});
      setNewSubText('');
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

  function handleAddSub() {
    if (!newSubText.trim() || !categoryId) return;
    getOrCreateSubcategory(categoryId, newSubText);
    setNewSubText('');
  }

  const breakdownTotal = useMemo(
    () => Object.values(subMinutes).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0),
    [subMinutes]
  );

  function handleSave() {
    if (!categoryId) return;

    let totalMinutes;
    let breakdown = null;

    if (entryStyle === 'details') {
      breakdown = Object.entries(subMinutes)
        .map(([subcategoryId, v]) => ({ subcategoryId, minutes: parseInt(v, 10) || 0 }))
        .filter((b) => b.minutes > 0);
      totalMinutes = breakdownTotal;
    } else {
      totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);
    }

    if (totalMinutes <= 0) return;

    addEntry({
      mode,
      date: mode === 'daily' ? date : null,
      weekStart: mode === 'weekly' ? weekStart(date) : null,
      categoryId,
      breakdown,
      minutes: totalMinutes,
      note,
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.heading}>Log phone usage</Text>

            <Text style={styles.label}>Log as</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.chip, mode === 'daily' && styles.chipActive]} onPress={() => setMode('daily')}>
                <Text style={[styles.chipText, mode === 'daily' && styles.chipTextActive]}>A specific day</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, mode === 'weekly' && styles.chipActive]} onPress={() => setMode('weekly')}>
                <Text style={[styles.chipText, mode === 'weekly' && styles.chipTextActive]}>Whole week total</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{mode === 'daily' ? 'Date (YYYY-MM-DD)' : 'Any date in that week (YYYY-MM-DD)'}</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-08-21" placeholderTextColor="#9CA3AF" />
            {mode === 'weekly' && <Text style={styles.hint}>Will be logged under the week of {weekStart(date)}</Text>}

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
              <Text style={styles.manageLink}>Manage categories & subcategories</Text>
            </TouchableOpacity>

            <Text style={styles.label}>How do you want to enter time?</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.chip, entryStyle === 'total' && styles.chipActive]} onPress={() => setEntryStyle('total')}>
                <Text style={[styles.chipText, entryStyle === 'total' && styles.chipTextActive]}>Just a total</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, entryStyle === 'details' && styles.chipActive]} onPress={() => setEntryStyle('details')}>
                <Text style={[styles.chipText, entryStyle === 'details' && styles.chipTextActive]}>Break down by subcategory</Text>
              </TouchableOpacity>
            </View>

            {entryStyle === 'total' ? (
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
            ) : (
              <View>
                {activeSubs.length === 0 && (
                  <Text style={styles.hint}>No subcategories yet for {selectedCategory?.name || 'this category'} — add one below.</Text>
                )}
                {activeSubs.map((s) => (
                  <View key={s.id} style={styles.subRow}>
                    <Text style={styles.subName}>{s.name}</Text>
                    <TextInput
                      style={[styles.input, { width: 70 }]}
                      placeholder="min"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={subMinutes[s.id] || ''}
                      onChangeText={(v) => setSubMinutes((prev) => ({ ...prev, [s.id]: v }))}
                    />
                  </View>
                ))}
                <View style={styles.newCategoryRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Add a subcategory…"
                    placeholderTextColor="#9CA3AF"
                    value={newSubText}
                    onChangeText={setNewSubText}
                    onSubmitEditing={handleAddSub}
                  />
                  <TouchableOpacity style={styles.smallBtn} onPress={handleAddSub}>
                    <Text style={styles.smallBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.totalHint}>Total: {breakdownTotal} min</Text>
              </View>
            )}

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
  hint: { color: '#6B7280', fontSize: 11, marginTop: 6 },
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
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  subName: { color: '#E5E7EB', fontSize: 14 },
  totalHint: { color: '#818CF8', fontSize: 13, fontWeight: '600', marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
