import { S3Client } from '@aws-sdk/client-s3'

const endpoint = process.env.B2_ENDPOINT || '';
const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;

export const b2 = new S3Client({
  region: process.env.B2_REGION || 'us-east-005',
  endpoint: formattedEndpoint,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
  },
})
