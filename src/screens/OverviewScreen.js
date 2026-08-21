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
              onEdit={(todoId, date) => setEditing({ todoId, date })}
            />
          )}
          {tab === 'month' && (
            <MonthTab
              date={anchorDate}
              todos={todos}
              onPrev={() => shiftMonth(-1)}
              onNext={() => shiftMonth(1)}
              onEdit={(todoId, date) => setEditing({ todoId, date })}
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

function DayAccordion({ date, todos, expanded, onToggle, onEdit }) {
  const entries = useMemo(() => dailyEntries(todos, date), [todos, date]);
  const groups = useMemo(() => byCategory(entries), [entries]);
  const counts = useMemo(() => summariesForDates(todos, [date])[0], [todos, date]);

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
        <Text style={styles.accordionTitle}>{date}</Text>
        <View style={styles.weekCounts}>
          <Text style={[styles.countText, { color: STATUS_META.done.color }]}>{counts.done}✓</Text>
          <Text style={[styles.countText, { color: STATUS_META.missed.color }]}>{counts.missed}✕</Text>
          <Text style={[styles.countText, { color: STATUS_META.skipped.color }]}>{counts.skipped}–</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.accordionBody}>
          {entries.length === 0 ? (
            <Text style={styles.emptySmall}>Nothing logged or scheduled.</Text>
          ) : (
            groups.map(([label, items]) => (
              <View key={label} style={{ marginBottom: 10 }}>
                <Text style={styles.catHeader}>{label}</Text>
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
        </View>
      )}
    </View>
  );
}

function WeekTab({ date, todos, onPrev, onNext, onEdit }) {
  const dates = useMemo(() => datesInWeek(date), [date]);
  const label = `Week of ${weekStart(date)}`;
  const [expandedDays, setExpandedDays] = useState(() => new Set([todayStr()]));

  function toggleDay(d) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <NavRow label={label} onPrev={onPrev} onNext={onNext} />
      <ScrollView style={{ marginTop: 8 }}>
        {dates.map((d) => (
          <DayAccordion
            key={d}
            date={d}
            todos={todos}
            expanded={expandedDays.has(d)}
            onToggle={() => toggleDay(d)}
            onEdit={onEdit}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function MonthTab({ date, todos, onPrev, onNext, onEdit }) {
  const dates = useMemo(() => datesInMonth(date), [date]);
  const label = monthStart(date).slice(0, 7);
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());
  const [expandedDays, setExpandedDays] = useState(() => new Set([todayStr()]));

  const weeks = useMemo(() => {
    const rows = [];
    for (let i = 0; i < dates.length; i += 7) rows.push(dates.slice(i, i + 7).filter(Boolean));
    return rows.filter((w) => w.length > 0);
  }, [dates]);

  function toggleWeek(idx) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function toggleDay(d) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <NavRow label={label} onPrev={onPrev} onNext={onNext} />
      <ScrollView style={{ marginTop: 8 }}>
        {weeks.map((weekDates, idx) => {
          const summaries = summariesForDates(todos, weekDates);
          const totals = summaries.reduce(
            (acc, s) => ({ done: acc.done + s.done, missed: acc.missed + s.missed, skipped: acc.skipped + s.skipped }),
            { done: 0, missed: 0, skipped: 0 }
          );
          const weekLabel = weekDates.length > 1 ? `${weekDates[0]} – ${weekDates[weekDates.length - 1]}` : weekDates[0];
          const expanded = expandedWeeks.has(idx);

          return (
            <View key={idx} style={styles.accordionItem}>
              <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleWeek(idx)}>
                <Text style={styles.accordionTitle}>{weekLabel}</Text>
                <View style={styles.weekCounts}>
                  <Text style={[styles.countText, { color: STATUS_META.done.color }]}>{totals.done}✓</Text>
                  <Text style={[styles.countText, { color: STATUS_META.missed.color }]}>{totals.missed}✕</Text>
                  <Text style={[styles.countText, { color: STATUS_META.skipped.color }]}>{totals.skipped}–</Text>
                </View>
                <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
              </TouchableOpacity>

              {expanded && (
                <View style={styles.weekBody}>
                  {weekDates.map((d) => (
                    <DayAccordion
                      key={d}
                      date={d}
                      todos={todos}
                      expanded={expandedDays.has(d)}
                      onToggle={() => toggleDay(d)}
                      onEdit={onEdit}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
  weekCounts: { flexDirection: 'row', gap: 8 },
  countText: { fontSize: 12, fontWeight: '700' },
  accordionItem: { marginBottom: 6 },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  accordionTitle: { color: '#E5E7EB', fontSize: 13, fontWeight: '700', flex: 1 },
  chevron: { color: '#9CA3AF', fontSize: 14, marginLeft: 4 },
  accordionBody: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  weekBody: { paddingLeft: 10, paddingTop: 6 },
  emptySmall: { color: '#6B7280', fontSize: 12, paddingVertical: 6 },
});
