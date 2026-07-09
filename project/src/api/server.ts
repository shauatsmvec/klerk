import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DuplicateDetectionService } from '../services/DuplicateDetectionService';
import { logger } from '../config/logger';
import { buildUploadResponse } from './response';
import { QueueService } from '../queue/QueueService';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const publicDir = path.join(process.cwd(), 'public');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.static(publicDir));

const documentService = new DocumentService();
const repository = new DocumentRepository();
const duplicateService = new DuplicateDetectionService(repository);
const queueService = QueueService.getInstance();

// Helpers
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file, status code: ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}

// Background Worker handler (registered after pg-boss starts)
async function documentWorkerHandler(jobData: { filePath: string; originalName: string }) {
  logger.info({ filePath: jobData.filePath }, 'Background worker processing document');
  
  if (!fs.existsSync(jobData.filePath)) {
    throw new Error(`File not found at path: ${jobData.filePath}`);
  }

  const fileBuffer = fs.readFileSync(jobData.filePath);
  
  try {
    const result = await documentService.processDocument(fileBuffer, jobData.originalName);
    const duplicate = await duplicateService.detect(result.document.sha256Hash);
    await repository.save(result.document);
    logger.info({ originalName: jobData.originalName }, 'Background document processing complete');
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(jobData.filePath);
    } catch (cleanupErr) {
      logger.warn({ err: cleanupErr }, 'Failed to clean up temporary file');
    }
  }
}

// SIGTERM hook for clean stop
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Stopping server and queue...');
  await queueService.stop();
  process.exit(0);
});

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/ready', (_req: Request, res: Response) => {
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

// Graph API Media download utility
async function downloadMetaMedia(mediaId: string): Promise<Buffer> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('WHATSAPP_ACCESS_TOKEN environment variable is not configured');
  }

  // 1. Fetch metadata from Graph API to retrieve download URL
  const metaUrl = `https://graph.facebook.com/v20.0/${mediaId}`;
  const responseBody = await new Promise<string>((resolve, reject) => {
    https.get(metaUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });

  const { url } = JSON.parse(responseBody);
  if (!url) {
    throw new Error(`Failed to retrieve download URL from Meta Graph API for media ID: ${mediaId}`);
  }

  // 2. Download raw file attachment binary
  return new Promise<Buffer>((resolve, reject) => {
    https.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download Meta media file, status: ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });
}

// Meta Handshake verification
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'klerk_verify_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      logger.warn({ token }, 'WhatsApp webhook verification failed: Token mismatch');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

app.post('/api/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    let from = 'unknown';
    let mediaName = 'whatsapp_document.pdf';
    let fileBuffer: Buffer | null = null;

    // Check if real Meta Webhook payload is present
    if (req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = req.body.entry[0].changes[0].value.messages[0];
      from = message.from || 'unknown';

      let mediaId: string | null = null;
      if (message.type === 'document' && message.document) {
        mediaId = message.document.id;
        mediaName = message.document.filename || 'whatsapp_document.pdf';
      } else if (message.type === 'image' && message.image) {
        mediaId = message.image.id;
        mediaName = 'whatsapp_image.jpg';
      }

      if (!mediaId) {
        logger.info({ messageType: message.type }, 'Received non-media Meta WhatsApp event. Acknowledged.');
        return res.sendStatus(200);
      }

      logger.info({ mediaId, mediaName, from }, 'Received real Meta WhatsApp webhook media event');
      fileBuffer = await downloadMetaMedia(mediaId);
    } else {
      // Local simulator fallback
      const { from: simFrom, mediaUrl, mediaName: simMediaName } = req.body;
      if (!mediaUrl || !simMediaName) {
        return res.status(400).json({ error: 'Missing mediaUrl or mediaName for simulation' });
      }

      from = simFrom || 'unknown';
      mediaName = simMediaName;
      logger.info({ from, mediaUrl, mediaName }, 'Received simulated WhatsApp message webhook');

      try {
        fileBuffer = await downloadFile(mediaUrl);
      } catch (downloadError: any) {
        logger.warn(
          { err: downloadError.message, mediaUrl },
          'Failed to download WhatsApp media. Falling back to structured dummy buffer.'
        );
        fileBuffer = Buffer.from(
          `Supplier: Sanitherm SA\nDocument date: 15/06/2026\nTotal TTC: 1246,80 €\n`
        );
      }
    }

    const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFilePath = path.join(tmpDir, `${Date.now()}-${mediaName}`);
    fs.writeFileSync(tmpFilePath, fileBuffer);

    const jobId = await queueService.sendJob('document-processing', {
      filePath: tmpFilePath,
      originalName: mediaName,
      from,
    });

    return res.status(202).json({
      status: 'accepted',
      jobId,
      message: 'Document enqueued for processing',
    });
  } catch (error) {
    logger.error({ err: error }, 'WhatsApp webhook processing failed');
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
});

app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id as string;
    const state = await queueService.getJobStatus(jobId);
    if (!state) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json({ jobId, state });
  } catch (error) {
    logger.error({ err: error, jobId: req.params.id }, 'Failed to check job status');
    return res.status(500).json({ error: 'Failed to check job status' });
  }
});

app.get('/api/documents', async (req: Request, res: Response) => {
  try {
    const docs = await repository.findAll();
    return res.json(docs);
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch documents');
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

export async function startServer(port = 3001): Promise<void> {
  await queueService.start();
  await queueService.registerWorker('document-processing', documentWorkerHandler);
  app.listen(port, () => {
    logger.info({ port }, 'Klerk API listening');
  });
}
