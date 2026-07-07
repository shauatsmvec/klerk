# Klerk Agent Instructions

## Agent Identity
- Agent: GitHub Copilot
- Model: MAI-Code-1-Flash
- Workspace: Klerk MVP project

## What I have implemented so far
- Initialized a TypeScript project with strict configuration
- Added environment validation and structured logging
- Created a domain model for documents and extraction results
- Added error handling foundation
- Created the Supabase database migration for the documents table
- Implemented an OCR service with fallback extraction
- Implemented classification and structured extraction services
- Implemented a document processing orchestration service
- Implemented duplicate detection and Supabase persistence
- Added CLI commands for OCR, classification, extraction, processing, persistence, testing, and retrieval
- Verified the flow end to end using the candidate dataset
- Implemented a simple Express API with health, readiness, and document upload endpoints

## Current project status
- Core document pipeline is implemented and working locally
- Documents can be processed and saved to Supabase
- Retrieval from the database is working
- The project is now moving toward a more polished MVP with tests, API exposure, and deployment readiness

## Working style
- Prefer clean, typed TypeScript code
- Keep the architecture modular: services, repositories, and domain models
- Validate changes by rebuilding and running the relevant CLI commands
- Keep documentation and progress notes updated as work progresses

## Next implementation priorities
1. Add stronger tests and verification coverage
2. Improve extraction quality for real document content
3. Add deployment and documentation polish for recruiter presentation
4. Expand the API with richer response payloads and validation
