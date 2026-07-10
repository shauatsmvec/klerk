import { Pool } from 'pg';
import { env } from '../config/env';

export interface PendingDocument {
  id?: string;
  phoneNumber: string;
  phoneNumberId: string;
  filename: string;
  tempFilePath: string;
  supplierName: string | null;
  totalTtc: string | null;
  createdAt?: Date;
}

export class PendingDocumentRepository {
  private readonly pool: Pool;

  constructor(connectionString = env.DATABASE_URL) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  public async savePending(doc: PendingDocument): Promise<void> {
    const query = `
      INSERT INTO pending_documents (
        phone_number,
        phone_number_id,
        filename,
        temp_file_path,
        supplier_name,
        total_ttc
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (phone_number) DO UPDATE SET
        phone_number_id = EXCLUDED.phone_number_id,
        filename = EXCLUDED.filename,
        temp_file_path = EXCLUDED.temp_file_path,
        supplier_name = EXCLUDED.supplier_name,
        total_ttc = EXCLUDED.total_ttc,
        created_at = NOW();
    `;
    const values = [
      doc.phoneNumber,
      doc.phoneNumberId,
      doc.filename,
      doc.tempFilePath,
      doc.supplierName,
      doc.totalTtc
    ];
    await this.pool.query(query, values);
  }

  public async getPending(phoneNumber: string): Promise<PendingDocument | null> {
    const query = `
      SELECT id, phone_number AS "phoneNumber", phone_number_id AS "phoneNumberId", filename, temp_file_path AS "tempFilePath", supplier_name AS "supplierName", total_ttc AS "totalTtc", created_at AS "createdAt"
      FROM pending_documents
      WHERE phone_number = $1;
    `;
    const res = await this.pool.query(query, [phoneNumber]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  }

  public async deletePending(phoneNumber: string): Promise<void> {
    const query = `
      DELETE FROM pending_documents
      WHERE phone_number = $1;
    `;
    await this.pool.query(query, [phoneNumber]);
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
