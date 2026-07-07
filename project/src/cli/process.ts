import { DocumentService } from '../services/DocumentService';

async function main(): Promise<void> {
  const service = new DocumentService();
  const buffer = Buffer.from('Invoice for sample testing');
  const result = await service.processDocument(buffer, 'manual-process.pdf');
  console.log(JSON.stringify({
    documentType: result.document.documentType,
    status: result.document.status,
    extraction: result.extraction,
    confidence: result.confidenceValidation,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
