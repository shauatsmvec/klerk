import fs from 'fs';
import path from 'path';
import { google, sheets_v4 } from 'googleapis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class GoogleSheetsService {
  private readonly sheets!: sheets_v4.Sheets;
  private readonly isMock: boolean;

  constructor() {
    const hasServiceAccount = !!(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
    const hasOAuth = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);

    this.isMock =
      env.GOOGLE_INTEGRATION_MOCK ||
      (!hasServiceAccount && !hasOAuth) ||
      !env.GOOGLE_SHEET_ID;

    if (!this.isMock) {
      try {
        if (hasOAuth) {
          const oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
          );
          oauth2Client.setCredentials({
            refresh_token: env.GOOGLE_REFRESH_TOKEN,
          });
          this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
          logger.info('Google Sheets service initialized in REAL mode (OAuth2 User Flow)');
        } else {
          const auth = new google.auth.JWT({
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });
          this.sheets = google.sheets({ version: 'v4', auth });
          logger.info('Google Sheets service initialized in REAL mode (Service Account)');
        }
      } catch (error) {
        logger.error({ err: error }, 'Failed to initialize real Google Sheets client. Falling back to MOCK mode.');
        this.isMock = true;
      }
    }

    if (this.isMock) {
      logger.info('Google Sheets service initialized in MOCK mode');
    }
  }

  public async appendRow(
    date: string,
    supplier: string,
    docType: string,
    amount: string,
    driveLink: string,
    status: string,
    uploaderEmail?: string
  ): Promise<void> {
    if (this.isMock) {
      return this.appendRowMock(date, supplier, docType, amount, driveLink, status, uploaderEmail);
    }

    try {
      const values = [[date, supplier, docType, amount, driveLink, status, uploaderEmail || '']];
      logger.info({ sheetId: env.GOOGLE_SHEET_ID, values }, 'Appending row to Google Sheets...');

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: env.GOOGLE_SHEET_ID!,
        range: 'A:G',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });

      logger.info('Successfully appended row to Google Sheets');
    } catch (error) {
      logger.error({ err: error }, 'Google Sheets append failed. Falling back to MOCK sheets append.');
      return this.appendRowMock(date, supplier, docType, amount, driveLink, status, uploaderEmail);
    }
  }

  private async appendRowMock(
    date: string,
    supplier: string,
    docType: string,
    amount: string,
    driveLink: string,
    status: string,
    uploaderEmail?: string
  ): Promise<void> {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const journalPath = path.join(uploadDir, 'accounting_journal.csv');
    const header = 'Date,Supplier,Type,Amount,Drive Link,Status,Uploader\n';

    if (!fs.existsSync(journalPath)) {
      fs.writeFileSync(journalPath, header);
    }

    const escape = (val: string) => {
      const escaped = (val || '').replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
        ? `"${escaped}"`
        : escaped;
    };

    const row = `${escape(date)},${escape(supplier)},${escape(docType)},${escape(amount)},${escape(driveLink)},${escape(status)},${escape(uploaderEmail || '')}\n`;
    fs.appendFileSync(journalPath, row);

    logger.info({ journalPath, row: row.trim() }, 'Appended row to local simulated Google Sheets journal');
  }
}
