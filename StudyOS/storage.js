(function (global) {
  const DB_NAME = 'StudyOSStorage';
  const DB_VERSION = 1;
  const STORE_NAME = 'app';
  const SCHEMA_VERSION = 1;
  const LEGACY_CONFIG_KEY = 'os_config_final';
  const LEGACY_DATA_KEY = 'os_data_final';
  const MIGRATION_KEY = 'migration_v1_complete';

  let dbPromise = null;

  function isIndexedDBAvailable() {
    return typeof indexedDB !== 'undefined';
  }

  function parseJsonSafely(raw, keyName) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`[StudyOSStorage] Malformed JSON in ${keyName}. Recovering with empty value.`, error);
      return null;
    }
  }

  function openDB() {
    if (!isIndexedDBAvailable()) return Promise.resolve(null);
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn('[StudyOSStorage] IndexedDB open failed. Falling back to localStorage.', request.error);
          resolve(null);
        };
      } catch (error) {
        console.warn('[StudyOSStorage] IndexedDB unavailable. Falling back to localStorage.', error);
        resolve(null);
      }
    });

    return dbPromise;
  }

  function idbGet(db, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function idbPut(db, key, value) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function idbDelete(db, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function readLegacyConfig() {
    return parseJsonSafely(localStorage.getItem(LEGACY_CONFIG_KEY), LEGACY_CONFIG_KEY);
  }

  async function readLegacyData() {
    return parseJsonSafely(localStorage.getItem(LEGACY_DATA_KEY), LEGACY_DATA_KEY);
  }

  function buildRecord(payload) {
    return { schemaVersion: SCHEMA_VERSION, payload };
  }

  function readRecordPayload(record, keyName) {
    if (!record) return null;
    if (typeof record !== 'object') {
      throw new Error(`Invalid storage record for ${keyName}.`);
    }
    if (record.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`Unsupported schema version for ${keyName}.`);
    }
    return record.payload ?? null;
  }

  async function migrateIfNeeded() {
    const db = await openDB();
    if (!db) return;

    try {
      const migrated = await idbGet(db, MIGRATION_KEY);
      if (migrated === true) return;

      const legacyConfig = await readLegacyConfig();
      const legacyData = await readLegacyData();

      if (legacyConfig !== null) {
        await idbPut(db, 'config', buildRecord(legacyConfig));
      }
      if (legacyData !== null) {
        await idbPut(db, 'data', buildRecord(legacyData));
      }
      await idbPut(db, MIGRATION_KEY, true);
    } catch (error) {
      console.warn('[StudyOSStorage] Migration failed, continuing with compatibility reads.', error);
    }
  }

  async function getPayload(key, legacyReader) {
    await migrateIfNeeded();
    const db = await openDB();

    if (db) {
      try {
        const record = await idbGet(db, key);
        const payload = readRecordPayload(record, key);
        if (payload !== null) return payload;
      } catch (error) {
        console.warn(`[StudyOSStorage] Failed reading ${key} from IndexedDB, using compatibility fallback.`, error);
        try {
          await idbDelete(db, key);
        } catch(_){ console.warn("VIA Cockpit: Handled silent error", _); }
      }
    }

    return legacyReader();
  }

  async function savePayload(key, value, legacyKey) {
    await migrateIfNeeded();
    const db = await openDB();

    if (db) {
      try {
        if (value === null || typeof value === 'undefined') {
          await idbDelete(db, key);
        } else {
          await idbPut(db, key, buildRecord(value));
        }
      } catch (error) {
        console.warn(`[StudyOSStorage] Failed saving ${key} to IndexedDB, persisting legacy localStorage.`, error);
      }
    }

    if (value === null || typeof value === 'undefined') {
      localStorage.removeItem(legacyKey);
      return;
    }
    localStorage.setItem(legacyKey, JSON.stringify(value));
  }

  const adapter = {
    async getConfig() {
      return getPayload('config', readLegacyConfig);
    },
    async saveConfig(config) {
      return savePayload('config', config, LEGACY_CONFIG_KEY);
    },
    async getData() {
      return getPayload('data', readLegacyData);
    },
    async saveData(data) {
      return savePayload('data', data, LEGACY_DATA_KEY);
    },
    async exportAll() {
      const [config, data] = await Promise.all([this.getConfig(), this.getData()]);
      return { config, data, schemaVersion: SCHEMA_VERSION };
    },
    async importAll(payload) {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid import payload.');
      }
      const nextConfig = payload.config ?? null;
      const nextData = payload.data ?? null;
      await this.saveConfig(nextConfig);
      await this.saveData(nextData);
    }
  };

  global.StudyOSStorage = adapter;
})(window);
