import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useCalendarStore, buildWeeks, weekDays } from '../stores/calendarStore';
import { formatDate } from '../services/database';
import { useNavigation } from '@react-navigation/native';

const DOW = ['일','월','화','수','목','금','토'];
const DOW_WEEK = ['월','화','수','목','금','토','일'];

export default function CalendarScreen({ navigation }) {
  const store = useCalendarStore();

  useEffect(() => {
    store.loadData();
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 12 }}>
          <Ionicons name="settings-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <View style={s.flex}>
      <ViewToggle mode={store.viewMode} onSwitch={store.switchView} />
      {store.isLoading
        ? <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
        : store.viewMode === 'monthly'
          ? <MonthlyView store={store} navigation={navigation} />
          : <WeeklyView  store={store} navigation={navigation} />
      }
    </View>
  );
}

// ── Toggle ──────────────────────────────────────────────
function ViewToggle({ mode, onSwitch }) {
  return (
    <View style={s.toggleRow}>
      <ToggleBtn label="월간" active={mode === 'monthly'} onPress={() => onSwitch('monthly')} />
      <ToggleBtn label="주간" active={mode === 'weekly'}  onPress={() => onSwitch('weekly')} />
    </View>
  );
}
function ToggleBtn({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[s.toggleBtn, active && s.toggleActive]}
      onPress={onPress}
    >
      <Text style={[s.toggleTxt, active && s.toggleTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Monthly ─────────────────────────────────────────────
function MonthlyView({ store, navigation }) {
  const m = store.currentMonth;
  const weeks = buildWeeks(m.getFullYear(), m.getMonth());
  const recordsByDate = store.recordsByDate;
  const todayStr = formatDate(new Date());

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Nav */}
      <View style={s.navRow}>
        <TouchableOpacity onPress={store.prevMonth}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={s.navLabel}>
          {m.getFullYear()}년 {m.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={store.nextMonth}>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* DOW header */}
      <View style={s.dowRow}>
        {DOW.map((d) => (
          <Text key={d} style={[s.dowTxt, d === '일' && s.sunday, d === '토' && s.saturday]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} style={s.weekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={s.cell} />;
            const dateStr = formatDate(day);
            const recs    = recordsByDate[dateStr] || [];
            const kcal    = recs.reduce((s, r) => s + (r.calories ?? 0), 0);
            const price   = recs.reduce((s, r) => s + (r.price ?? 0), 0);
            const isToday = dateStr === todayStr;
            const isSun   = di === 0;
            const isSat   = di === 6;
            return (
              <TouchableOpacity
                key={di} style={[s.cell, recs.length > 0 && s.cellFilled, isToday && s.cellToday]}
                onPress={() => navigation.navigate('DayDetail', { date: dateStr })}
              >
                <Text style={[s.cellDay, isSun && s.sunday, isSat && s.saturday, isToday && s.todayTxt]}>
                  {day.getDate()}
                </Text>
                {kcal > 0 && <Text style={s.cellKcal}>{kcal}</Text>}
                {price > 0 && <Text style={s.cellPrice}>₩{Math.round(price / 1000)}k</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Weekly ───────────────────────────────────────────────
function WeeklyView({ store, navigation }) {
  const ws = store.selectedWeekStart;
  const days = weekDays(ws);
  const recordsByDate = store.recordsByDate;
  const todayStr = formatDate(new Date());

  const endDate = new Date(ws); endDate.setDate(endDate.getDate() + 6);
  const rangeLabel =
    `${ws.getMonth()+1}/${ws.getDate()} – ${endDate.getMonth()+1}/${endDate.getDate()}`;

  const allRecs = Object.values(recordsByDate).flat();
  const totalKcal    = allRecs.reduce((s, r) => s + (r.calories ?? 0), 0);
  const totalCarbs   = allRecs.reduce((s, r) => s + (r.carbs ?? 0), 0);
  const totalProtein = allRecs.reduce((s, r) => s + (r.protein ?? 0), 0);
  const totalFat     = allRecs.reduce((s, r) => s + (r.fat ?? 0), 0);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Week nav */}
      <View style={s.navRow}>
        <TouchableOpacity onPress={store.prevWeek}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={s.navLabel}>{rangeLabel}</Text>
        <TouchableOpacity onPress={store.nextWeek}>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekly summary */}
      {totalKcal > 0 && (
        <View style={s.weekSummary}>
          <Text style={s.weekKcal}>{totalKcal} kcal</Text>
          <View style={s.nutrRow}>
            <SummaryChip label="탄" value={`${totalCarbs.toFixed(1)}g`} />
            <SummaryChip label="단" value={`${totalProtein.toFixed(1)}g`} />
            <SummaryChip label="지" value={`${totalFat.toFixed(1)}g`} />
          </View>
        </View>
      )}

      {/* Day cards */}
      {days.map((day, i) => {
        const dateStr = formatDate(day);
        const recs    = recordsByDate[dateStr] || [];
        const isToday = dateStr === todayStr;
        const kcal    = recs.reduce((s, r) => s + (r.calories ?? 0), 0);
        const carbs   = recs.reduce((s, r) => s + (r.carbs ?? 0), 0);
        const prot    = recs.reduce((s, r) => s + (r.protein ?? 0), 0);
        const fat     = recs.reduce((s, r) => s + (r.fat ?? 0), 0);

        return (
          <View key={i} style={s.dayCard}>
            {/* Day header */}
            <TouchableOpacity
              style={s.dayHeader}
              onPress={() => navigation.navigate('DayDetail', { date: dateStr })}
            >
              <View style={s.dayLabelRow}>
                <Text style={[s.dowBig, isToday && { color: colors.primary }]}>{DOW_WEEK[i]}</Text>
                <Text style={s.dateSmall}>{day.getMonth()+1}/{day.getDate()}</Text>
                {isToday && <View style={s.todayBadge}><Text style={s.todayBadgeTxt}>오늘</Text></View>}
              </View>
              {kcal > 0 && (
                <View style={s.dayNutrRow}>
                  <Text style={s.dayKcal}>{kcal} kcal</Text>
                  <Text style={s.dayNutr}>탄 {carbs.toFixed(1)}g · 단 {prot.toFixed(1)}g · 지 {fat.toFixed(1)}g</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Thumbnails */}
            {recs.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbScroll}>
                {recs.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => navigation.navigate('FoodDetail', { record: r })}
                  >
                    {r.image_path
                      ? <Image source={{ uri: r.image_path }} style={s.thumb} />
                      : <View style={[s.thumb, s.noImg]}><Ionicons name="image-outline" size={20} color={colors.grayLight}/></View>
                    }
                    <Text style={s.thumbName} numberOfLines={1}>{r.food_name || '-'}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={s.addThumb}
                  onPress={() => navigation.navigate('Upload', { date: dateStr })}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </ScrollView>
            )}
            {recs.length === 0 && (
              <TouchableOpacity
                style={s.emptyDay}
                onPress={() => navigation.navigate('Upload', { date: dateStr })}
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.grayLight} />
                <Text style={s.emptyDayTxt}>추가</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function SummaryChip({ label, value }) {
  return (
    <View style={s.summaryChip}>
      <Text style={s.summaryChipLabel}>{label}</Text>
      <Text style={s.summaryChipValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex:            { flex: 1 },
  toggleRow:       { flexDirection: 'row', margin: 12, backgroundColor: colors.border, borderRadius: 10, padding: 3 },
  toggleBtn:       { flex: 1, padding: 8, alignItems: 'center', borderRadius: 8 },
  toggleActive:    { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleTxt:       { fontSize: 14, color: colors.grayMid, fontWeight: '600' },
  toggleTxtActive: { color: colors.primary },
  navRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  navLabel:        { fontSize: 16, fontWeight: '700', color: colors.grayDark },
  dowRow:          { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 4 },
  dowTxt:          { flex: 1, textAlign: 'center', fontSize: 12, color: colors.grayMid, fontWeight: '600' },
  sunday:          { color: '#E53935' },
  saturday:        { color: '#1565C0' },
  weekRow:         { flexDirection: 'row', paddingHorizontal: 12 },
  cell: {
    flex: 1, aspectRatio: 1, margin: 1, borderRadius: 6,
    alignItems: 'center', paddingTop: 4, backgroundColor: 'transparent',
  },
  cellFilled:      { backgroundColor: colors.primaryLight },
  cellToday:       { borderWidth: 1.5, borderColor: colors.primary },
  cellDay:         { fontSize: 13, fontWeight: '600', color: colors.grayDark },
  todayTxt:        { color: colors.primary },
  cellKcal:        { fontSize: 8, color: colors.primary },
  cellPrice:       { fontSize: 7, color: colors.grayMid },
  weekSummary:     { backgroundColor: colors.primaryLight, margin: 12, borderRadius: 12, padding: 14 },
  weekKcal:        { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  nutrRow:         { flexDirection: 'row', gap: 8 },
  summaryChip:     { backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  summaryChipLabel:{ fontSize: 11, color: colors.grayMid },
  summaryChipValue:{ fontSize: 13, fontWeight: '700', color: colors.grayDark },
  dayCard: {
    backgroundColor: colors.white, marginHorizontal: 12, marginVertical: 4,
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  dayHeader:       { padding: 12 },
  dayLabelRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  dowBig:          { fontSize: 15, fontWeight: '700', color: colors.grayDark },
  dateSmall:       { fontSize: 13, color: colors.grayMid },
  todayBadge:      { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  todayBadgeTxt:   { fontSize: 10, color: colors.white, fontWeight: '700' },
  dayNutrRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayKcal:         { fontSize: 14, fontWeight: '700', color: colors.primary },
  dayNutr:         { fontSize: 12, color: colors.grayMid },
  thumbScroll:     { paddingLeft: 12, paddingBottom: 12 },
  thumb:           { width: 72, height: 72, borderRadius: 8, marginRight: 8, backgroundColor: colors.border },
  noImg:           { justifyContent: 'center', alignItems: 'center' },
  thumbName:       { fontSize: 10, color: colors.grayMid, textAlign: 'center', width: 72, marginRight: 8 },
  addThumb: {
    width: 72, height: 72, borderRadius: 8, borderWidth: 1.5,
    borderColor: colors.primary, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  emptyDay:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  emptyDayTxt:     { fontSize: 13, color: colors.grayMid },
});
