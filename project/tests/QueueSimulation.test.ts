import assert from 'assert';
import http from 'http';
import { startServer } from '../src/api/server';
import { QueueService } from '../src/queue/QueueService';
import { DocumentRepository } from '../src/repositories/DocumentRepository';
import { logger } from '../src/config/logger';

function postJson(url: string, data: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

function getJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', (e) => reject(e));
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log('Starting Queue & WhatsApp Webhook Simulation integration tests...');

  // 1. Start Server on port 3001
  const port = 3001;
  await startServer(port);
  console.log(`Server and pg-boss queue started on port ${port}`);

  // 2. Trigger WhatsApp webhook simulation
  const webhookUrl = `http://localhost:${port}/api/webhooks/whatsapp`;
  const webhookPayload = {
    from: '+33612345678',
    mediaUrl: 'https://raw.githubusercontent.com/pdf-association/pdf-test-suite/master/pdf-test-suite.pdf',
    mediaName: 'whatsapp_invoice.pdf',
  };

  console.log('Sending POST request to WhatsApp simulation webhook...');
  const webhookResponse = await postJson(webhookUrl, webhookPayload);
  console.log('Webhook Response:', webhookResponse);

  assert.strictEqual(webhookResponse.status, 'accepted');
  assert.ok(webhookResponse.jobId, 'Response should contain a jobId');

  const jobId = webhookResponse.jobId;

  // 3. Poll job status
  const statusUrl = `http://localhost:${port}/api/jobs/${jobId}`;
  let state = 'created';
  const maxRetries = 15;
  let attempts = 0;

  console.log(`Polling job status for Job ID ${jobId}...`);
  while (state !== 'completed' && state !== 'failed' && attempts < maxRetries) {
    await sleep(2000);
    const statusRes = await getJson(statusUrl);
    state = statusRes.state;
    attempts++;
    console.log(`Attempt ${attempts}: Job state is "${state}"`);
  }

  assert.strictEqual(state, 'completed', 'Job should finish with completed state');

  // 4. Verify Document Repository persistence
  const repository = new DocumentRepository();
  const crypto = require('crypto');
  const expectedHash = crypto.createHash('sha256').update(
    Buffer.from(`Supplier: Sanitherm SA\nDocument date: 15/06/2026\nTotal TTC: 1246,80 €\n`)
  ).digest('hex');

  const matchedDoc = await repository.findByHash(expectedHash);
  
  assert.ok(matchedDoc, 'Document must be persisted in Supabase database');
  assert.strictEqual(matchedDoc.documentType, 'invoice');
  assert.ok(matchedDoc.supplierName, 'Supplier name must be non-null');
  assert.ok(matchedDoc.supplierName.includes('Sanitherm SA'), 'Supplier name should extract successfully from fallback buffer');
  console.log('Persisted Document Verification succeeded:', {
    id: matchedDoc.id,
    originalFilename: matchedDoc.originalFilename,
    supplierName: matchedDoc.supplierName,
    totalTtc: matchedDoc.totalTtc,
  });

  // 5. Shutdown queue and stop process
  console.log('Stopping pg-boss queue...');
  await QueueService.getInstance().stop();
  console.log('Queue & Webhook Simulation tests passed successfully!');
  process.exit(0);
}

main().catch(async (error) => {
  console.error('Queue Simulation test failed:', error);
  try {
    await QueueService.getInstance().stop();
  } catch {}
  process.exit(1);
});
