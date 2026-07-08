import assert from 'assert';
import { DocumentService } from '../src/services/DocumentService';
import { SupplierInvoiceExtractor } from '../src/services/SupplierInvoiceExtractor';
import { buildUploadResponse } from '../src/api/response';

async function main(): Promise<void> {
  const service = new DocumentService();
  const extractor = new SupplierInvoiceExtractor();

  const extractionResult = extractor.extract(`Facture
Fournisseur : PlombiPro
Date : 15/06/2026
Échéance : 30/06/2026
Montant total TTC : 635,04 €`);

  assert.strictEqual(extractionResult.supplier_name.value, 'PlombiPro');
  assert.strictEqual(extractionResult.document_date.value, '15/06/2026');
  assert.strictEqual(extractionResult.due_date.value, '30/06/2026');
  assert.strictEqual(extractionResult.total_ttc.value, '635,04 €');

  const result = await service.processDocument(Buffer.from('Invoice facture fournisseur Example Supplier'), 'test.pdf');

  assert.strictEqual(result.document.documentType, 'invoice');
  assert.strictEqual(result.document.status, 'processed');
  assert.ok(result.extraction.supplier_name.value);
  assert.ok(result.extraction.total_ttc.value);

  const response = buildUploadResponse({
    document: result.document,
    duplicate: { isDuplicate: false },
    extraction: result.extraction,
    confidenceValidation: result.confidenceValidation,
    savedToDatabase: true,
  });

  assert.strictEqual(response.message, 'Document processed successfully');
  assert.ok(response.summary.reviewRequired === false || response.summary.reviewRequired === true);
  assert.ok(response.summary.extractedFieldCount >= 1);
  assert.ok(response.summary.averageConfidence >= 0);

  console.log('DocumentService test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
