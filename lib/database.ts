import { openDatabaseAsync } from "expo-sqlite";
import type { CartItem } from "../redux/actions";

const DB_NAME = "mira.db";

let _db: Awaited<ReturnType<typeof openDatabaseAsync>> | null = null;

async function getDb() {
  if (!_db) _db = await openDatabaseAsync(DB_NAME);
  return _db;
}

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cart_items (
      id             TEXT NOT NULL,
      email          TEXT NOT NULL,
      name           TEXT NOT NULL,
      price          REAL NOT NULL,
      image          TEXT NOT NULL,
      category       TEXT NOT NULL,
      quantity       INTEGER NOT NULL,
      added_at       INTEGER NOT NULL,
      price_snapshot REAL NOT NULL,
      PRIMARY KEY (id, email)
    );

    CREATE TABLE IF NOT EXISTS product_cache (
      id        TEXT PRIMARY KEY,
      data      TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    );
  `);
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export async function saveCartToSQLite(email: string, items: CartItem[]) {
  const db = await getDb();
  await db.runAsync("DELETE FROM cart_items WHERE email = ?", email);
  for (const item of items) {
    await db.runAsync(
      `INSERT INTO cart_items
         (id, email, name, price, image, category, quantity, added_at, price_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        email,
        item.name,
        item.price,
        JSON.stringify(item.image),
        item.category,
        item.quantity,
        item.addedAt ?? Date.now(),
        item.priceSnapshot ?? item.price,
      ]
    );
  }
}

export async function loadCartFromSQLite(email: string): Promise<CartItem[]> {
  const db = await getDb();
  type Row = {
    id: string; name: string; price: number; image: string;
    category: string; quantity: number; added_at: number; price_snapshot: number;
  };
  const rows = await db.getAllAsync<Row>(
    "SELECT * FROM cart_items WHERE email = ? ORDER BY added_at ASC",
    [email]
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    image: JSON.parse(row.image) as string | number,
    category: row.category,
    quantity: row.quantity,
    addedAt: row.added_at,
    priceSnapshot: row.price_snapshot,
  }));
}

// ── Product cache ─────────────────────────────────────────────────────────────

export async function cacheProductsToSQLite(products: object[]) {
  const db = await getDb();
  const now = Date.now();
  for (const product of products) {
    const p = product as { id: string };
    await db.runAsync(
      "INSERT OR REPLACE INTO product_cache (id, data, cached_at) VALUES (?, ?, ?)",
      [p.id, JSON.stringify(product), now]
    );
  }
}

export async function loadCachedProducts<T>(): Promise<T[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ data: string }>(
    "SELECT data FROM product_cache ORDER BY cached_at DESC"
  );
  return rows.map((row) => JSON.parse(row.data) as T);
}

export async function isCacheEmpty(): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM product_cache"
  );
  return (row?.count ?? 0) === 0;
}
