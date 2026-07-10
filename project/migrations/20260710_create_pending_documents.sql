-- Migration: Create pending_documents table
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
