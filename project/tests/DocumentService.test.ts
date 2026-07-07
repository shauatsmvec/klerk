import assert from 'assert';
import { DocumentService } from '../src/services/DocumentService';

async function main(): Promise<void> {
  const service = new DocumentService();
  const result = await service.processDocument(Buffer.from('Invoice facture fournisseur Example Supplier'), 'test.pdf');

  assert.strictEqual(result.document.documentType, 'invoice');
  assert.strictEqual(result.document.status, 'processed');
  assert.ok(result.extraction.supplier_name.value);
  assert.ok(result.extraction.total_ttc.value);
  console.log('DocumentService test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
