import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

// console.log('Key:', process.env.DO_SPACES_KEY);
// console.log('Secret:', process.env.DO_SPACES_SECRET);
// console.log('Bucket:', process.env.DO_SPACES_BUCKET);

export const s3 = new S3Client({
    region: 'nyc3',
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
  });

export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  const bucket = process.env.DO_SPACES_BUCKET!;
  const url = new URL(fileUrl);
  const key = url.pathname.replace(/^\//, '');
  await s3.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
}
