import assert from 'assert';
import { SupplierInvoiceExtractor } from '../src/services/SupplierInvoiceExtractor';

function runRegressionTests(): void {
  const extractor = new SupplierInvoiceExtractor();

  console.log('Running SupplierInvoiceExtractor regression tests...');

  // Test Case 1: Sanitherm Invoice Format (Realistic French OCR)
  const text1 = `Facture Sanitherm INV-2026-0612
Fournisseur : Sanitherm SA
Date : 30/06/2026
Échéance : 30/07/2026
Montant total TTC : 1 246,80 €`;
  const res1 = extractor.extract(text1);
  assert.strictEqual(res1.supplier_name.value, 'Sanitherm SA');
  assert.strictEqual(res1.document_date.value, '30/06/2026');
  assert.strictEqual(res1.due_date.value, '30/07/2026');
  assert.strictEqual(res1.total_ttc.value, '1 246,80 €');
  assert.strictEqual(res1.supplier_name.confidence, 0.9);
  assert.strictEqual(res1.document_date.confidence, 0.88);
  assert.strictEqual(res1.due_date.confidence, 0.86);
  assert.strictEqual(res1.total_ttc.confidence, 0.9);

  // Test Case 2: PlombiPro Invoice Format
  const text2 = `FACTURE F2026-0781
Fournisseur : PlombiPro
Date facture : 15/06/2026
Echéance : 30/06/2026
Total TTC : 410,40 EUR`;
  const res2 = extractor.extract(text2);
  assert.strictEqual(res2.supplier_name.value, 'PlombiPro');
  assert.strictEqual(res2.document_date.value, '15/06/2026');
  assert.strictEqual(res2.due_date.value, '30/06/2026');
  assert.strictEqual(res2.total_ttc.value, '410,40 EUR');

  // Test Case 3: ElecStock Invoice Format
  const text3 = `ElecStock SAS
Supplier : ElecStock
Date : 28-05-2026
Due date : 28-06-2026
Montant total : 89,90 €`;
  const res3 = extractor.extract(text3);
  assert.strictEqual(res3.supplier_name.value, 'ElecStock');
  assert.strictEqual(res3.document_date.value, '28-05-2026');
  assert.strictEqual(res3.due_date.value, '28-06-2026');
  assert.strictEqual(res3.total_ttc.value, '89,90 €');

  // Test Case 4: LocaBenne Invoice Format
  const text4 = `Facture LocaBenne LB-2026-0640
fournisseur - LocaBenne
date - 12/06/2026
échéance - 12/07/2026
total ttc - 300,00 €`;
  const res4 = extractor.extract(text4);
  assert.strictEqual(res4.supplier_name.value, 'LocaBenne');
  assert.strictEqual(res4.document_date.value, '12/06/2026');
  assert.strictEqual(res4.due_date.value, '12/07/2026');
  assert.strictEqual(res4.total_ttc.value, '300,00 €');

  // Test Case 5: Missing Fields Fallbacks
  const text5 = `Facture simple
Date : 01/01/2026`;
  const res5 = extractor.extract(text5);
  assert.strictEqual(res5.supplier_name.value, 'Example Supplier');
  assert.strictEqual(res5.supplier_name.confidence, 0.7);
  assert.strictEqual(res5.document_date.value, '01/01/2026');
  assert.strictEqual(res5.due_date.value, '20/06/2026');
  assert.strictEqual(res5.due_date.confidence, 0.66);
  assert.strictEqual(res5.total_ttc.value, '1246,80 €');
  assert.strictEqual(res5.total_ttc.confidence, 0.7);

  // Test Case 6: Messy Text / OCR Noise Case
  const text6 = `FACTURE N° 12345
Page 1 sur 1
---
Fournisseur : Brico Bâtiment
Client : M. Julien
Date : 10/05/2026
Échéance : 10/06/2026
Description de la prestation :
Matériaux divers pour chantier : 150.00
TVA 20% : 30.00
Montant Total TTC : 180,00 €
Merci de votre confiance.`;
  const res6 = extractor.extract(text6);
  assert.strictEqual(res6.supplier_name.value, 'Brico Bâtiment');
  assert.strictEqual(res6.document_date.value, '10/05/2026');
  assert.strictEqual(res6.due_date.value, '10/06/2026');
  assert.strictEqual(res6.total_ttc.value, '180,00 €');

  console.log('All SupplierInvoiceExtractor regression tests passed!');
}

try {
  runRegressionTests();
} catch (error) {
  console.error('Regression tests failed:', error);
  process.exit(1);
}
