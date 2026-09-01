import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const OBJECT_KEY = 'products/local-first-ai-starter-kit/preview/product-preview.pdf';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET || 'viadecide-r2';
  if (!endpoint || !accessKeyId || !secretAccessKey) return res.status(503).json({ error: 'Preview is being prepared' });
  try {
    const client = new S3Client({ region:'auto', endpoint, credentials:{ accessKeyId, secretAccessKey } });
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket:bucket, Key:OBJECT_KEY, ResponseContentType:'application/pdf', ResponseContentDisposition:'inline; filename="Local-First-AI-Starter-Kit-Preview.pdf"' }), { expiresIn:900 });
    res.statusCode=302; res.setHeader('Location',url); return res.end();
  } catch (error) {
    console.error('local-ai-preview:', error);
    return res.status(500).json({ error:'Preview unavailable' });
  }
}
