import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { promises as fs } from 'fs';
import mime from 'mime-types';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(localPath, s3Key) {
  const fileContent = await fs.readFile(localPath);
  const contentType = mime.lookup(localPath) || 'application/octet-stream';

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read', // Optional
    },
  });

  upload.on('httpUploadProgress', (progress) => {
    console.log('Upload progress:', progress);
  });

  const result = await upload.done();
  console.log('✅ Upload successful:', result);
  return result;
}
