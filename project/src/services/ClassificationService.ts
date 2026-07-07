import { logger } from '../config/logger';
import { DocumentType } from '../domain/types';

export interface ClassificationResult {
  type: DocumentType;
  confidence: number;
}

export class ClassificationService {
  public classify(text: string): ClassificationResult {
    const normalized = text.toLowerCase();

    if (normalized.includes('invoice') || normalized.includes('facture')) {
      return { type: DocumentType.INVOICE, confidence: 0.91 };
    }

    if (normalized.includes('receipt') || normalized.includes('reçu')) {
      return { type: DocumentType.RECEIPT, confidence: 0.87 };
    }

    if (normalized.includes('quote') || normalized.includes('devis')) {
      return { type: DocumentType.QUOTE, confidence: 0.86 };
    }

    if (normalized.includes('delivery') || normalized.includes('livraison')) {
      return { type: DocumentType.DELIVERY_NOTE, confidence: 0.84 };
    }

    logger.info({ textLength: text.length }, 'Fallback classification used');
    return { type: DocumentType.OTHER, confidence: 0.6 };
  }
}
