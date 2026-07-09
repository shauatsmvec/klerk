import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { Document } from '../domain/Document';
import { DocumentStatus, DocumentType, ExtractionResult } from '../domain/types';
import { logger } from '../config/logger';
import { OcrService } from './OcrService';
import { ClassificationService } from './ClassificationService';
import { SupplierInvoiceExtractor } from './SupplierInvoiceExtractor';
import { ConfidenceValidationService } from './ConfidenceValidationService';
import { GoogleDriveService } from './GoogleDriveService';
import { GoogleSheetsService } from './GoogleSheetsService';

export interface ProcessedDocumentResult {
  document: Document;
  extraction: ExtractionResult;
  confidenceValidation: ReturnType<ConfidenceValidationService['validate']>;
}

export class DocumentService {
  constructor(
    private readonly ocrService = new OcrService(),
    private readonly classificationService = new ClassificationService(),
    private readonly extractor = new SupplierInvoiceExtractor(),
    private readonly confidenceService = new ConfidenceValidationService(),
    private readonly driveService = new GoogleDriveService(),
    private readonly sheetsService = new GoogleSheetsService(),
  ) {}

  public async processDocument(fileBuffer: Buffer, filename: string): Promise<ProcessedDocumentResult> {
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const ocrResult = await this.ocrService.extractText(fileBuffer, filename);
    const classification = this.classificationService.classify(ocrResult.text);
    const extraction = this.extractor.extract(ocrResult.text);
    const confidenceValidation = this.confidenceService.validate(extraction);

    const status = confidenceValidation.isValid ? DocumentStatus.PROCESSED : DocumentStatus.NEEDS_REVIEW;

    // Parse Year and Month from the document date for Drive organization
    const docDate = extraction.document_date.value;
    let year = new Date().getFullYear().toString();
    let month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    if (docDate) {
      const match = docDate.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
      if (match) {
        let y = match[3];
        if (y.length === 2) {
          y = '20' + y;
        }
        year = y;
        month = match[2].padStart(2, '0');
      }
    }

    // Upload document to Google Drive
    const uploadResult = await this.driveService.uploadFile(
      fileBuffer,
      filename,
      year,
      month,
      classification.type
    );

    // Append entry to Google Sheets
    await this.sheetsService.appendRow(
      extraction.document_date.value ?? '',
      extraction.supplier_name.value ?? '',
      classification.type,
      extraction.total_ttc.value ?? '',
      uploadResult.webViewLink,
      status
    );

    const document = new Document({
      id: randomUUID(),
      original_filename: filename,
      mime_type: 'application/octet-stream',
      sha256_hash: hash,
      document_type: classification.type,
      status: status,
      ocr_text: ocrResult.text,
      extraction_data: extraction,
      supplier_name: extraction.supplier_name.value,
      document_date: extraction.document_date.value,
      due_date: extraction.due_date.value,
      total_ttc: extraction.total_ttc.value,
      drive_file_id: uploadResult.fileId,
      drive_web_view_link: uploadResult.webViewLink,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    logger.info({ filename, hash, documentType: classification.type }, 'Document processed successfully');

    return { document, extraction, confidenceValidation };
  }
}
