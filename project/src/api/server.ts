import express, { Request, Response } from 'express';
import multer from 'multer';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DuplicateDetectionService } from '../services/DuplicateDetectionService';
import { logger } from '../config/logger';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const documentService = new DocumentService();
const repository = new DocumentRepository();
const duplicateService = new DuplicateDetectionService(repository);

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

    return res.json({
      message: 'Document processed successfully',
      duplicate,
      document: {
        id: saved.id,
        filename: saved.originalFilename,
        status: saved.status,
        documentType: saved.documentType,
      },
      extraction: result.extraction,
      confidence: result.confidenceValidation,
    });
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
