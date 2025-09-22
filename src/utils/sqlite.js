import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const ERP_DB_NAME = 'DevERP.db';
const ERP_TABLE = {
  ERP_ACCOUNTS: 'erp_accounts',
  ERP_META: 'meta',
  ERP_BOOKMARKS: 'erp_bookmarks',
};

// =====================
// 🚀 MIGRATIONS SUPPORT
// =====================

const ERP_QUERY_SCHEMA_TABLE_CREATE = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
  );
`;

const getSchemaVersion = async (db) => {
  await db.executeSql(ERP_QUERY_SCHEMA_TABLE_CREATE);
  const results = await db.executeSql(
    `SELECT version FROM schema_version ORDER BY version DESC LIMIT 1`,
  );
  if (results[0].rows.length > 0) {
    return results[0].rows.item(0).version;
  }
  return 0;
};

const setSchemaVersion = async (db, version) => {
  await db.executeSql(
    `INSERT OR REPLACE INTO schema_version (version) VALUES (?)`,
    [version],
  );
};

// 👉 Define all schema migrations here
const migrations = [
  {
    version: 1,
    run: async (db) => {
      // Example: add a column to accounts
      try {
        await db.executeSql(
          `ALTER TABLE ${ERP_TABLE.ERP_ACCOUNTS} ADD COLUMN profilePicture TEXT;`,
        );
        console.log("🆕 Migration v1 applied: profilePicture column added");
      } catch (err) {
        console.log("⚠️ Migration v1 skipped (maybe already applied):", err.message);
      }
    },
  },
  {
    version: 2,
    run: async (db) => {
      // Example: add a new notifications table
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          title TEXT,
          message TEXT,
          createdAt TEXT
        );
      `);
      console.log("🆕 Migration v2 applied: notifications table created");
    },
  },
];

const migrateDatabase = async (db) => {
  const currentVersion = await getSchemaVersion(db);
  console.log("📦 Current DB schema version:", currentVersion);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`🚀 Running migration v${migration.version}`);
      await migration.run(db);
      await setSchemaVersion(db, migration.version);
    }
  }
};

// =====================
// 🚀 DB CONNECTION
// =====================

export const getDBConnection = async () => {
  console.log('🔍 getDBConnection called');
  const db = await SQLite.openDatabase({
    name: ERP_DB_NAME,
    location: 'default',
  });
  await migrateDatabase(db); // run migrations automatically
  console.log('🔍 getDBConnection completed, db object:', db);
  return db;
};

// =====================
// 🚀 QUERIES
// =====================

const ERP_QUERY_COMPANY_TABLE_CREATE = `
  CREATE TABLE IF NOT EXISTS company_details (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    link TEXT NOT NULL,
    createdAt TEXT,
    updatedAt TEXT
  );
`;

const ERP_QUERY_ACCOUNTS_TABLE_CREATE = `CREATE TABLE IF NOT EXISTS ${ERP_TABLE.ERP_ACCOUNTS} (
      id TEXT PRIMARY KEY NOT NULL,
      user_json TEXT NOT NULL,
      isActive TEXT,
      lastLoginAt TEXT
    );`;

const ERP_QUERY_META_TABLE_CREATE = `CREATE TABLE IF NOT EXISTS ${ERP_TABLE.ERP_META} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );`;

const ERP_QUERY_BOOKMARKS_TABLE_CREATE = `
  CREATE TABLE IF NOT EXISTS ${ERP_TABLE.ERP_BOOKMARKS} (
    id TEXT NOT NULL,
    userId TEXT NOT NULL,
    isBookmarked INTEGER DEFAULT 0,
    PRIMARY KEY (id, userId)
  );
`;

// =====================
// 🚀 TABLE CREATION
// =====================

export const createCompanyTable = async (db) => {
  try {
    await db.executeSql(ERP_QUERY_COMPANY_TABLE_CREATE);
    console.log("🏢 createCompanyTable created successfully");
  } catch (error) {
    console.error("Error createCompanyTable:", error);
  }
};

