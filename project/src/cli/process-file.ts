import fs from 'fs';
import path from 'path';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DuplicateDetectionService } from '../services/DuplicateDetectionService';

async function main(): Promise<void> {
  const filePath = process.argv[2] ?? path.join(process.cwd(), 'candidate_pack', '05_TEST_DATASET', 'whatsapp_inbox', 'facture_plombipro_F2026-0433.pdf');
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  const documentService = new DocumentService();
  const repository = new DocumentRepository();
  const duplicateService = new DuplicateDetectionService(repository);
  const result = await documentService.processDocument(buffer, filename);
  const duplicate = await duplicateService.detect(result.document.sha256Hash);
  const saved = await repository.save(result.document);

  console.log(JSON.stringify({
    file: filename,
    duplicate,
    saved: {
      id: saved.id,
      sha256Hash: saved.sha256Hash,
      status: saved.status,
      documentType: saved.documentType,
    },
    extraction: result.extraction,
    confidence: result.confidenceValidation,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
