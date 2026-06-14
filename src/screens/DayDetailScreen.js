import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getByDate, formatDate } from '../services/database';

export default function DayDetailScreen({ navigation, route }) {
  const date = route?.params?.date || formatDate(new Date());
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getByDate(date);
    setRecords(data);
  };

  useFocusEffect(useCallback(() => { load(); }, [date]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const totalKcal    = records.reduce((s, r) => s + (r.calories ?? 0), 0);
  const totalCarbs   = records.reduce((s, r) => s + (r.carbs ?? 0), 0);
  const totalProtein = records.reduce((s, r) => s + (r.protein ?? 0), 0);
  const totalFat     = records.reduce((s, r) => s + (r.fat ?? 0), 0);
  const totalPrice   = records.reduce((s, r) => s + (r.price ?? 0), 0);

  return (
    <View style={s.flex}>
      {/* Summary */}
      {records.length > 0 && (
        <View style={s.summaryCard}>
          <Text style={s.kcal}>{totalKcal} kcal</Text>
          <View style={s.nutrRow}>
            <Chip label="탄" value={`${totalCarbs.toFixed(1)}g`} />
            <Chip label="단" value={`${totalProtein.toFixed(1)}g`} />
            <Chip label="지" value={`${totalFat.toFixed(1)}g`} />
            <Chip label="₩"  value={totalPrice.toLocaleString()} />
          </View>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(r) => String(r.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={records.length === 0 && s.emptyContainer}
        ListEmptyComponent={
          <Text style={s.emptyTxt}>등록된 식단이 없습니다</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('FoodDetail', { record: item })}
          >
            {item.image_path
              ? <Image source={{ uri: item.image_path }} style={s.thumb} />
              : <View style={[s.thumb, s.noImg]}><Ionicons name="image-outline" size={28} color={colors.grayLight}/></View>
            }
            <View style={s.info}>
              <Text style={s.name}>{item.food_name || '이름 없음'}</Text>
              <Text style={s.nutr}>
                {item.calories ?? '-'} kcal · 탄 {item.carbs ?? '-'}g · 단 {item.protein ?? '-'}g · 지 {item.fat ?? '-'}g
              </Text>
              {item.price ? <Text style={s.price}>₩{item.price.toLocaleString()}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('Upload', { date })}
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function Chip({ label, value }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipLabel}>{label}</Text>
      <Text style={s.chipValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex:            { flex: 1 },
  summaryCard: {
    backgroundColor: colors.primaryLight, padding: 14, margin: 12,
    borderRadius: 12,
  },
  kcal:            { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  nutrRow:         { flexDirection: 'row', gap: 8 },
  chip:            { backgroundColor: colors.white, borderRadius: 8, padding: 6, alignItems: 'center', minWidth: 56 },
  chipLabel:       { fontSize: 10, color: colors.grayMid },
  chipValue:       { fontSize: 12, fontWeight: '700', color: colors.grayDark },
  card: {
    flexDirection: 'row', backgroundColor: colors.white,
    marginHorizontal: 12, marginVertical: 4, borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  thumb:           { width: 80, height: 80 },
  noImg:           { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  info:            { flex: 1, padding: 10, justifyContent: 'center' },
  name:            { fontSize: 14, fontWeight: '600', color: colors.grayDark, marginBottom: 3 },
  nutr:            { fontSize: 12, color: colors.grayMid, marginBottom: 3 },
  price:           { fontSize: 12, color: colors.primary },
  emptyContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTxt:        { color: colors.grayMid, fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 80,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
});
