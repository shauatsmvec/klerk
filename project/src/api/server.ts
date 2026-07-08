import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DuplicateDetectionService } from '../services/DuplicateDetectionService';
import { logger } from '../config/logger';
import { buildUploadResponse } from './response';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const publicDir = path.join(process.cwd(), 'public');

app.use(express.static(publicDir));
const documentService = new DocumentService();
const repository = new DocumentRepository();
const duplicateService = new DuplicateDetectionService(repository);

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req: Request, res: Response) => {
  res.json({ ready: true });
});

app.post('/api/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await documentService.processDocument(req.file.buffer, req.file.originalname);
    const duplicate = await duplicateService.detect(result.document.sha256Hash);
    const saved = await repository.save(result.document);

    const payload = buildUploadResponse({
      document: saved,
      duplicate,
      extraction: result.extraction,
      confidenceValidation: result.confidenceValidation,
      savedToDatabase: Boolean(saved.id),
    });

    return res.json(payload);
  } catch (error) {
    logger.error({ err: error }, 'Upload processing failed');
    return res.status(500).json({ error: 'Failed to process document' });
  }
});

export function startServer(port = 3000): void {
  app.listen(port, () => {
    logger.info({ port }, 'Klerk API listening');
  });
}
