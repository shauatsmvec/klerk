# Implementation Plan: Background Queue & WhatsApp Simulation

This plan introduces background task scheduling/queue processing with `pg-boss` and implements a WhatsApp webhook simulation ingestion flow.

---

## Proposed Changes

### 1. Dependencies & Environment
* **Library Integration**: Installed `pg-boss` to orchestrate background queues.
* **Storage Provider**: Backed by PostgreSQL (Supabase database integration).

### 2. Queue Infrastructure
* **QueueService.ts**:
  * Initializes the `PgBoss` client using the Supabase database connection string (`DATABASE_URL`).
  * Explicitly verifies/creates the `document-processing` queue table inside the database on startup.
  * Registers background workers to receive enqueued tasks, handling the array-wrapped job data passed by `pg-boss` v9.

### 3. API & Webhook Simulation
* **server.ts**:
  * Configured `express.json()` parser middleware to support incoming webhook JSON payloads.
  * Created `POST /api/webhooks/whatsapp` to download files to a local temp buffer, save it inside `uploads/tmp/`, enqueue a `document-processing` task, and return a `202 Accepted` status with the `jobId`.
  * Created `GET /api/jobs/:id` status check endpoint to retrieve the execution state of background tasks (`created`, `active`, `completed`, `failed`).

---

## Verification Plan

### Integration Testing
* Created `tests/QueueSimulation.test.ts` to boot the server and queue, trigger a webhook post request, poll the job status until it is `completed`, and assert database persistence.
