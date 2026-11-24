import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'hallsanr-media';

/**
 * Uploads a file buffer to Azure Blob Storage, or saves to /public/uploads as local fallback.
 */
export async function uploadMediaFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; storageType: 'azure' | 'local' }> {
  // Sanitize filename and prepend timestamp
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${Date.now()}-${sanitizedName}`;

  // If Azure Storage Connection String is provided, upload to Azure Blob Storage
  if (AZURE_STORAGE_CONNECTION_STRING) {
    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

      // Ensure container exists with public access for blobs
      await containerClient.createIfNotExists({
        access: 'blob',
      });

      const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      return {
        url: blockBlobClient.url,
        storageType: 'azure',
      };
    } catch (azureError) {
      console.error('Failed to upload to Azure Blob Storage, falling back to local:', azureError);
    }
  }

  // Local fallback: Save to public/uploads directory
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, uniqueName);
  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    url: `/uploads/${uniqueName}`,
    storageType: 'local',
  };
}
