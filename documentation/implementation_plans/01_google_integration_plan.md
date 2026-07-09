# Implementation Plan: Google Drive & Sheets Integration

This plan details the migration of Google Drive & Sheets integrations from legacy Service Accounts to a modern, user-authenticated OAuth 2.0 flow.

---

## Proposed Changes

### 1. OAuth 2.0 User Flow Migration
* **Problem**: Service accounts have 0-byte storage quotas when writing to shared folders owned by personal Gmail accounts, causing `storageQuotaExceeded` (403) errors.
* **Solution**:
  - Replaced the Service Account private key authentication in `GoogleDriveService` and `GoogleSheetsService` with a user-owned Google OAuth 2.0 `refresh_token` and client credentials.
  - Hardened access scopes to the restricted `drive.file` and `spreadsheets` scopes.

### 2. Self-Healing Folder Nesting
* **Problem**: Unverified GCP projects under GCP "Testing" status are restricted by Google API from adding files/children to programmatically created folders in My Drive, causing `parentNotAFolder` (403) errors.
* **Solution**:
  - Updated `GoogleDriveService` to catch folder resolution errors.
  - Implemented a self-healing fallback that uploads files flatly directly into the root folder using path-based prefixes (e.g. `2026_06_invoice_sample_invoice.pdf`).

---

## Verification Plan

### Integration Testing
* Updated `tests/GoogleIntegration.test.ts` to run in real mode by checking `GOOGLE_DRIVE_MOCK=false`.
* Asserted that files are created on Google Drive and rows are appended to the transaction log spreadsheet.
