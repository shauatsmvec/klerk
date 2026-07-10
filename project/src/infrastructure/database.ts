import { Client } from 'pg';
import { env } from '../config/env';
import { logger } from '../config/logger';

export async function runMigration(): Promise<void> {
  const client = new Client({ connectionString: env.DATABASE_URL });

  try {
    await client.connect();
    const sql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        original_filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        sha256_hash TEXT NOT NULL UNIQUE,
        document_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        ocr_text TEXT,
        extraction_data JSONB,
        supplier_name TEXT,
        document_date TEXT,
        due_date TEXT,
        total_ttc TEXT,
        drive_file_id TEXT,
        drive_web_view_link TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(sha256_hash);
      CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
      CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(document_date);

      CREATE TABLE IF NOT EXISTS pending_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(50) NOT NULL UNIQUE,
        phone_number_id VARCHAR(50) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        temp_file_path VARCHAR(512) NOT NULL,
        supplier_name VARCHAR(255),
        total_ttc VARCHAR(50),
        document_date VARCHAR(50),
        due_date VARCHAR(50),
        document_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversation_states (
        phone_number VARCHAR(50) PRIMARY KEY,
        state VARCHAR(50) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploader_phone VARCHAR(50);
    `;

    await client.query(sql);
    logger.info('Database migration completed');
  } catch (error) {
    logger.error({ err: error }, 'Database migration failed');
    throw error;
  } finally {
    await client.end();
  }
}
