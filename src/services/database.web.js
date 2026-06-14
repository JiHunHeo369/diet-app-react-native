// Web fallback: localStorage instead of expo-sqlite

const STORAGE_KEY = 'diet_records';
let _nextId = null;

function getAll() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function allocId(records) {
  if (_nextId === null) {
    _nextId = records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1;
  }
  return _nextId++;
}

export async function getDb() { return true; }

export async function insertRecord(record) {
  const records = getAll();
  const newRecord = {
    id:         allocId(records),
    date:       record.date,
    image_path: record.imagePath,
    food_name:  record.foodName ?? null,
    calories:   record.calories ?? null,
    carbs:      record.carbs    ?? null,
    protein:    record.protein  ?? null,
    fat:        record.fat      ?? null,
    price:      record.price    ?? null,
    created_at: Date.now(),
  };
  records.push(newRecord);
  saveAll(records);
  return newRecord.id;
}

export async function getByDate(date) {
  return getAll()
    .filter((r) => r.date === date)
    .sort((a, b) => a.created_at - b.created_at);
}

export async function getByDateRange(from, to) {
  return getAll()
    .filter((r) => r.date >= from && r.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date) || a.created_at - b.created_at);
}

export async function deleteRecord(id) {
  saveAll(getAll().filter((r) => r.id !== id));
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
