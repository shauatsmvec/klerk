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

## Current implementation highlights
- Core services: OCR, classification, extraction, confidence validation, document orchestration
- Persistence: Supabase-backed document repository
- Data flow: document -> OCR -> classification -> extraction -> validation -> duplicate check -> save

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

### Day 5
- Add Google Drive and Google Sheets integration
- Add a WhatsApp-style simulation flow
- Make the MVP more demo-friendly

### Day 6
- Polish documentation and README
- Add deployment preparation
- Final testing, demo script, and presentation readiness

## Next immediate priorities
1. Add automated tests for the main services
2. Improve extraction quality for real-world documents
3. Polish the project for recruiter presentation and deployment
4. Expand the API with richer validation and response payloads

## Latest update
- Fixed a greedy regex quantifier bug in supplier name extraction by switching to a non-greedy matcher and adding more lookup boundaries (like `client`, `adresse`, etc.).
- Created a robust regression test suite matching multiple French invoice labels, noisy OCR text segments, and fallback values.
- Confirmed that the project builds successfully and the entire test suite passes.

## Checkpoint Bookmark
- **Status Date**: July 7, 2026
- **Current Checkpoint**: Regression tests verified and build is fully functional.
- **Where to Resume next time**:
  1. Set up the Google Drive integration (Compta/Year/Month/DocumentType folder caching & upload).
  2. Implement the Google Sheets accounting journal append.
  3. Implement pg-boss queue infrastructure and simulated WhatsApp webhook handlers.
