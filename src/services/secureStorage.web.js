// Web fallback: localStorage instead of expo-secure-store
const KEY = 'groq_api_key';

export async function getApiKey()      { return localStorage.getItem(KEY); }
export async function setApiKey(value) { localStorage.setItem(KEY, value); }
export async function deleteApiKey()   { localStorage.removeItem(KEY); }
