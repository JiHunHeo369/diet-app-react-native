import * as SQLite from 'expo-sqlite';

let db;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('diet.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS food_records (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        date       TEXT    NOT NULL,
        image_path TEXT    NOT NULL,
        food_name  TEXT,
        calories   INTEGER,
        carbs      REAL,
        protein    REAL,
        fat        REAL,
        price      INTEGER,
        created_at INTEGER NOT NULL
      );
    `);
  }
  return db;
}

export async function insertRecord(record) {
  const d = await getDb();
  const result = await d.runAsync(
    `INSERT INTO food_records (date,image_path,food_name,calories,carbs,protein,fat,price,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [record.date, record.imagePath, record.foodName ?? null,
     record.calories ?? null, record.carbs ?? null,
     record.protein ?? null, record.fat ?? null,
     record.price ?? null, Date.now()]
  );
  return result.lastInsertRowId;
}

export async function getByDate(date) {
  const d = await getDb();
  return await d.getAllAsync(
    'SELECT * FROM food_records WHERE date = ? ORDER BY created_at ASC', [date]
  );
}

export async function getByDateRange(from, to) {
  const d = await getDb();
  return await d.getAllAsync(
    'SELECT * FROM food_records WHERE date >= ? AND date <= ? ORDER BY date ASC, created_at ASC',
    [from, to]
  );
}

export async function deleteRecord(id) {
  const d = await getDb();
  await d.runAsync('DELETE FROM food_records WHERE id = ?', [id]);
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
