/**
 * Database Schema
 * 
 * SQLite schema for storing documents, requirements, and test cases
 */

export const SCHEMA = {
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      uploaded_at INTEGER NOT NULL,
      status TEXT NOT NULL,
      completed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `,
  
  agent_stages: `
    CREATE TABLE IF NOT EXISTS agent_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      started_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      UNIQUE(document_id, stage_id)
    )
  `,
  
  requirements: `
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      number TEXT,
      type TEXT NOT NULL CHECK(type IN ('functional', 'non-functional')),
      description TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    )
  `,
  
  test_cases: `
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      document_id TEXT NOT NULL,
      description TEXT NOT NULL,
      is_positive INTEGER NOT NULL DEFAULT 0 CHECK(is_positive IN (0, 1)),
      is_negative INTEGER NOT NULL DEFAULT 0 CHECK(is_negative IN (0, 1)),
      test_types TEXT, -- JSON array of test types
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE CASCADE,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    )
  `,
  
  indexes: [
    `CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`,
    `CREATE INDEX IF NOT EXISTS idx_agent_stages_document ON agent_stages(document_id)`,
    `CREATE INDEX IF NOT EXISTS idx_requirements_document ON requirements(document_id)`,
    `CREATE INDEX IF NOT EXISTS idx_test_cases_requirement ON test_cases(requirement_id)`,
    `CREATE INDEX IF NOT EXISTS idx_test_cases_document ON test_cases(document_id)`,
  ],
};
