# Klerk Usage & Deployment Guide

This document provides a comprehensive run guide for Klerk in Windows Command Prompt (CMD), detailing CLI commands, development scripts, test runners, and containerized Docker deployments.

---

## 🛠️ Environment Configuration

Before running any commands, make sure the project directory contains a `.env` file with valid values. Run all commands from the `project/` directory:
```cmd
cd project
```

---

## 💻 CLI Commands (Developer Reference)

The CLI tools let you test individual components of the ingestion pipeline manually.

### 1. Run OCR Extraction
Extracts OCR text from a local PDF or image.
* **Command**:
  ```cmd
  npx ts-node src/cli/ocr.ts --file tests/sample_invoice.pdf
  ```
* **Reason to run**: Verifies that the OCR parser is reading file contents successfully and outputting text.

### 2. Run Classification
Categorizes text content as an invoice, receipt, or other.
* **Command**:
  ```cmd
  npx ts-node src/cli/classify.ts --text "Facture de service Sanitherm SA Total 120 EUR"
  ```
* **Reason to run**: Tests the classification engine rules to verify it detects document type correctly.

### 3. Run Structured Field Extraction
Parses fields (date, total, supplier) from raw text.
* **Command**:
  ```cmd
  npx ts-node src/cli/extract.ts --text "Facture de Sanitherm SA du 15/06/2026 Total TTC: 1246,80 EUR"
  ```
* **Reason to run**: Validates the regular expression parsing rules against French document formats.

### 4. Process Local Document (End-to-End Core Pipeline)
Runs OCR, classifies, extracts metadata, uploads to Google Drive, and appends to Google Sheets.
* **Command**:
  ```cmd
  npx ts-node src/cli/process-file.ts --file tests/sample_invoice.pdf
  ```
* **Reason to run**: Runs the full document processing pipeline synchronously on a local file, uploading it to Drive and logging it on Sheets.

---

## 🧪 Testing Suites

Run these tests from the `project/` folder to verify system integrity.

### 1. Run Regex Regression Tests
Runs assertions for various invoice formats and spacing variations.
* **Command**:
  ```cmd
  npx ts-node tests/SupplierInvoiceExtractor.regression.test.ts
  ```
* **Reason to run**: Ensures no new changes have broken parsing capability on French invoices.

### 2. Run Google OAuth Integration Tests
Verifies real API connection to Google Drive and Sheets.
* **Command**:
  ```cmd
  npx ts-node tests/GoogleIntegration.test.ts
  ```
* **Reason to run**: Verifies that your OAuth token is active, uploads files to Drive, and appends rows to your spreadsheet in real mode.

### 3. Run Queue & Webhook Simulation Tests
Verifies background task worker and simulated WhatsApp webhook.
* **Command**:
  ```cmd
  npx ts-node tests/QueueSimulation.test.ts
  ```
* **Reason to run**: Bootstraps the Express API, triggers the WhatsApp webhook, starts the background job, and polls job state until completion.

---

## 🐳 Docker Deployment Guide

To deploy Klerk using Docker containers:

### 1. Build and Run Containerized API + Worker
Orchestrates the Express API and background worker on port `3000` using the production environment.
* **Command**:
  ```cmd
  docker-compose up --build
  ```
* **Reason to run**: Compiles the TypeScript application inside a minimal, multi-stage alpine node container and runs the web app and task workers.

### 2. Stop and Clean Up Containers
Stops and removes containers, freeing up local port binds.
* **Command**:
  ```cmd
  docker-compose down
  ```
* **Reason to run**: Gracefully shuts down the running containers.
