# Klerk Project Status

## Current Status
The Klerk MVP is now in a working early stage. The project has a TypeScript foundation, a document processing pipeline, Supabase persistence, duplicate detection, and CLI-based testing and retrieval.

## What is working
- TypeScript project boots and builds successfully
- OCR, classification, extraction, and orchestration services are implemented
- Extraction logic now handles common French invoice labels more reliably
- Documents can be processed from sample data and from files in the candidate dataset
- Processed documents can be saved to Supabase
- Saved documents can be retrieved from the database
- Manual CLI commands exist for testing each stage
- Dedicated regression test suite is added to verify French invoice formatting and text extraction (`tests/SupplierInvoiceExtractor.regression.test.ts`)
- A simple HTTP API is running locally with health, readiness, and upload endpoints
- Google Drive and Sheets integration is implemented with local mock storage and sheet csv mirror logging (`tests/GoogleIntegration.test.ts`)

## Current implementation highlights
- Core services: OCR, classification, extraction, confidence validation, document orchestration
- Persistence: Supabase-backed document repository
- Integration: Google Drive and Google Sheets APIs with robust mock fallback
- Data flow: document -> OCR -> classification -> extraction -> validation -> duplicate check -> Drive upload -> Sheets journal log -> save

## Remaining work by day
### Day 1
- Project setup completed
- TypeScript foundation, environment config, logging, domain model, error handling
- Supabase schema created

### Day 2
- OCR pipeline implemented
- Classification and extraction implemented
- Confidence validation implemented
- Manual CLI testing implemented
- Persistence and duplicate detection implemented

### Day 3
- Add stronger integration tests
- Add retrieval and search-friendly workflows
- Improve the extraction logic for more realistic real-document parsing

### Day 4
- Simple HTTP API for document upload and processing implemented
- Health and readiness endpoints implemented
- Error handling and logging for API usage added
- Google Drive upload and Sheets accounting journal logging implemented

### Day 5
- Add a WhatsApp-style simulation flow
- Implement pg-boss queue infrastructure and background workers
- Make the MVP more demo-friendly

### Day 6
- Polish documentation and README
- Add deployment preparation
- Final testing, demo script, and presentation readiness

## Next immediate priorities
1. Implement the pg-boss queue infrastructure and background workers (Day 5).
2. Create simulated WhatsApp webhook handlers.
3. Polish the project for recruiter presentation and deployment (Day 6).

## Latest update
- Migrated Google Drive & Sheets integration from legacy Service Accounts to a modern OAuth 2.0 User Flow to resolve Service Account storage quota limits (403 storageQuotaExceeded).
- Configured restricted `drive.file` and `spreadsheets` scopes to satisfy Google API security requirements.
- Implemented a robust fallback mechanism in `GoogleDriveService`: if directory nesting fails (due to account or API restrictions throwing `parentNotAFolder`), the system automatically uploads the file flatly with a path-based prefix (e.g. `2026_06_invoice_filename.pdf`) directly to the root project folder.
- Verified the complete OAuth integration end-to-end; verified that integration tests successfully pass in REAL mode, creating real files on Google Drive and appending real transaction rows to the Google Spreadsheet.
- *Note on folder nesting*: For now, the application uses the flat-upload fallback strategy to support Google's unverified API testing sandbox. Once the entire application is completed, the user will transition to **Option C** (publishing the GCP app to Production in the Google Cloud Console) to automatically enable the full programmatical folder nesting structure (`Compta/Year/Month/DocumentType`).
- **Background Queue & Webhooks**: Installed and configured `pg-boss` utilizing Supabase's transaction pooler. Implemented the simulated WhatsApp webhook and polling APIs. Verified the entire asynchronous flow end-to-end via automated integration test.

## Checkpoint Bookmark
- **Status Date**: July 9, 2026
- **Current Checkpoint**: pg-boss background job queue and WhatsApp simulation webhook are fully implemented and verified end-to-end.
- **Where to Resume next time**:
  1. Prepare application presentation materials and README documentation polish (Day 6).
  2. Configure deployment options and final verification.
