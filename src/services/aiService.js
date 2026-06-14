import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const BASE_URL = 'https://api.groq.com/openai/v1';
const MODEL    = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function estimateCalories({ apiKey, imagePath, foodName, servings = 1 }) {
  const base64 = await FileSystem.readAsStringAsync(imagePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const nameHint = foodName ? `음식명 힌트: ${foodName}. ` : '';
  const prompt =
    `${nameHint}이 음식 이미지를 분석하여 아래 JSON 형식으로만 응답해주세요. ` +
    '한국 식품 기준으로 추정하고, estimated_price는 한국 원화(₩) 기준 시장가를 정수로 추정하세요. ' +
    '{"food_name":"음식명","calories":0,"carbs":0.0,"protein":0.0,"fat":0.0,"estimated_price":0,"note":"간단한 메모"}';

  const response = await axios.post(
    `${BASE_URL}/chat/completions`,
    {
      model: MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
        ],
      }],
      response_format: { type: 'json_object' },
      max_completion_tokens: 512,
    },
    { headers: { Authorization: `Bearer ${apiKey.trim()}` } }
  );

  const content = response.data.choices[0].message.content;
  const est = JSON.parse(content.replace(/```json|```/g, '').trim());
  const s = servings;

  return {
    foodName:       est.food_name ?? '',
    calories:       Math.round((est.calories ?? 0) * s),
    carbs:          Math.round((est.carbs    ?? 0) * s * 10) / 10,
    protein:        Math.round((est.protein  ?? 0) * s * 10) / 10,
    fat:            Math.round((est.fat      ?? 0) * s * 10) / 10,
    estimatedPrice: Math.round((est.estimated_price ?? 0) * s),
    note:           est.note ?? '',
  };
}

export async function validateApiKey(apiKey) {
  try {
    const res = await axios.get(`${BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
    });
    return res.status === 200;
  } catch { return false; }
}
