import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { GoogleDriveService } from '../src/services/GoogleDriveService';
import { GoogleSheetsService } from '../src/services/GoogleSheetsService';
import { env } from '../src/config/env';

async function main(): Promise<void> {
  const isMock = env.GOOGLE_INTEGRATION_MOCK || 
                 (!(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) && 
                  !(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN));

  console.log(`Running Google Drive & Sheets ${isMock ? 'Mock' : 'REAL'} integration tests...`);

  const driveService = new GoogleDriveService();
  const sheetsService = new GoogleSheetsService();

  const fileBuffer = Buffer.from('test pdf content');
  const filename = 'sample_invoice.pdf';
  const year = '2026';
  const month = '06';
  const docType = 'invoice';

  // 1. Test Drive upload
  const uploadResult = await driveService.uploadFile(fileBuffer, filename, year, month, docType);
  
  assert.ok(uploadResult.fileId);
  
  if (isMock) {
    assert.ok(uploadResult.webViewLink.startsWith('file:///'));
    const expectedPath = path.join(process.cwd(), 'uploads', 'Compta', year, month, docType, filename);
    assert.strictEqual(fs.existsSync(expectedPath), true, 'Local uploaded file must exist');
    assert.strictEqual(fs.readFileSync(expectedPath, 'utf8'), 'test pdf content', 'Uploaded file content must match');
  } else {
    assert.ok(uploadResult.webViewLink.startsWith('https://'));
  }

  // 2. Test Sheets logging
  const date = '15/06/2026';
  const supplier = 'Sanitherm SA';
  const amount = '1 246,80 €';
  const status = 'processed';

  await sheetsService.appendRow(date, supplier, docType, amount, uploadResult.webViewLink, status);

  if (isMock) {
    const journalPath = path.join(process.cwd(), 'uploads', 'accounting_journal.csv');
    assert.strictEqual(fs.existsSync(journalPath), true, 'Accounting journal CSV must exist');
    
    const journalContent = fs.readFileSync(journalPath, 'utf8');
    assert.ok(journalContent.includes('Date,Supplier,Type,Amount,Drive Link,Status'));
    assert.ok(journalContent.includes(`15/06/2026,Sanitherm SA,invoice,"1 246,80 €",file:///`));
    assert.ok(journalContent.includes('processed'));
  }

  console.log(`Google Drive & Sheets ${isMock ? 'Mock' : 'REAL'} integration tests passed successfully!`);
}

main().catch((error) => {
  console.error('Integration tests failed:', error);
  process.exit(1);
});
