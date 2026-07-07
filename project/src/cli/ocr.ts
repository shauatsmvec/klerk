import { OcrService } from '../services/OcrService';

async function main(): Promise<void> {
  const service = new OcrService();
  const buffer = Buffer.from('Invoice for sample testing');
  const result = await service.extractText(buffer, 'manual-test.pdf');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
