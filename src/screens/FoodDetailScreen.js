import React from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { deleteRecord } from '../services/database';

export default function FoodDetailScreen({ navigation, route }) {
  const { record } = route.params;

  const handleDelete = () => {
    Alert.alert('삭제', '이 식단 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        await deleteRecord(record.id);
        navigation.goBack();
      }},
    ]);
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {record.image_path && (
        <Image source={{ uri: record.image_path }} style={s.image} resizeMode="cover" />
      )}

      <Text style={s.foodName}>{record.food_name || '이름 없음'}</Text>
      <Text style={s.date}>{record.date}</Text>

      <View style={s.card}>
        <Row label="칼로리"   value={`${record.calories ?? '-'} kcal`} />
        <Row label="탄수화물" value={`${record.carbs ?? '-'} g`} />
        <Row label="단백질"   value={`${record.protein ?? '-'} g`} />
        <Row label="지방"     value={`${record.fat ?? '-'} g`} />
        <Row label="가격"     value={record.price ? `₩${record.price.toLocaleString()}` : '-'} />
      </View>

      <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
        <Text style={s.deleteBtnTxt}>삭제</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:     { flex: 1 },
  container:  { padding: 16 },
  image: {
    width: '100%', height: 240, borderRadius: 12,
    marginBottom: 16, backgroundColor: colors.border,
  },
  foodName:   { fontSize: 20, fontWeight: '700', color: colors.grayDark, marginBottom: 4 },
  date:       { fontSize: 13, color: colors.grayMid, marginBottom: 16 },
  card: {
    backgroundColor: colors.white, borderRadius: 12,
    padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLabel:   { fontSize: 14, color: colors.grayMid },
  rowValue:   { fontSize: 14, fontWeight: '600', color: colors.grayDark },
  deleteBtn: {
    backgroundColor: '#CC3333', borderRadius: 10, padding: 14, alignItems: 'center',
  },
  deleteBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
