# Database & Storage Setup

This application uses **SQLite** for metadata storage and **local filesystem** for PDF files.

## Storage Structure

```
your-project/
├── data/
│   └── database.db          # SQLite database (auto-created)
├── storage/
│   └── documents/
│       └── doc-*.pdf         # PDF files (auto-created)
└── ...
```

## Database Schema

### Documents Table
- `id`: Unique document identifier
- `file_name`: Original PDF filename
- `uploaded_at`: Timestamp when uploaded
- `status`: Processing status (uploaded, processing, completed, error)
- `completed_at`: Timestamp when processing completed

### Agent Stages Table
- Tracks the 6 processing stages for each document
- `stage_id`: Stage number (1-6)
- `status`: Stage status (pending, processing, completed, error)
- `started_at` / `completed_at`: Timestamps

### Requirements Table
- Extracted functional and non-functional requirements
- `type`: "functional" or "non-functional"
- `description`: Requirement text

### Test Cases Table
- Generated test cases for each requirement
- `is_positive` / `is_negative`: Boolean flags
- `test_types`: JSON array of test type classifications

## Initialization

**No manual setup required!** The database automatically initializes on first use:

- Database file created at `data/database.db` (if it doesn't exist)
- Tables and indexes created automatically using `CREATE TABLE IF NOT EXISTS`
- Storage directory created at `storage/documents/` (if it doesn't exist)
- Happens automatically when you first upload a document or access the API

### Manual Verification (Optional)

If you want to verify the database setup:

```bash
bun run db:check
```

This will:
- Initialize the database if needed
- Verify all tables exist
- Check indexes are created
- Display database status

**Note:** The database initializes lazily - it's only created when first accessed. No startup commands needed!

## Backup

To backup your data:

```bash
# Backup database
cp data/database.db data/database.db.backup

# Backup PDFs
tar -czf storage-backup.tar.gz storage/
```

## Migration

If you need to migrate to PostgreSQL later:

1. Export SQLite data
2. Import to PostgreSQL
3. Update `lib/db/database.ts` to use PostgreSQL client
4. Update connection string

The schema is designed to be easily portable to PostgreSQL.

## File Locations

- **Database**: `data/database.db` (auto-created)
- **PDF Storage**: `storage/documents/` (auto-created)
- **Schema**: `lib/db/schema.ts`
- **Service**: `lib/db/document-service.ts`
