import { create } from 'zustand';
import { getByDateRange, formatDate } from '../services/database';

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const useCalendarStore = create((set, get) => ({
  viewMode: 'monthly',
  currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedWeekStart: mondayOf(new Date()),
  recordsByDate: {},
  isLoading: false,

  switchView: (mode) => { set({ viewMode: mode, recordsByDate: {} }); get().loadData(); },

  nextMonth: () => {
    const m = get().currentMonth;
    set({ currentMonth: new Date(m.getFullYear(), m.getMonth() + 1, 1) });
    get().loadData();
  },
  prevMonth: () => {
    const m = get().currentMonth;
    set({ currentMonth: new Date(m.getFullYear(), m.getMonth() - 1, 1) });
    get().loadData();
  },

  nextWeek: () => {
    const ws = new Date(get().selectedWeekStart);
    ws.setDate(ws.getDate() + 7);
    set({ selectedWeekStart: ws });
    get().loadData();
  },
  prevWeek: () => {
    const ws = new Date(get().selectedWeekStart);
    ws.setDate(ws.getDate() - 7);
    set({ selectedWeekStart: ws });
    get().loadData();
  },

  loadData: async () => {
    set({ isLoading: true });
    const state = get();
    let from, to;
    if (state.viewMode === 'monthly') {
      const m = state.currentMonth;
      from = formatDate(new Date(m.getFullYear(), m.getMonth(), 1));
      to   = formatDate(new Date(m.getFullYear(), m.getMonth() + 1, 0));
    } else {
      from = formatDate(state.selectedWeekStart);
      const end = new Date(state.selectedWeekStart);
      end.setDate(end.getDate() + 6);
      to = formatDate(end);
    }
    try {
      const records = await getByDateRange(from, to);
      const grouped = {};
      for (const r of records) {
        if (!grouped[r.date]) grouped[r.date] = [];
        grouped[r.date].push(r);
      }
      set({ recordsByDate: grouped });
    } catch (e) { console.warn('loadData error', e); }
    set({ isLoading: false });
  },
}));

export function buildWeeks(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days = Array(startOffset).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function weekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}
