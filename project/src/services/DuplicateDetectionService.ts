import { Document } from '../domain/Document';
import { DocumentRepository } from '../repositories/DocumentRepository';

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicateDocumentId?: string;
}

export class DuplicateDetectionService {
  constructor(private readonly repository = new DocumentRepository()) {}

  public async detect(hash: string): Promise<DuplicateDetectionResult> {
    const existing = await this.repository.findByHash(hash);

    if (existing) {
      return { isDuplicate: true, duplicateDocumentId: existing.id };
    }

    return { isDuplicate: false };
  }
}
