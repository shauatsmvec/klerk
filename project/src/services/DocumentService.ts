import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { Document } from '../domain/Document';
import { DocumentStatus, DocumentType, ExtractionResult } from '../domain/types';
import { logger } from '../config/logger';
import { OcrService } from './OcrService';
import { ClassificationService } from './ClassificationService';
import { SupplierInvoiceExtractor } from './SupplierInvoiceExtractor';
import { ConfidenceValidationService } from './ConfidenceValidationService';

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
  ) {}

  public async processDocument(fileBuffer: Buffer, filename: string): Promise<ProcessedDocumentResult> {
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const ocrResult = await this.ocrService.extractText(fileBuffer, filename);
    const classification = this.classificationService.classify(ocrResult.text);
    const extraction = this.extractor.extract(ocrResult.text);
    const confidenceValidation = this.confidenceService.validate(extraction);

    const document = new Document({
      id: randomUUID(),
      original_filename: filename,
      mime_type: 'application/octet-stream',
      sha256_hash: hash,
      document_type: classification.type,
      status: confidenceValidation.isValid ? DocumentStatus.PROCESSED : DocumentStatus.NEEDS_REVIEW,
      ocr_text: ocrResult.text,
      extraction_data: extraction,
      supplier_name: extraction.supplier_name.value,
      document_date: extraction.document_date.value,
      due_date: extraction.due_date.value,
      total_ttc: extraction.total_ttc.value,
      drive_file_id: null,
      drive_web_view_link: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    logger.info({ filename, hash, documentType: classification.type }, 'Document processed successfully');

    return { document, extraction, confidenceValidation };
  }
}
