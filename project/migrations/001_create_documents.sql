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
