import Database from "better-sqlite3";
import { SCHEMA } from "./schema";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "database.db");
const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: Database | null = null;

/**
 * Get or create database instance
 */
export function getDatabase(): Database {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = new Database(DB_PATH);
  
  // Enable foreign keys
  dbInstance.exec("PRAGMA foreign_keys = ON");
  
  // Initialize schema
  initializeSchema(dbInstance);
  
  return dbInstance;
}

/**
 * Initialize database schema
 */
function initializeSchema(db: Database): void {
  // Create tables
  db.exec(SCHEMA.documents);
  db.exec(SCHEMA.agent_stages);
  db.exec(SCHEMA.requirements);
  db.exec(SCHEMA.test_cases);
  
  // Migration: Add number column if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(requirements)").all() as any[];
    const hasNumberColumn = tableInfo.some(col => col.name === 'number');
    
    if (!hasNumberColumn) {
      db.exec("ALTER TABLE requirements ADD COLUMN number TEXT");
    }
  } catch (e) {
    console.error("Error checking/migrating requirements table:", e);
  }
  
  // Create indexes
  SCHEMA.indexes.forEach((index) => {
    db.exec(index);
  });
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Get database instance (for testing or manual access)
 */
export function getDbInstance(): Database {
  return getDatabase();
}
