import { Document } from '../domain/Document';
import { ExtractionResult } from '../domain/types';
import type { ConfidenceValidationResult } from '../services/ConfidenceValidationService';
import type { DuplicateDetectionResult } from '../services/DuplicateDetectionService';

export interface UploadResponsePayload {
  message: string;
  duplicate: DuplicateDetectionResult;
  document: {
    id: string;
    filename: string;
    status: string;
    documentType: string;
    supplierName: string | null;
    totalTtc: string | null;
    createdAt: string;
  };
  extraction: ExtractionResult;
  confidence: ConfidenceValidationResult;
  summary: {
    reviewRequired: boolean;
    extractedFieldCount: number;
    averageConfidence: number;
  };
  savedToDatabase: boolean;
}

export function buildUploadResponse(params: {
  document: Document;
  duplicate: DuplicateDetectionResult;
  extraction: ExtractionResult;
  confidenceValidation: ConfidenceValidationResult;
  savedToDatabase: boolean;
}): UploadResponsePayload {
  const fields = Object.values(params.extraction);
  const extractedFieldCount = fields.filter((field) => Boolean(field.value)).length;
  const averageConfidence = fields.length > 0
    ? fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length
    : 0;

  return {
    message: 'Document processed successfully',
    duplicate: params.duplicate,
    document: {
      id: params.document.id,
      filename: params.document.originalFilename,
      status: params.document.status,
      documentType: params.document.documentType,
      supplierName: params.document.supplierName,
      totalTtc: params.document.totalTtc,
      createdAt: params.document.createdAt,
    },
    extraction: params.extraction,
    confidence: params.confidenceValidation,
    summary: {
      reviewRequired: !params.confidenceValidation.isValid,
      extractedFieldCount,
      averageConfidence: Number(averageConfidence.toFixed(2)),
    },
    savedToDatabase: params.savedToDatabase,
  };
}
