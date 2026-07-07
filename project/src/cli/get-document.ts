import { DocumentRepository } from '../repositories/DocumentRepository';

async function main(): Promise<void> {
  const repository = new DocumentRepository();
  const id = process.argv[2];

  if (!id) {
    console.error('Usage: npm run get-document -- <id>');
    process.exit(1);
  }

  const document = await repository.findById(id);
  if (!document) {
    console.log(JSON.stringify({ found: false }, null, 2));
    return;
  }

  console.log(JSON.stringify({
    found: true,
    id: document.id,
    filename: document.originalFilename,
    status: document.status,
    type: document.documentType,
    supplier: document.supplierName,
    total: document.totalTtc,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
