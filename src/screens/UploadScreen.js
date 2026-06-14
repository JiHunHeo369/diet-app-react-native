import React, { useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';
import { useUploadStore } from '../stores/uploadStore';

const SERVINGS_OPTIONS = [0.5,1.0,1.5,2.0,2.5,3.0,3.5,4.0,4.5,5.0];

export default function UploadScreen({ navigation, route }) {
  const date = route?.params?.date;
  const store = useUploadStore();

  useEffect(() => {
    store.reset();
  }, []);

  const handleSave = async () => {
    const ok = await store.save(date);
    if (ok) {
      Alert.alert('저장됨', '식단이 저장되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Image area */}
      <View style={s.imageBox}>
        {store.imageUri ? (
          <Image source={{ uri: store.imageUri }} style={s.image} resizeMode="cover" />
        ) : (
          <Ionicons name="image-outline" size={64} color={colors.grayLight} />
        )}
      </View>

      {/* Pick buttons */}
      <View style={s.pickRow}>
        <TouchableOpacity style={s.pickBtn} onPress={() => store.pickImage(false)}>
          <Ionicons name="images-outline" size={18} color={colors.white} />
          <Text style={s.pickTxt}>갤러리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.pickBtn} onPress={() => store.pickImage(true)}>
          <Ionicons name="camera-outline" size={18} color={colors.white} />
          <Text style={s.pickTxt}>카메라</Text>
        </TouchableOpacity>
      </View>

      {/* Food name */}
      <Text style={s.label}>음식명 (선택)</Text>
      <TextInput
        style={s.input}
        value={store.foodName}
        onChangeText={store.setFoodName}
        placeholder="예) 김치찌개"
        placeholderTextColor={colors.grayLight}
      />

      {/* Servings */}
      <Text style={s.label}>인분</Text>
      <View style={s.pickerBox}>
        <Picker
          selectedValue={store.servings}
          onValueChange={store.setServings}
          style={s.picker}
        >
          {SERVINGS_OPTIONS.map((v) => (
            <Picker.Item key={v} label={`${v} 인분`} value={v} />
          ))}
        </Picker>
      </View>

      {/* Price */}
      <Text style={s.label}>가격 (₩, 선택)</Text>
      <TextInput
        style={s.input}
        value={store.price}
        onChangeText={store.setPrice}
        placeholder="예) 8000"
        placeholderTextColor={colors.grayLight}
        keyboardType="numeric"
      />

      {/* Error */}
      {store.error && <Text style={s.error}>{store.error}</Text>}

      {/* Result */}
      {store.result && (
        <View style={s.resultBox}>
          <Text style={s.resultTitle}>{store.result.foodName}</Text>
          <View style={s.nutrRow}>
            <NutrChip label="칼로리" value={`${store.result.calories} kcal`} />
            <NutrChip label="탄수화물" value={`${store.result.carbs}g`} />
            <NutrChip label="단백질"   value={`${store.result.protein}g`} />
            <NutrChip label="지방"    value={`${store.result.fat}g`} />
          </View>
          {store.result.note ? <Text style={s.note}>{store.result.note}</Text> : null}
          <Text style={s.priceEst}>추정 가격: ₩{store.result.estimatedPrice?.toLocaleString()}</Text>
        </View>
      )}

      {/* Analyze / Save */}
      {!store.result ? (
        <TouchableOpacity
          style={[s.mainBtn, !store.imageUri && s.disabled]}
          onPress={store.analyze}
          disabled={!store.imageUri || store.analyzing}
        >
          {store.analyzing
            ? <ActivityIndicator color={colors.white} />
            : <Text style={s.mainBtnTxt}>AI 분석</Text>}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.mainBtn} onPress={handleSave}>
          <Text style={s.mainBtnTxt}>저장</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function NutrChip({ label, value }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipLabel}>{label}</Text>
      <Text style={s.chipValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:      { flex: 1 },
  container:   { padding: 16 },
  imageBox: {
    width: '100%', height: 220, backgroundColor: colors.border,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, overflow: 'hidden',
  },
  image:       { width: '100%', height: '100%' },
  pickRow:     { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, gap: 6,
  },
  pickTxt:     { color: colors.white, fontWeight: '600' },
  label:       { fontSize: 13, fontWeight: '600', color: colors.grayDark, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: 10, fontSize: 14, color: colors.grayDark,
    backgroundColor: colors.white, marginBottom: 12,
  },
  pickerBox: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    backgroundColor: colors.white, marginBottom: 12, overflow: 'hidden',
  },
  picker:      { height: 48 },
  error:       { color: '#CC0000', marginBottom: 12, fontSize: 13 },
  resultBox: {
    backgroundColor: colors.primaryLight, borderRadius: 12,
    padding: 14, marginBottom: 16,
  },
  resultTitle: { fontSize: 16, fontWeight: '700', color: colors.grayDark, marginBottom: 8 },
  nutrRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    backgroundColor: colors.white, borderRadius: 8, padding: 8,
    alignItems: 'center', minWidth: 70,
  },
  chipLabel:   { fontSize: 11, color: colors.grayMid },
  chipValue:   { fontSize: 13, fontWeight: '700', color: colors.primary },
  note:        { fontSize: 12, color: colors.grayMid, marginBottom: 4 },
  priceEst:    { fontSize: 13, color: colors.grayDark },
  mainBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: 15, alignItems: 'center',
  },
  disabled:    { opacity: 0.5 },
  mainBtnTxt:  { color: colors.white, fontWeight: '700', fontSize: 16 },
});
