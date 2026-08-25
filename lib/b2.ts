import { S3Client } from '@aws-sdk/client-s3'

const endpoint = process.env.B2_ENDPOINT || ''
const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`

// Auto-detect region from endpoint (e.g. s3.us-west-004.backblazeb2.com -> us-west-004)
const regionMatch = endpoint.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/)
const detectedRegion = regionMatch ? regionMatch[1] : 'us-west-004'

const region = (process.env.B2_REGION && !process.env.B2_REGION.includes('XXX'))
  ? process.env.B2_REGION
  : detectedRegion

export const b2 = new S3Client({
  region: region,
  endpoint: formattedEndpoint,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || '',
  },
})

