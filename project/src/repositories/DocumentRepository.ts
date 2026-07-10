import { Pool } from 'pg';
import { env } from '../config/env';
import { Document } from '../domain/Document';
import { DocumentRecord, DocumentStatus, DocumentType, ExtractionResult } from '../domain/types';
import { IRepository } from './IRepository';

export class DocumentRepository implements IRepository<Document> {
  private readonly pool: Pool;

  constructor(connectionString = env.DATABASE_URL) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  public async save(document: Document): Promise<Document> {
    const query = `
      INSERT INTO documents (
        id,
        original_filename,
        mime_type,
        sha256_hash,
        document_type,
        status,
        ocr_text,
        extraction_data,
        supplier_name,
        document_date,
        due_date,
        total_ttc,
        drive_file_id,
        drive_web_view_link,
        uploader_phone,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (sha256_hash) DO UPDATE SET
        status = EXCLUDED.status,
        uploader_phone = COALESCE(documents.uploader_phone, EXCLUDED.uploader_phone),
        updated_at = NOW()
      RETURNING *;
    `;

    // PostgreSQL rejects null bytes (\x00) in text columns
    const sanitize = (val: string | null): string | null =>
      val ? val.replace(/\x00/g, '') : val;

    const values = [
      document.id,
      document.originalFilename,
      document.mimeType,
      document.sha256Hash,
      document.documentType,
      document.status,
      sanitize(document.ocrText),
      sanitize(JSON.stringify(document.extractionData)),
      sanitize(document.supplierName),
      document.documentDate,
      document.dueDate,
      sanitize(document.totalTtc),
      document.driveFileId,
      document.driveWebViewLink,
      document.uploaderPhone,
      document.createdAt,
      document.updatedAt,
    ];

    const result = await this.pool.query(query, values);
    return new Document(result.rows[0] as DocumentRecord);
  }

  public async findById(id: string): Promise<Document | null> {
    const result = await this.pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0] ? new Document(result.rows[0] as DocumentRecord) : null;
  }

  public async findByHash(hash: string): Promise<Document | null> {
    const result = await this.pool.query('SELECT * FROM documents WHERE sha256_hash = $1', [hash]);
    return result.rows[0] ? new Document(result.rows[0] as DocumentRecord) : null;
  }

  public async findByUploader(phone: string): Promise<Document[]> {
    const result = await this.pool.query('SELECT * FROM documents WHERE uploader_phone = $1 ORDER BY created_at DESC', [phone]);
    return result.rows.map(row => new Document(row as DocumentRecord));
  }

  public async findAll(): Promise<Document[]> {
    const result = await this.pool.query('SELECT * FROM documents ORDER BY created_at DESC');
    return result.rows.map(row => new Document(row as DocumentRecord));
  }
}
