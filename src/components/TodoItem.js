import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTodos } from '../context/TodoContext';
import { frequencyProgress, todayStr } from '../utils/recurrence';
import NoteModal from './NoteModal';
import HistoryModal from './HistoryModal';

const STATUS_META = {
  done: { symbol: '✓', color: '#22C55E' },
  missed: { symbol: '✕', color: '#EF4444' },
  skipped: { symbol: '–', color: '#9CA3AF' },
};

export default function TodoItem({ todo }) {
  const { setCompletion, deleteTodo } = useTodos();
  const today = todayStr();
  const currentStatus = todo.completions[today];
  const currentNote = todo.notes?.[today];

  // 'pendingStatus' is the status we're about to save once the note modal closes.
  // When null, the note modal is closed.
  const [pendingStatus, setPendingStatus] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);

  function cycleStatus(status) {
    if (currentStatus === status) {
      // tapping the same status again clears it
      setCompletion(todo.id, today, null);
      return;
    }
    // set it immediately, no interruption — note stays available as an opt-in tap below
    setCompletion(todo.id, today, status);
  }

  function handleNoteSave(text) {
    setCompletion(todo.id, today, pendingStatus, text);
    setPendingStatus(null);
  }

  function handleNoteSkip() {
    setCompletion(todo.id, today, pendingStatus, undefined);
    setPendingStatus(null);
  }

  function handleEditNote() {
    // re-open the note modal for today's already-set status, to edit the note only
    setPendingStatus(currentStatus);
  }

  function handleDelete() {
    Alert.alert(
      'Delete this to-do?',
      `"${todo.title}" and its full history will be removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(todo.id) },
      ]
    );
  }

  const subtitle = subtitleFor(todo);
  const progress = todo.type === 'frequency' ? frequencyProgress(todo, today) : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => setHistoryVisible(true)}>
        <Text style={styles.title}>{todo.title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {progress && (
          <Text style={styles.progress}>
            {progress.done}/{progress.target} this {todo.frequencyPeriod}
          </Text>
        )}
        {currentStatus && (
          <TouchableOpacity onPress={handleEditNote}>
            <Text style={styles.notePreview}>
              {currentNote ? `📝 ${currentNote}` : '+ add a note for today'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <View style={styles.statusRow}>
        {Object.entries(STATUS_META).map(([status, meta]) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusBtn,
              { borderColor: meta.color },
              currentStatus === status && { backgroundColor: meta.color },
            ]}
            onPress={() => cycleStatus(status)}
          >
            <Text style={[styles.statusSymbol, { color: currentStatus === status ? '#fff' : meta.color }]}>
              {meta.symbol}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>

      <NoteModal
        visible={pendingStatus !== null}
        initialText={currentNote}
        onSave={handleNoteSave}
        onSkip={handleNoteSkip}
      />
      <HistoryModal visible={historyVisible} todo={todo} onClose={() => setHistoryVisible(false)} />
    </View>
  );
}

function subtitleFor(todo) {
  switch (todo.type) {
    case 'once':
      return `Due ${todo.dueDate}`;
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Weekly';
    case 'interval':
      return `Every ${todo.intervalDays} days`;
    case 'frequency':
      return `${todo.frequencyCount}x per ${todo.frequencyPeriod}`;
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  progress: { color: '#818CF8', fontSize: 12, marginTop: 4, fontWeight: '600' },
  notePreview: { color: '#6B7280', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  statusSymbol: { fontSize: 15, fontWeight: '700' },
  deleteBtn: { marginLeft: 10, padding: 4 },
  deleteText: { fontSize: 16 },
});
