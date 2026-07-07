import { DocumentService } from './services/DocumentService';

async function main(): Promise<void> {
  const service = new DocumentService();
  const buffer = Buffer.from('Invoice example for Klerk');
  const result = await service.processDocument(buffer, 'sample-invoice.pdf');

  console.log(JSON.stringify({
    documentType: result.document.documentType,
    status: result.document.status,
    supplier: result.extraction.supplier_name,
    total: result.extraction.total_ttc,
    confidence: result.confidenceValidation,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
