import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTodos } from '../context/TodoContext';

export default function AddTodoModal({ visible, onClose }) {
  const { addTodo } = useTodos();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(''); // YYYY-MM-DD

  function reset() {
    setTitle('');
    setDueDate('');
  }

  function handleSave() {
    if (!title.trim()) return;
    addTodo({
      title,
      type: 'once',
      dueDate,
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

            <Text style={styles.label}>Due date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-08-25"
              placeholderTextColor="#9CA3AF"
              value={dueDate}
              onChangeText={setDueDate}
            />

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
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
