export enum DocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  QUOTE = 'quote',
  DELIVERY_NOTE = 'delivery_note',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  NEEDS_REVIEW = 'needs_review',
  FAILED = 'failed',
}

export interface ExtractionField {
  value: string | null;
  confidence: number;
}

export interface ExtractionResult {
  supplier_name: ExtractionField;
  document_date: ExtractionField;
  due_date: ExtractionField;
  total_ttc: ExtractionField;
}

export interface DocumentRecord {
  id: string;
  original_filename: string;
  mime_type: string;
  sha256_hash: string;
  document_type: DocumentType;
  status: DocumentStatus;
  ocr_text: string | null;
  extraction_data: ExtractionResult | null;
  supplier_name: string | null;
  document_date: string | null;
  due_date: string | null;
  total_ttc: string | null;
  drive_file_id: string | null;
  drive_web_view_link: string | null;
  created_at: string;
  updated_at: string;
}
