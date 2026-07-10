import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { google, drive_v3 } from 'googleapis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class GoogleDriveService {
  private readonly drive!: drive_v3.Drive;
  private readonly folderCache = new Map<string, string>();
  private readonly isMock: boolean;

  constructor() {
    const hasServiceAccount = !!(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
    const hasOAuth = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);

    this.isMock = env.GOOGLE_INTEGRATION_MOCK || (!hasServiceAccount && !hasOAuth);

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
          this.drive = google.drive({ version: 'v3', auth: oauth2Client });
          logger.info('Google Drive service initialized in REAL mode (OAuth2 User Flow)');
        } else {
          const auth = new google.auth.JWT({
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/drive'],
          });
          this.drive = google.drive({ version: 'v3', auth });
          logger.info('Google Drive service initialized in REAL mode (Service Account)');
        }
      } catch (error) {
        logger.error({ err: error }, 'Failed to initialize real Google Drive client. Falling back to MOCK mode.');
        this.isMock = true;
      }
    }

    if (this.isMock) {
      logger.info('Google Drive service initialized in MOCK mode');
    }
  }

  public async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    year: string,
    month: string,
    docType: string,
    uploaderEmail?: string
  ): Promise<{ fileId: string; webViewLink: string }> {
    if (this.isMock) {
      return this.uploadFileMock(fileBuffer, filename, year, month, docType, uploaderEmail);
    }

    let parentFolderId: string;
    let targetFileName = filename;
    let resolvedNested = false;

    try {
      parentFolderId = await this.resolveFolderId(year, month, docType, uploaderEmail);
      resolvedNested = true;
    } catch (resolveError) {
      logger.warn(
        { err: resolveError, filename },
        'Failed to resolve nested folder path in Google Drive. Falling back to root project folder.'
      );
      parentFolderId = env.GOOGLE_DRIVE_FOLDER_ID || 'root';
      const emailPrefix = uploaderEmail ? `${uploaderEmail.replace(/[@.]/g, '_')}_` : '';
      targetFileName = `${emailPrefix}${year}_${month}_${docType}_${filename}`;
    }

    try {
      const fileMetadata = {
        name: targetFileName,
        parents: [parentFolderId],
      };

      const media = {
        mimeType: 'application/octet-stream',
        body: Readable.from(fileBuffer),
      };

      logger.info({ filename: targetFileName, parentFolderId }, 'Uploading file to Google Drive...');
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
        supportsAllDrives: true,
      });

      if (!response.data.id || !response.data.webViewLink) {
        if (resolvedNested) {
          throw new Error('Google Drive API returned empty response data');
        } else {
          logger.warn('Failed to upload to root folder. Falling back to mock.');
          return this.uploadFileMock(fileBuffer, filename, year, month, docType, uploaderEmail);
        }
      }

      const fileId = response.data.id!;
      const webViewLink = response.data.webViewLink!;

      // Make the file readable by anyone with the link
      logger.info({ fileId }, 'Granting public read permission to file...');
      try {
        await this.drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
          supportsAllDrives: true,
        });
      } catch (permError) {
        logger.warn({ err: permError, fileId }, 'Could not make file public. It remains private.');
      }

      logger.info({ filename: targetFileName, fileId }, 'File successfully uploaded and shared on Google Drive');
      return { fileId, webViewLink };
    } catch (error) {
      logger.error({ err: error, filename }, 'Google Drive upload failed. Falling back to MOCK upload.');
      return this.uploadFileMock(fileBuffer, filename, year, month, docType, uploaderEmail);
    }
  }

  private async uploadFileMock(
    fileBuffer: Buffer,
    filename: string,
    year: string,
    month: string,
    docType: string,
    uploaderEmail?: string
  ): Promise<{ fileId: string; webViewLink: string }> {
    const uploadParts = ['Compta'];
    if (uploaderEmail) {
      uploadParts.push(uploaderEmail);
    }
    uploadParts.push(year, month, docType);
    
    const uploadDir = path.join(process.cwd(), 'uploads', ...uploadParts);
    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, fileBuffer);

    // Convert Windows paths to standard clickable file:// URLs with forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    const webViewLink = `file:///${normalizedPath}`;
    const fileId = `mock-drive-id-${Math.random().toString(36).substring(2, 11)}`;

    logger.info({ filePath, fileId }, 'File saved locally in simulated Google Drive storage');

    return { fileId, webViewLink };
  }

  private async resolveFolderId(year: string, month: string, docType: string, uploaderEmail?: string): Promise<string> {
    const comptaId = await this.getOrCreateFolder(['Compta']);
    
    const rootPath = ['Compta'];
    let parentId = comptaId;
    
    if (uploaderEmail) {
      rootPath.push(uploaderEmail);
      parentId = await this.getOrCreateFolder(['Compta', uploaderEmail], comptaId);
    }
    
    const yearId = await this.getOrCreateFolder([...rootPath, year], parentId);
    const monthId = await this.getOrCreateFolder([...rootPath, year, month], yearId);
    const docTypeId = await this.getOrCreateFolder([...rootPath, year, month, docType], monthId);
    return docTypeId;
  }

  private async getOrCreateFolder(pathParts: string[], parentId?: string): Promise<string> {
    const cacheKey = pathParts.join('/');
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)!;
    }

    const folderName = pathParts[pathParts.length - 1];
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps-folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    } else if (env.GOOGLE_DRIVE_FOLDER_ID) {
      query += ` and '${env.GOOGLE_DRIVE_FOLDER_ID}' in parents`;
    }

    logger.debug({ folderName, query }, 'Searching for folder in Google Drive...');
    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    let folderId = response.data.files?.[0]?.id;

    if (!folderId) {
      logger.info({ folderName }, 'Folder not found. Creating a new one in Google Drive...');
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps-folder',
        parents: parentId ? [parentId] : (env.GOOGLE_DRIVE_FOLDER_ID ? [env.GOOGLE_DRIVE_FOLDER_ID] : []),
      };

      const folder = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
        supportsAllDrives: true,
      });
      folderId = folder.data.id!;
    }

    this.folderCache.set(cacheKey, folderId);
    return folderId;
  }
}
