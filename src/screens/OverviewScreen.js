import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTodos } from '../context/TodoContext';
import {
  todayStr,
  addDays,
  datesInWeek,
  datesInMonth,
  weekStart,
  monthStart,
} from '../utils/recurrence';
import { dailyEntries, summariesForDates, byCategory } from '../utils/aggregate';
import DayEntryModal from '../components/DayEntryModal';

const STATUS_META = {
  done: { symbol: '✓', color: '#22C55E' },
  missed: { symbol: '✕', color: '#EF4444' },
  skipped: { symbol: '–', color: '#9CA3AF' },
};

const TABS = ['day', 'week', 'month'];

export default function OverviewScreen({ visible, onClose }) {
  const { todos, setCompletion } = useTodos();
  const [tab, setTab] = useState('day');
  const [anchorDate, setAnchorDate] = useState(todayStr());
  const [editing, setEditing] = useState(null); // { todoId, date } or null

  function shift(delta) {
    if (tab === 'day') setAnchorDate((d) => addDays(d, delta));
    else if (tab === 'week') setAnchorDate((d) => addDays(d, delta * 7));
  }

  function shiftMonth(delta) {
    const [y, m] = anchorDate.split('-').map(Number);
    const newM = m - 1 + delta;
    const newY = y + Math.floor(newM / 12);
    const normM = ((newM % 12) + 12) % 12;
    setAnchorDate(`${newY}-${String(normM + 1).padStart(2, '0')}-01`);
  }

  const editingTodo = editing ? todos.find((t) => t.id === editing.todoId) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.tabRow}>
            {TABS.map((t) => (
              <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t[0].toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeX} onPress={onClose}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
          </View>

          {tab === 'day' && (
            <DayTab
              date={anchorDate}
              todos={todos}
              onPrev={() => shift(-1)}
              onNext={() => shift(1)}
              onToday={() => setAnchorDate(todayStr())}
              onEdit={(todoId, date) => setEditing({ todoId, date })}
            />
          )}
          {tab === 'week' && (
            <WeekTab
              date={anchorDate}
              todos={todos}
              onPrev={() => shift(-7)}
              onNext={() => shift(7)}
              onPickDay={(date) => { setAnchorDate(date); setTab('day'); }}
            />
          )}
          {tab === 'month' && (
            <MonthTab
              date={anchorDate}
              todos={todos}
              onPrev={() => shiftMonth(-1)}
              onNext={() => shiftMonth(1)}
              onPickDay={(date) => { setAnchorDate(date); setTab('day'); }}
            />
          )}
        </View>
      </View>

      <DayEntryModal
        visible={editing !== null}
        date={editing?.date}
        initialStatus={editingTodo && editing ? editingTodo.completions[editing.date] : null}
        initialNote={editingTodo && editing ? editingTodo.notes?.[editing.date] : ''}
        onSave={(status, note) => {
          setCompletion(editing.todoId, editing.date, status, note);
          setEditing(null);
        }}
        onClear={() => {
          setCompletion(editing.todoId, editing.date, null);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
      />
    </Modal>
  );
}

function DayTab({ date, todos, onPrev, onNext, onToday, onEdit }) {
  const entries = useMemo(() => dailyEntries(todos, date), [todos, date]);
  const groups = useMemo(() => byCategory(entries), [entries]);

  return (
    <View style={{ flex: 1 }}>
      <NavRow label={date} onPrev={onPrev} onNext={onNext} extra={<TouchableOpacity onPress={onToday}><Text style={styles.todayLink}>Today</Text></TouchableOpacity>} />
      <ScrollView style={{ marginTop: 8 }}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>Nothing logged or scheduled this day.</Text>
        ) : (
          groups.map(([cat, items]) => (
            <View key={cat} style={{ marginBottom: 14 }}>
              <Text style={styles.catHeader}>{cat}</Text>
              {items.map((e) => (
                <TouchableOpacity key={e.todo.id} style={styles.entryRow} onPress={() => onEdit(e.todo.id, date)}>
                  <View style={[styles.badge, { borderColor: e.status ? STATUS_META[e.status].color : '#4B5563' }]}>
                    <Text style={{ color: e.status ? STATUS_META[e.status].color : '#4B5563', fontWeight: '700' }}>
                      {e.status ? STATUS_META[e.status].symbol : '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>{e.todo.title}</Text>
                    {e.note ? <Text style={styles.entryNote}>{e.note}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function WeekTab({ date, todos, onPrev, onNext, onPickDay }) {
  const dates = useMemo(() => datesInWeek(date), [date]);
  const summaries = useMemo(() => summariesForDates(todos, dates), [todos, dates]);
  const label = `Week of ${weekStart(date)}`;

  return (
    <View style={{ flex: 1 }}>
      <NavRow label={label} onPrev={onPrev} onNext={onNext} />
      <ScrollView style={{ marginTop: 8 }}>
        {summaries.map((s) => (
          <TouchableOpacity key={s.date} style={styles.weekRow} onPress={() => onPickDay(s.date)}>
            <Text style={styles.weekDate}>{s.date}</Text>
            <View style={styles.weekCounts}>
              <Text style={[styles.countText, { color: STATUS_META.done.color }]}>{s.done}✓</Text>
              <Text style={[styles.countText, { color: STATUS_META.missed.color }]}>{s.missed}✕</Text>
              <Text style={[styles.countText, { color: STATUS_META.skipped.color }]}>{s.skipped}–</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function MonthTab({ date, todos, onPrev, onNext, onPickDay }) {
  const dates = useMemo(() => datesInMonth(date), [date]);
  const summaries = useMemo(() => summariesForDates(todos, dates), [todos, dates]);
  const label = monthStart(date).slice(0, 7);

  // chunk into rows of 7 for a calendar grid
  const rows = [];
  for (let i = 0; i < summaries.length; i += 7) rows.push(summaries.slice(i, i + 7));

  return (
    <View style={{ flex: 1 }}>
      <NavRow label={label} onPrev={onPrev} onNext={onNext} />
      <ScrollView style={{ marginTop: 8 }}>
        {rows.map((row, i) => (
          <View key={i} style={styles.calRow}>
            {row.map((s, j) => {
              if (!s) return <View key={j} style={styles.calCell} />;
              const ratio = s.total > 0 ? s.done / s.total : 0;
              const bg = s.total === 0 ? '#1F2937' : ratio >= 0.66 ? '#166534' : ratio >= 0.33 ? '#854D0E' : '#7F1D1D';
              return (
                <TouchableOpacity key={j} style={[styles.calCell, { backgroundColor: bg }]} onPress={() => onPickDay(s.date)}>
                  <Text style={styles.calDayNum}>{s.date.slice(-2)}</Text>
                  {s.total > 0 && <Text style={styles.calCount}>{s.done}/{s.total}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function NavRow({ label, onPrev, onNext, extra }) {
  return (
    <View style={styles.navRow}>
      <TouchableOpacity onPress={onPrev} style={styles.navBtn}><Text style={styles.navBtnText}>‹</Text></TouchableOpacity>
      <Text style={styles.navLabel}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={styles.navBtn}><Text style={styles.navBtnText}>›</Text></TouchableOpacity>
      {extra}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '85%' },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#1F2937' },
  tabActive: { backgroundColor: '#6366F1' },
  tabText: { color: '#9CA3AF', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  closeX: { marginLeft: 'auto', padding: 6 },
  closeXText: { color: '#9CA3AF', fontSize: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
  navBtn: { padding: 6 },
  navBtnText: { color: '#818CF8', fontSize: 22, fontWeight: '700' },
  navLabel: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },
  todayLink: { color: '#818CF8', fontSize: 13, fontWeight: '600' },
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  catHeader: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  entryRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomColor: '#1F2937', borderBottomWidth: 1 },
  badge: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  entryTitle: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
  entryNote: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomColor: '#1F2937', borderBottomWidth: 1 },
  weekDate: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
  weekCounts: { flexDirection: 'row', gap: 10 },
  countText: { fontSize: 13, fontWeight: '700' },
  calRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  calCell: { flex: 1, aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  calDayNum: { color: '#E5E7EB', fontSize: 11, fontWeight: '700' },
  calCount: { color: '#D1D5DB', fontSize: 9, marginTop: 1 },
});
