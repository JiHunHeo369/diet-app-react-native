import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { getApiKey, setApiKey, deleteApiKey } from '../services/secureStorage';
import { validateApiKey } from '../services/aiService';

export default function SettingsScreen() {
  const [key, setKey]         = useState('');
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getApiKey().then((v) => { if (v) { setKey(v); setSaved(true); } });
  }, []);

  const handleSave = async () => {
    if (!key.trim()) return;
    setLoading(true);
    const ok = await validateApiKey(key.trim());
    setLoading(false);
    if (!ok) { Alert.alert('오류', '유효하지 않은 API 키입니다.'); return; }
    await setApiKey(key.trim());
    setSaved(true);
    Alert.alert('저장됨', 'API 키가 저장되었습니다.');
  };

  const handleDelete = async () => {
    Alert.alert('삭제', 'API 키를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        await deleteApiKey(); setKey(''); setSaved(false);
      }},
    ]);
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>Groq API Key</Text>
      <TextInput
        style={s.input}
        value={key}
        onChangeText={(v) => { setKey(v); setSaved(false); }}
        placeholder="gsk_..."
        placeholderTextColor={colors.grayLight}
        secureTextEntry
        autoCapitalize="none"
      />
      {saved && <Text style={s.savedTxt}>✓ 저장되어 있음</Text>}

      <TouchableOpacity style={s.btn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={s.btnTxt}>저장 및 검증</Text>}
      </TouchableOpacity>

      {saved && (
        <TouchableOpacity style={[s.btn, s.deleteBtn]} onPress={handleDelete}>
          <Text style={s.btnTxt}>삭제</Text>
        </TouchableOpacity>
      )}

      <Text style={s.hint}>
        Groq Cloud Console(console.groq.com)에서 API 키를 발급받을 수 있습니다.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label:     { fontSize: 14, fontWeight: '600', color: colors.grayDark, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: colors.grayDark,
    backgroundColor: colors.white, marginBottom: 6,
  },
  savedTxt: { fontSize: 12, color: colors.primary, marginBottom: 12 },
  btn: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 12,
  },
  deleteBtn: { backgroundColor: '#CC3333' },
  btnTxt:    { color: colors.white, fontWeight: '700', fontSize: 15 },
  hint:      { fontSize: 12, color: colors.grayMid, marginTop: 8, lineHeight: 18 },
});
