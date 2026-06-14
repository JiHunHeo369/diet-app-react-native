import { create } from 'zustand';
import * as ImagePicker from 'expo-image-picker';
import { getApiKey } from '../services/secureStorage';
import { estimateCalories } from '../services/aiService';
import { insertRecord, formatDate } from '../services/database';

export const useUploadStore = create((set, get) => ({
  // state
  imageUri: null,
  foodName: '',
  price: '',
  servings: 1.0,
  analyzing: false,
  result: null,   // { calories, carbs, protein, fat, estimatedPrice, foodName, note }
  error: null,
  saved: false,

  // actions
  reset: () => set({
    imageUri: null, foodName: '', price: '', servings: 1.0,
    analyzing: false, result: null, error: null, saved: false,
  }),

  setFoodName:  (v) => set({ foodName: v }),
  setPrice:     (v) => set({ price: v }),
  setServings:  (v) => set({ servings: v }),

  pickImage: async (fromCamera) => {
    let permission;
    if (fromCamera) {
      permission = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!permission.granted) return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled && result.assets?.length) {
      set({ imageUri: result.assets[0].uri, result: null, error: null, saved: false });
    }
  },

  analyze: async () => {
    const { imageUri, foodName, servings } = get();
    if (!imageUri) return;
    set({ analyzing: true, error: null });

    const apiKey = await getApiKey();
    if (!apiKey) {
      set({ analyzing: false, error: 'API 키를 먼저 설정해주세요.' });
      return;
    }

    try {
      const res = await estimateCalories({ apiKey, imagePath: imageUri, foodName, servings });
      set({ result: res, analyzing: false });
    } catch (e) {
      set({ analyzing: false, error: `분석 실패: ${e.message}` });
    }
  },

  save: async (date) => {
    const { imageUri, foodName, price, result } = get();
    if (!result || !imageUri) return false;

    const record = {
      date: date || formatDate(new Date()),
      imagePath: imageUri,
      foodName:  foodName || result.foodName,
      calories:  result.calories,
      carbs:     result.carbs,
      protein:   result.protein,
      fat:       result.fat,
      price:     price ? parseInt(price, 10) : result.estimatedPrice,
    };
    await insertRecord(record);
    set({ saved: true });
    return true;
  },
}));
