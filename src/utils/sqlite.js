import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const ERP_DB_NAME = 'DevERP.db';
const ERP_DB_VERSION = '1.0';
const ERP_DB_DISPLAYNAME = 'DevERP Database';
const ERP_DB_SIZE = 200000;
const ERP_TABLE = {
  ERP_ACCOUNTS: 'erp_accounts',
  ERP_META: 'meta'
}

export const getDBConnection = async () => {
  console.log('🔍 getDBConnection called');
  const db = SQLite.openDatabase({
    name: ERP_DB_NAME,
    location: 'default',
  });
  console.log('🔍 getDBConnection completed, db object:', db);
  return db;
};

const ERP_QUERY_ACCOUNTS_TABLE_CREATE =  `CREATE TABLE IF NOT EXISTS ${ERP_TABLE.ERP_ACCOUNTS} (
      id TEXT PRIMARY KEY NOT NULL,
      user_json TEXT NOT NULL,
      isActive INTEGER,
      lastLoginAt TEXT
    );`;

const ERP_QUERY_META_TABLE_CREATE =  `CREATE TABLE IF NOT EXISTS ${ERP_TABLE.ERP_META} (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );`;

export const createAccountsTable = async (db ) => {
  try {
    console.log('🔍 createAccountsTable called');
    await db.executeSql(
     ERP_QUERY_ACCOUNTS_TABLE_CREATE
    );
    await db.executeSql(
     ERP_QUERY_META_TABLE_CREATE
    );
    
    // Debug: Check table structure
    try {
      const tableInfo = await db.executeSql(`PRAGMA table_info(${ERP_TABLE.ERP_ACCOUNTS})`);
      console.log('🔍 Table structure:', tableInfo[0].rows);
    } catch (pragmaError) {
      console.log('🔍 Could not get table info (this is normal for some SQLite versions):', pragmaError);
    }
    
    console.log('🔍 createAccountsTable completed successfully');
  } catch (error) {
      console.error('Error createAccountsTable:', error);
  }
};

export const insertAccount = async (db , account ) => {
  try {
    console.log('🔍 insertAccount called with:', {
      id: account.id,
      isActive: account.isActive,
      lastLoginAt: account.lastLoginAt,
      lastLoginAtType: typeof account.lastLoginAt
    });
    
    const insertValues = [account.id, JSON.stringify(account.user), account.isActive ? 1 : 0, account.lastLoginAt];
    console.log('🔍 insertAccount - SQL values:', insertValues);
    
    await db.executeSql(
    `INSERT OR REPLACE INTO ${ERP_TABLE.ERP_ACCOUNTS} (id, user_json, isActive, lastLoginAt) VALUES (?, ?, ?, ?);`,
    insertValues
  );
    console.log('🔍 insertAccount completed successfully');
  } catch (error) {
      console.error('Error insertAccount:', error);
  }
};

export const updateAccountActive = async (db , accountId ) => {
  try {
     console.log('🔍 updateAccountActive called with accountId:', accountId);
     await db.executeSql(`UPDATE ${ERP_TABLE.ERP_ACCOUNTS} SET isActive = 0`);
     const currentTime = new Date().toISOString();
     console.log('🔍 Setting lastLoginAt to:', currentTime, 'type:', typeof currentTime);
     await db.executeSql(`UPDATE ${ERP_TABLE.ERP_ACCOUNTS} SET isActive = 1, lastLoginAt = ? WHERE id = ?`, [currentTime, accountId]);
     console.log('🔍 updateAccountActive completed successfully');
     
     // Debug: Check what was actually updated
     const checkResult = await db.executeSql(`SELECT lastLoginAt FROM ${ERP_TABLE.ERP_ACCOUNTS} WHERE id = ?`, [accountId]);
     if (checkResult[0].rows.length > 0) {
       const updatedRow = checkResult[0].rows.item(0);
       console.log('🔍 updateAccountActive - verified update:', {
         accountId,
         lastLoginAt: updatedRow.lastLoginAt,
         lastLoginAtType: typeof updatedRow.lastLoginAt
       });
     }
  } catch (error) {
      console.error('Error updateAccountActive:', error);
  }
 };

