import { ExtractionResult } from '../domain/types';

export interface ConfidenceValidationResult {
  isValid: boolean;
  uncertainFields: string[];
  clarificationPrompt: string;
}

export class ConfidenceValidationService {
  public validate(extraction: ExtractionResult): ConfidenceValidationResult {
    const uncertainFields: string[] = [];

    if (extraction.supplier_name.confidence < 0.75) {
      uncertainFields.push('supplier_name');
    }
    if (extraction.document_date.confidence < 0.75) {
      uncertainFields.push('document_date');
    }
    if (extraction.due_date.confidence < 0.75) {
      uncertainFields.push('due_date');
    }
    if (extraction.total_ttc.confidence < 0.75) {
      uncertainFields.push('total_ttc');
    }

    return {
      isValid: uncertainFields.length === 0,
      uncertainFields,
      clarificationPrompt: uncertainFields.length > 0
        ? `Je n'ai pas assez de confiance sur : ${uncertainFields.join(', ')}. Pouvez-vous confirmer ?`
        : 'Extraction valide.',
    };
  }
}
