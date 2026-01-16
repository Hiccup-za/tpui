#!/usr/bin/env bun

/**
 * Database Initialization Script
 * 
 * This script verifies the database is set up correctly.
 * The database auto-initializes on first use, but this script
 * can be used to verify the setup or manually initialize.
 * 
 * Usage: bun run scripts/init-db.ts
 */

import { getDatabase, closeDatabase } from "../lib/db/database";

console.log("🔍 Checking database setup...");

try {
  const db = getDatabase();
  
  // Verify tables exist
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    .all() as Array<{ name: string }>;
  
  const expectedTables = ["documents", "agent_stages", "requirements", "test_cases"];
  const existingTables = tables.map((t) => t.name);
  
  console.log("✅ Database initialized successfully!");
  console.log(`📊 Found ${tables.length} tables: ${existingTables.join(", ")}`);
  
  // Check if all expected tables exist
  const missingTables = expectedTables.filter(
    (table) => !existingTables.includes(table)
  );
  
  if (missingTables.length > 0) {
    console.warn(`⚠️  Missing tables: ${missingTables.join(", ")}`);
  } else {
    console.log("✅ All required tables present");
  }
  
  // Check indexes
  const indexes = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
    )
    .all() as Array<{ name: string }>;
  
  console.log(`📇 Found ${indexes.length} indexes`);
  
  closeDatabase();
  console.log("✅ Database check complete!");
} catch (error) {
  console.error("❌ Error initializing database:", error);
  process.exit(1);
}