export const insertOrUpdateCompany = async (db, company) => {
  try {
    const now = new Date().toISOString();
    await db.executeSql(
      `INSERT OR REPLACE INTO company_details (id, name, link, createdAt, updatedAt)
       VALUES (?, ?, ?, COALESCE((SELECT createdAt FROM company_details WHERE id = ?), ?), ?);`,
      [company.id, company.name, company.link, company.id, now, now]
    );
    console.log("🏢 insertOrUpdateCompany:", company.id);
  } catch (error) {
    console.error("Error insertOrUpdateCompany:", error);
  }
};

export const createAccountsTable = async db => {
  try {
    console.log('🔍 createAccountsTable called');
    await db.executeSql(ERP_QUERY_ACCOUNTS_TABLE_CREATE);
    await db.executeSql(ERP_QUERY_META_TABLE_CREATE);
    console.log('🔍 createAccountsTable completed successfully');
  } catch (error) {
    console.error('Error createAccountsTable:', error);
  }
};

const META_KEYS = {
  PIN_ENABLED: 'pin_enabled',
  PIN_CODE: 'pin_code',
};

export const setPinEnabled = async (db, enabled) => {
  try {
    await db.executeSql(
      `INSERT OR REPLACE INTO ${ERP_TABLE.ERP_META} (key, value) VALUES (?, ?)`,
      [META_KEYS.PIN_ENABLED, enabled ? '1' : '0']
    );
    console.log('🔐 setPinEnabled:', enabled);
  } catch (error) {
    console.error('Error setPinEnabled:', error);
  }
};

export const isPinEnabled = async (db) => {
  try {
    const results = await db.executeSql(
      `SELECT value FROM ${ERP_TABLE.ERP_META} WHERE key = ?`,
      [META_KEYS.PIN_ENABLED]
    );
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0).value === '1';
    }
    return false;
  } catch (error) {
    console.error('Error isPinEnabled:', error);
    return false;
  }
};

export const setPinCode = async (db, pin) => {
  try {
    await db.executeSql(
      `INSERT OR REPLACE INTO ${ERP_TABLE.ERP_META} (key, value) VALUES (?, ?)`,

      [META_KEYS.PIN_CODE, pin]
    );
    console.log('🔐 setPinCode: saved');
  } catch (error) {
    console.error('Error setPinCode:', error);
  }
};

export const getPinCode = async (db) => {
  try {
    const results = await db.executeSql(
      `SELECT value FROM ${ERP_TABLE.ERP_META} WHERE key = ?`,
      [META_KEYS.PIN_CODE]
    );
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0).value;
    }
    return null;
  } catch (error) {
    console.error('Error getPinCode:', error);
    return null;
  }
};

export const insertAccount = async (db, account) => {
  try {
    const insertValues = [
      account.id,
      JSON.stringify(account.user),
      account.isActive ? 1 : 0,
      account.lastLoginAt,
    ];
    await db.executeSql(
      `INSERT OR REPLACE INTO ${ERP_TABLE.ERP_ACCOUNTS} (id, user_json, isActive, lastLoginAt) VALUES (?, ?, ?, ?);`,
      insertValues,
    );
  } catch (error) {
    console.error('Error insertAccount:', error);
  }
};

export const updateAccountActive = async (db, accountId) => {
  try {
    const currentTime = new Date().toISOString();
    await db.executeSql(
      `UPDATE ${ERP_TABLE.ERP_ACCOUNTS}
       SET isActive = CASE WHEN id = ? THEN 1 ELSE 0 END,
           lastLoginAt = CASE WHEN id = ? THEN ? ELSE lastLoginAt END`,
      [accountId, accountId, currentTime],
    );
  } catch (error) {
    console.error('Error updateAccountActive:', error);
  }
};

