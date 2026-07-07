import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DuplicateDetectionService } from '../services/DuplicateDetectionService';

async function main(): Promise<void> {
  const documentService = new DocumentService();
  const repository = new DocumentRepository();
  const duplicateService = new DuplicateDetectionService(repository);

  const buffer = Buffer.from('Invoice for persistence testing');
  const result = await documentService.processDocument(buffer, 'persisted-invoice.pdf');
  const duplicate = await duplicateService.detect(result.document.sha256Hash);

  const saved = await repository.save(result.document);
  console.log(JSON.stringify({
    duplicate,
    saved: {
      id: saved.id,
      sha256Hash: saved.sha256Hash,
      status: saved.status,
      documentType: saved.documentType,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
