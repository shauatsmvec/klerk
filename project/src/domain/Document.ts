import { DocumentRecord, DocumentStatus, DocumentType, ExtractionResult } from './types';

export class Document {
  public id: string;
  public originalFilename: string;
  public mimeType: string;
  public sha256Hash: string;
  public documentType: DocumentType;
  public status: DocumentStatus;
  public ocrText: string | null;
  public extractionData: ExtractionResult | null;
  public supplierName: string | null;
  public documentDate: string | null;
  public dueDate: string | null;
  public totalTtc: string | null;
  public driveFileId: string | null;
  public driveWebViewLink: string | null;
  public createdAt: string;
  public updatedAt: string;

  constructor(record: DocumentRecord) {
    this.id = record.id;
    this.originalFilename = record.original_filename;
    this.mimeType = record.mime_type;
    this.sha256Hash = record.sha256_hash;
    this.documentType = record.document_type;
    this.status = record.status;
    this.ocrText = record.ocr_text;
    this.extractionData = record.extraction_data;
    this.supplierName = record.supplier_name;
    this.documentDate = record.document_date;
    this.dueDate = record.due_date;
    this.totalTtc = record.total_ttc;
    this.driveFileId = record.drive_file_id;
    this.driveWebViewLink = record.drive_web_view_link;
    this.createdAt = record.created_at;
    this.updatedAt = record.updated_at;
  }

  public hasLowConfidence(): boolean {
    if (!this.extractionData) {
      return true;
    }

    const criticalFields = [
      this.extractionData.supplier_name,
      this.extractionData.document_date,
      this.extractionData.due_date,
      this.extractionData.total_ttc,
    ];

    return criticalFields.some((field) => field?.confidence !== undefined && field.confidence < 0.75);
  }
}
