import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePhoneUsage } from '../context/PhoneUsageContext';

export default function ManageCategoriesModal({ visible, onClose }) {
  const {
    categories,
    getOrCreateCategory,
    getOrCreateSubcategory,
    archiveCategory,
    unarchiveCategory,
    archiveSubcategory,
    unarchiveSubcategory,
  } = usePhoneUsage();

  const [text, setText] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [subText, setSubText] = useState('');

  const active = categories.filter((c) => !c.archived);
  const archived = categories.filter((c) => c.archived);

  function handleAdd() {
    if (text.trim()) {
      getOrCreateCategory(text);
      setText('');
    }
  }

  function handleAddSub(categoryId) {
    if (subText.trim()) {
      getOrCreateSubcategory(categoryId, subText);
      setSubText('');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Categories</Text>

          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="New category name…"
              placeholderTextColor="#9CA3AF"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>Active</Text>
            {active.length === 0 && <Text style={styles.emptySmall}>No categories yet — add one above.</Text>}
            {active.map((c) => {
              const expanded = expandedId === c.id;
              const activeSubs = (c.subcategories || []).filter((s) => !s.archived);
              const archivedSubs = (c.subcategories || []).filter((s) => s.archived);
              return (
                <View key={c.id} style={styles.catBlock}>
                  <View style={styles.row}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setExpandedId(expanded ? null : c.id)}>
                      <Text style={styles.catName}>
                        {expanded ? '▾' : '▸'} {c.name}
                        {activeSubs.length > 0 ? `  (${activeSubs.length} sub)` : ''}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => archiveCategory(c.id)}>
                      <Text style={styles.archiveLink}>Archive</Text>
                    </TouchableOpacity>
                  </View>

                  {expanded && (
                    <View style={styles.subBlock}>
                      {activeSubs.map((s) => (
                        <View key={s.id} style={styles.subRow}>
                          <Text style={styles.subName}>{s.name}</Text>
                          <TouchableOpacity onPress={() => archiveSubcategory(c.id, s.id)}>
                            <Text style={styles.archiveLink}>Archive</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {activeSubs.length === 0 && <Text style={styles.emptySmall}>No subcategories yet.</Text>}

                      {archivedSubs.length > 0 && (
                        <>
                          <Text style={styles.subArchivedLabel}>Archived subcategories</Text>
                          {archivedSubs.map((s) => (
                            <View key={s.id} style={styles.subRow}>
                              <Text style={[styles.subName, { color: '#6B7280' }]}>{s.name}</Text>
                              <TouchableOpacity onPress={() => unarchiveSubcategory(c.id, s.id)}>
                                <Text style={styles.restoreLink}>Restore</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </>
                      )}

                      <View style={styles.addSubRow}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Add a subcategory…"
                          placeholderTextColor="#9CA3AF"
                          value={subText}
                          onChangeText={setSubText}
                          onSubmitEditing={() => handleAddSub(c.id)}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={() => handleAddSub(c.id)}>
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {archived.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Archived categories</Text>
                <Text style={styles.hint}>Past entries keep their category name even when archived — archiving just hides it from the picker.</Text>
                {archived.map((c) => (
                  <View key={c.id} style={styles.row}>
                    <Text style={[styles.catName, { color: '#6B7280' }]}>{c.name}</Text>
                    <TouchableOpacity onPress={() => unarchiveCategory(c.id)}>
                      <Text style={styles.restoreLink}>Restore</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700' },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  input: { backgroundColor: '#374151', color: '#fff', borderRadius: 10, padding: 12, fontSize: 14 },
  addBtn: { backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  sectionLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  hint: { color: '#6B7280', fontSize: 11, marginTop: 4, marginBottom: 6 },
  emptySmall: { color: '#6B7280', fontSize: 13, marginTop: 4 },
  catBlock: { borderBottomColor: '#374151', borderBottomWidth: 1, paddingVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  catName: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
  archiveLink: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },
  restoreLink: { color: '#818CF8', fontSize: 13, fontWeight: '600' },
  subBlock: { paddingLeft: 16, paddingBottom: 8 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  subName: { color: '#D1D5DB', fontSize: 13 },
  subArchivedLabel: { color: '#6B7280', fontSize: 11, marginTop: 6, marginBottom: 2 },
  addSubRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  closeBtn: { marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  closeText: { color: '#818CF8', fontWeight: '700', fontSize: 15 },
});