export const getAccounts = async (db ) => {
 try {
  console.log('🔍 getAccounts called');
  const results = await db.executeSql(`SELECT * FROM ${ERP_TABLE.ERP_ACCOUNTS}`);
  
  // Debug: Check raw database contents
  await debugDatabaseContents(db);
  
  const accounts  = [];
  for (let i = 0; i < results[0].rows.length; i++) {
    const row = results[0].rows.item(i);
    accounts.push({
      id: row.id,
      user: JSON.parse(row.user_json),
      isActive: !!row.isActive,
      lastLoginAt: row.lastLoginAt,
    });
  }
  console.log('🔍 getAccounts retrieved:', accounts.map(acc => ({
    id: acc.id,
    isActive: acc.isActive,
    lastLoginAt: acc.lastLoginAt,
    user: acc.user?.name
  })));
  return accounts;
  } catch (error) {
        console.error('Error getAccounts:', error);
  }
};

export const getActiveAccount = async (db ) => {
 try {
   console.log('🔍 getActiveAccount called');
   const results = await db.executeSql(`SELECT * FROM ${ERP_TABLE.ERP_ACCOUNTS} WHERE isActive = 1 LIMIT 1`);
  if (results[0].rows.length > 0) {
    const row = results[0].rows.item(0);
    const account = {
      id: row.id,
      user: JSON.parse(row.user_json),
      isActive: !!row.isActive,
      lastLoginAt: row.lastLoginAt,
    };
    console.log('🔍 getActiveAccount found:', {
      id: account.id,
      isActive: account.isActive,
      lastLoginAt: account.lastLoginAt
    });
    return account;
  }
  console.log('🔍 getActiveAccount - no active account found');
  return null;
 } catch (error) {
      console.error('Error getActiveAccount:', error);
 }
};

export const removeAccount = async (db , accountId ) => {
  try {
    await db.executeSql(`DELETE FROM ${ERP_TABLE.ERP_ACCOUNTS} WHERE id = ?`, [accountId]);
  } catch (error) {
      console.error('Error removeAccount:', error);
  }
};

export const setMeta = async (db , key , value ) => {
  try {
    await db.executeSql(`INSERT OR REPLACE INTO ${ERP_TABLE.ERP_META} (key, value) VALUES (?, ?)`, [key, value]);
  } catch (error) {
      console.error('Error setMeta:', error);
  }
};

export const getMeta = async (db , key ) => {
 try {
   const results = await db.executeSql(`SELECT value FROM ${ERP_TABLE.ERP_META} WHERE key = ?`, [key]);
  if (results[0].rows.length > 0) {
    return results[0].rows.item(0).value;
  }
  return null;
 } catch (error) {
      console.error('Error getMeta:', error);
 }
};

export const clearAccounts = async (db) => {
  try {
      await db.executeSql(`DELETE FROM ${ERP_TABLE.ERP_ACCOUNTS}`);
  } catch (error) {
      console.error('Error clearAccounts:', error);
  }
};

// Debug function to check database contents
export const debugDatabaseContents = async (db) => {
  try {
    console.log('🔍 Debug: Checking database contents...');
    const results = await db.executeSql(`SELECT * FROM ${ERP_TABLE.ERP_ACCOUNTS}`);
    console.log('🔍 Debug: Raw database results:', results[0].rows);
    
    for (let i = 0; i < results[0].rows.length; i++) {
      const row = results[0].rows.item(i);
      console.log('🔍 Debug: Row', i, ':', {
        id: row.id,
        isActive: row.isActive,
        lastLoginAt: row.lastLoginAt,
        lastLoginAtType: typeof row.lastLoginAt,
        user_json_length: row.user_json ? row.user_json.length : 0
      });
    }
  } catch (error) {
    console.error('Error debugDatabaseContents:', error);
  }
};
