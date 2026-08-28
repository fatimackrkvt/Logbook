import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTodos } from '../context/TodoContext';
import { frequencyProgress, todayStr } from '../utils/recurrence';
import { formatDuration } from '../utils/phoneUsageAggregate';
import NoteModal from './NoteModal';
import HistoryModal from './HistoryModal';

const STATUS_META = {
  done: { symbol: '✓', color: '#22C55E' },
  missed: { symbol: '✕', color: '#EF4444' },
  skipped: { symbol: '–', color: '#9CA3AF' },
};

function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function TodoItem({ todo }) {
  const { setCompletion, deleteTodo, startTimer, stopTimer } = useTodos();
  const today = todayStr();
  const currentStatus = todo.completions[today];
  const currentNote = todo.notes?.[today];
  const currentDuration = todo.durations?.[today];
  const isTimerRunning = !!todo.activeTimerStartedAt;

  // 'pendingStatus' is the status we're about to save once the note modal closes.
  // When null, the note modal is closed.
  const [pendingStatus, setPendingStatus] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [tick, setTick] = useState(Date.now());

  // Only ticks while a timer is actually running on this item — purely for
  // the live display, the real duration is computed from wall-clock time on stop.
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const elapsedSeconds = isTimerRunning
    ? Math.max(0, Math.floor((tick - new Date(todo.activeTimerStartedAt).getTime()) / 1000))
    : 0;

  function cycleStatus(status) {
    if (currentStatus === status) {
      // tapping the same status again clears it
      setCompletion(todo.id, today, null);
      return;
    }
    // set it immediately, no interruption — note stays available as an opt-in tap below
    setCompletion(todo.id, today, status);
  }

  function handleNoteSave(text, duration) {
    setCompletion(todo.id, today, pendingStatus, text, duration);
    setPendingStatus(null);
  }

  function handleNoteSkip() {
    setPendingStatus(null);
  }

  function handleEditNote() {
    // re-open the note modal for today's already-set status, to edit note/duration only
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
        {currentStatus && !isTimerRunning && (
          <TouchableOpacity onPress={handleEditNote}>
            <Text style={styles.notePreview}>
              {currentNote ? `📝 ${currentNote}` : '+ add a note for today'}
              {currentDuration ? `   ⏱ ${formatDuration(currentDuration)}` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {isTimerRunning ? (
        <View style={styles.timerRow}>
          <Text style={styles.timerText}>⏱ {formatElapsed(elapsedSeconds)}</Text>
          <TouchableOpacity style={styles.stopBtn} onPress={() => stopTimer(todo.id)}>
            <Text style={styles.stopBtnText}>■ Stop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusRow}>
          <TouchableOpacity onPress={() => startTimer(todo.id)} style={styles.playBtn}>
            <Text style={styles.playBtnText}>▶</Text>
          </TouchableOpacity>
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
      )}

      <NoteModal
        visible={pendingStatus !== null}
        initialText={currentNote}
        initialDuration={currentDuration}
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
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: { color: '#6366F1', fontSize: 13 },
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
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerText: { color: '#818CF8', fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stopBtn: { backgroundColor: '#EF4444', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  stopBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
