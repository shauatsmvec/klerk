# Project Roadblocks & Solutions

During the Klerk document pipeline sprint, we encountered several complex technical challenges across database connections, queue models, and external Google APIs. This document reviews these roadblocks, their root causes, and how we solved them.

---

## 1. Google Drive Service Account Quota Exhaustion

### The Roadblock
While uploading invoice files to Google Drive, the Service Account threw the following exception:
```text
GaxiosError: The user's Drive storage quota has been exceeded.
(Code: 403, Reason: storageQuotaExceeded)
```

### Root Cause
* Service Accounts are isolated entities that belong to a Google Cloud project, not to your personal Google Drive account.
* Service Accounts have a strict **0-byte storage limit** by default when trying to write to folders shared by external personal accounts.

### The Solution
We replaced the Service Account credential configuration with a **modern OAuth 2.0 User Flow**:
1. Authorized a dedicated Restricted User Token (`drive.file` and `spreadsheets` scopes) through the Google OAuth Playground.
2. Configured the application with a `refresh_token`, allowing the system to automatically retrieve fresh access tokens in the background.
3. This runs all uploads directly in the context of the user's Google Drive account, resolving the storage quota constraint.

---

## 2. Google Drive Nested Folder Sandbox Restriction

### The Roadblock
When the application attempted to dynamically create year/month subfolders (e.g. `Compta/2026/06/invoice`) inside the root project directory, Google Drive API rejected it:
```text
GaxiosError: The specified parent is not a folder.
(Code: 403, Reason: parentNotAFolder)
```

### Root Cause
* Because the GCP Application is in **"Testing" mode (unverified)** and operates under the narrow `drive.file` scope, Google Drive blocks programmatical nesting of directories (writing files inside folders created by the app itself) for security reasons on personal Gmail accounts.
* Checking the metadata of programmatically created folders showed `"canAddChildren": false`.

### The Solution
We implemented a self-healing **Flat-Upload Fallback**:
1. Added error-handling inside `GoogleDriveService` to catch directory nesting failures (`parentNotAFolder` or `GaxiosError`).
2. If nesting fails, the application automatically uploads the file flatly directly into the root project folder, using path-based prefixes (e.g., `2026_06_invoice_filename.pdf`).
3. This guarantees that files are always safely stored and never lost, even in a testing sandbox. Once the GCP App is published to production, nesting will automatically resume.

---

## 3. pg-boss v9 Worker Callback Array Wrapper

### The Roadblock
After initializing the background task worker with `pg-boss` and enqueuing a WhatsApp media processing job, the worker failed with:
```text
TypeError: Cannot read properties of undefined (reading 'filePath')
```

### Root Cause
* In `pg-boss` versions prior to v9, the worker callback `boss.work` passed a single job object (e.g., `job.data`) to the callback handler.
* In `pg-boss` v9+, `boss.work` passes an **array of jobs** by default (supporting batch processing) even if no batch size options are declared.

### The Solution
We updated our queue worker registration logic in `QueueService` to support the array structure:
```typescript
await this.boss.work(queueName, async (jobs: any) => {
  // Extract the single job from the array
  const job = Array.isArray(jobs) ? jobs[0] : jobs;
  if (!job) return;

  // Pass job data to core processor
  await handler(job.data);
});
```

---

## 4. Supabase Database DNS Host Resolution Error

### The Roadblock
While starting the task queue service, connection to the database crashed with:
```text
Error: getaddrinfo ENOTFOUND db.bvvteeubflfychaajchq.supabase.co
```

### Root Cause
* On the Supabase Free Tier, if a database sits idle for several days, Supabase **pauses** the project and temporarily deletes its direct DNS records (`db.<project-ref>.supabase.co`), causing host lookups to throw `ENOTFOUND`.
* Additionally, Supabase has migrated newer database connections to pooled addresses.

### The Solution
1. Resumed the project inside the Supabase Dashboard, which restored the database container.
2. Switched the `DATABASE_URL` connection host from the legacy direct domain to the Tokyo region transaction pooler:
   ```text
   aws-0-ap-northeast-1.pooler.supabase.com:6543
   ```
   This pooler host is highly resilient, supports connection pooling, and resolves successfully.
