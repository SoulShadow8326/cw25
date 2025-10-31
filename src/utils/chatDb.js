// Simple IndexedDB wrapper for chat messages
// DB: cw25-chat, Store: messages, keyPath: id
// Indexes: room (string), ts (number), room_ts (compound)

const DB_NAME = 'cw25-chat';
const DB_VERSION = 1;
const STORE = 'messages';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('room', 'room', { unique: false });
        store.createIndex('ts', 'ts', { unique: false });
        try { store.createIndex('room_ts', ['room', 'ts'], { unique: false }); } catch {}
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addMessage(msg) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    try {
      if (!msg.id) msg.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (typeof msg.ts !== 'number') msg.ts = Date.now();
      store.put(msg);
      tx.oncomplete = () => resolve(msg);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('tx aborted'));
    } catch (e) {
      reject(e);
    }
  });
}

export async function getMessages(room, limit = 200, beforeTs) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const idx = store.index('room_ts');
    const upper = typeof beforeTs === 'number' ? beforeTs : Number.MAX_SAFE_INTEGER;
    const range = IDBKeyRange.bound([room, 0], [room, upper]);
    const results = [];
    const direction = 'prev'; // latest first
    const req = idx.openCursor(range, direction);
    req.onsuccess = (ev) => {
      const cursor = ev.target.result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results.reverse()); // return oldest->newest order
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearRoom(room) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const idx = store.index('room');
    const range = IDBKeyRange.only(room);
    const req = idx.openCursor(range);
    req.onsuccess = (ev) => {
      const cursor = ev.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function pruneRoom(room, maxCount = 500) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const idx = store.index('room_ts');
    // Traverse newest->oldest and collect keys beyond maxCount to delete
    const range = IDBKeyRange.bound([room, 0], [room, Number.MAX_SAFE_INTEGER]);
    let count = 0;
    const toDelete = [];
    const req = idx.openCursor(range, 'prev');
    req.onsuccess = (ev) => {
      const cursor = ev.target.result;
      if (cursor) {
        count += 1;
        if (count > maxCount) {
          toDelete.push(cursor.primaryKey);
        }
        cursor.continue();
      } else {
        // delete all extra
        for (const key of toDelete) store.delete(key);
        resolve(toDelete.length);
      }
    };
    req.onerror = () => reject(req.error);
  });
}