export const getAccounts = async db => {
  try {
    const results = await db.executeSql(`SELECT * FROM ${ERP_TABLE.ERP_ACCOUNTS}`);
    const accounts = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      accounts.push({
        id: row.id,
        user: JSON.parse(row.user_json),
        isActive: !!row.isActive,
        lastLoginAt: row.lastLoginAt,
      });
    }
    return accounts;
  } catch (error) {
    console.error('Error getAccounts:', error);
  }
};

export const getActiveAccount = async db => {
  try {
    const results = await db.executeSql(
      `SELECT * FROM ${ERP_TABLE.ERP_ACCOUNTS} WHERE isActive = 1 LIMIT 1`,
    );
    if (results[0].rows.length > 0) {
      const row = results[0].rows.item(0);
      return {
        id: row.id,
        user: JSON.parse(row.user_json),
        isActive: !!row.isActive,
        lastLoginAt: row.lastLoginAt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getActiveAccount:', error);
  }
};

export const removeAccount = async (db, accountId) => {
  try {
    await db.executeSql(`DELETE FROM ${ERP_TABLE.ERP_ACCOUNTS} WHERE id = ?`, [accountId]);
  } catch (error) {
    console.error('Error removeAccount:', error);
  }
};

export const setMeta = async (db, key, value) => {
  try {
    await db.executeSql(`INSERT OR REPLACE INTO ${ERP_TABLE.ERP_META} (key, value) VALUES (?, ?)`, [
      key,
      value,
    ]);
  } catch (error) {
    console.error('Error setMeta:', error);
  }
};

export const getMeta = async (db, key) => {
  try {
    const results = await db.executeSql(`SELECT value FROM ${ERP_TABLE.ERP_META} WHERE key = ?`, [
      key,
    ]);
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0).value;
    }
    return null;
  } catch (error) {
    console.error('Error getMeta:', error);
  }
};

export const clearAccounts = async db => {
  try {
    await db.executeSql(`DELETE FROM ${ERP_TABLE.ERP_ACCOUNTS}`);
  } catch (error) {
    console.error('Error clearAccounts:', error);
  }
};

export const createBookmarksTable = async (db) => {
  try {
    await db.executeSql(ERP_QUERY_BOOKMARKS_TABLE_CREATE);
  } catch (error) {
    console.error("Error createBookmarksTable:", error);
  }
};

export const insertOrUpdateBookmark = async (db, id, userId, isBookmarked) => {
  try {
    await db.executeSql(
      `INSERT OR REPLACE INTO ${ERP_TABLE.ERP_BOOKMARKS} (id, userId, isBookmarked) VALUES (?, ?, ?)`,

      [id, userId, isBookmarked ? 1 : 0]
    );
  } catch (error) {
    console.error("Error insertOrUpdateBookmark:", error);
  }
};

export const getBookmarks = async (db, userId) => {
  try {
    const results = await db.executeSql(
      `SELECT * FROM ${ERP_TABLE.ERP_BOOKMARKS} WHERE userId = ?`,
      [userId]
    );

    const rows = results[0].rows;
    const bookmarks = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows.item(i);
      bookmarks[row.id] = row.isBookmarked === 1;
    }

    return bookmarks;
  } catch (error) {
    console.error("Error getBookmarks:", error);
    return {};
  }
};

export const removeBookmark = async (db, id) => {
  try {
    await db.executeSql(`DELETE FROM ${ERP_TABLE.ERP_BOOKMARKS} WHERE id = ?`, [id]);
  } catch (error) {
    console.error("Error removeBookmark:", error);
  }
};

export const logoutUser = async (db, accountId) => {
  try {
    await removeAccount(db, accountId);
    const remainingAccounts = await getAccounts(db);
    if (remainingAccounts.length === 0) {
      console.log("✅ All accounts removed. No active user.");
      return null;
    }

    const newActive = remainingAccounts[0];
    await updateAccountActive(db, newActive.id);

    console.log("✅ Logout done. New active user:", newActive.id);
    return newActive;
  } catch (error) {
    console.error("Error logoutUser:", error);
    return null;
  }
};
