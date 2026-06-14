import * as SecureStore from 'expo-secure-store';

const KEY = 'groq_api_key';

export async function getApiKey()      { return await SecureStore.getItemAsync(KEY); }
export async function setApiKey(value) { await SecureStore.setItemAsync(KEY, value); }
export async function deleteApiKey()   { await SecureStore.deleteItemAsync(KEY); }
