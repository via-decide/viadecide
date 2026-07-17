import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
class MockDatabase {
  prepare() {
    return {
      run: () => ({ changes: 0, lastInsertRowid: 0 }),
      get: () => undefined,
      all: () => []
    };
  }
  exec() {}
  pragma() {}
}

let _db = null;

export function getDb() {
  if (!_db) {
    try {
      const Database = require('better-sqlite3');
      const DB_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../database');
      const DB_PATH = path.join(DB_DIR, 'daxini.db');
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      _db = new Database(DB_PATH);
      _db.pragma('journal_mode = WAL');
    } catch (err) {
      console.warn("[DB] WARNING: Native better-sqlite3 driver unavailable. Using MockDatabase.", err.message);
      _db = new MockDatabase();
    }
    ensureDatabase();
  }
  return _db;
}

export function sqliteExec(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (/^\s*select/i.test(sql)) {
    const row = stmt.get(...params);
    if (!row) {return '';}
    return Object.values(row).join('|');
  }
  stmt.run(...params);
  return '';
}

export function ensureDatabase() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT UNIQUE NOT NULL,
      payment_id TEXT UNIQUE,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      verified_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_verifications (
      verification_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      academic_email TEXT NOT NULL,
      student_id_number TEXT,
      verification_status TEXT NOT NULL CHECK (verification_status IN ('SUBMITTED', 'OCR_VERIFIED', 'MANUAL_APPROVED', 'REJECTED', 'EXPIRED')),
      expiry_date TEXT NOT NULL,
      verified_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(customer_id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS consent_records (
      consent_record_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      purpose_id TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('REQUESTED', 'ACTIVE', 'WITHDRAWN', 'REVOKED', 'EXPIRED', 'DELETED')),
      previous_consent_record_id TEXT,
      granted_at TEXT,
      withdrawn_at TEXT,
      revalidated_at TEXT,
      expires_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (previous_consent_record_id) REFERENCES consent_records(consent_record_id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS consent_current_state (
      customer_id TEXT NOT NULL,
      purpose_id TEXT NOT NULL,
      current_record_id TEXT NOT NULL,
      state TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (customer_id, purpose_id),
      FOREIGN KEY (current_record_id) REFERENCES consent_records(consent_record_id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS guardian_identity_verifications (
      verification_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      guardian_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL CHECK (relationship_type IN ('BIOLOGICAL_PARENT', 'LEGAL_GUARDIAN', 'COURT_APPOINTED', 'CUSTODIAN')),
      verification_method TEXT NOT NULL CHECK (verification_method IN ('DIGILOCKER', 'AADHAAR_KYC', 'PAN_VERIFICATION', 'NOTARIZED_DOCUMENT', 'THIRD_PARTY_KYC')),
      verification_artifact TEXT NOT NULL,
      artifact_hash TEXT NOT NULL,
      kms_key_id TEXT,
      verified_at TEXT NOT NULL,
      expires_at TEXT,
      verified_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_tokens_v2 (
      token_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      payment_type TEXT NOT NULL CHECK (payment_type IN ('UPI_AUTOPAY', 'CARD_MANDATE')),
      gateway_token_ciphertext TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      kms_key_id TEXT NOT NULL,
      encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
      token_state TEXT DEFAULT 'ACTIVE' CHECK (token_state IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'COMPROMISED', 'DELETED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT,
      rotated_at TEXT
    );
  `);
}

export function ensureSubscribersTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      ip_address TEXT NOT NULL,
      user_agent TEXT DEFAULT '',
      subscribed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      token_expires_at TEXT,
      verified_at TEXT,
      unsubscribed_at TEXT,
      name TEXT,
      interest_category TEXT
    );
  `);

  // Attempt to add columns to existing table if they are missing (for backward compatibility)
  const columnsToAdd = [
    'is_verified INTEGER NOT NULL DEFAULT 0',
    'verification_token TEXT',
    'token_expires_at TEXT',
    'verified_at TEXT',
    'unsubscribed_at TEXT',
    'name TEXT',
    'interest_category TEXT'
  ];

  for (const colDef of columnsToAdd) {
    try {
      db.exec(`ALTER TABLE subscribers ADD COLUMN ${colDef}`);
    } catch (err) {
      // Ignore if column already exists
    }
  }
  // Clean up any duplicate emails before creating the unique index (keep the most recent one)
  try {
    db.exec(`
      DELETE FROM subscribers
      WHERE id NOT IN (
          SELECT MAX(id)
          FROM subscribers
          GROUP BY email
      );
    `);
  } catch (err) {
    console.error('[DB] Failed to clean up duplicate subscribers:', err.message);
  }

  // Create unique index for email if not already unique (it is in the CREATE TABLE above, but for older tables)
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_unique ON subscribers(email);
  `);

  // Index for fast IP lookups (the primary query path)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subscribers_ip ON subscribers(ip_address);
  `);
  
  // Index for verification tokens
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers(verification_token);
  `);

  // Dispatch logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dispatch_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      edition_slug TEXT NOT NULL,
      subscriber_id INTEGER NOT NULL,
      sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'sent',
      error_message TEXT,
      UNIQUE (edition_slug, subscriber_id),
      FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE
    );
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dispatch_logs_edition ON dispatch_logs (edition_slug);
  `);
}

export function ensureReviewsTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      rating INTEGER NOT NULL,
      review_text TEXT NOT NULL,
      context TEXT,
      source TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    );
  `);
}

export function ensureDownloadsTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_name TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
