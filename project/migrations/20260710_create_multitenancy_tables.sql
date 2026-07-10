-- Migration: Create users and conversation_states tables and add uploader_phone column to documents
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
