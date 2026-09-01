import crypto from 'crypto';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const EXPECTED_AMOUNT = 49900;
const EXPECTED_CURRENCY = 'INR';
const OBJECT_KEY = 'products/local-first-ai-starter-kit/Local-First-AI-Starter-Kit.zip';

function r2() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) throw new Error('R2 configuration unavailable');
  return new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId, secretAccessKey } });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const bucket = process.env.R2_BUCKET || 'viadecide-r2';
  if (!secret || !keyId) return res.status(503).json({ error: 'Payment configuration unavailable' });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'Missing payment proof' });

  const expected = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(razorpay_signature), 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(403).json({ error: 'Invalid payment signature' });

  try {
    const auth = Buffer.from(`${keyId}:${secret}`).toString('base64');
    const paymentResp = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, { headers: { Authorization: `Basic ${auth}` } });
    if (!paymentResp.ok) throw new Error(`Razorpay payment lookup failed: ${paymentResp.status}`);
    const payment = await paymentResp.json();
    if (payment.order_id !== razorpay_order_id || payment.amount !== EXPECTED_AMOUNT || payment.currency !== EXPECTED_CURRENCY || !['authorized','captured'].includes(payment.status)) {
      return res.status(403).json({ error: 'Payment does not match this product' });
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: OBJECT_KEY, ResponseContentDisposition: 'attachment; filename="Local-First-AI-Starter-Kit.zip"' });
    const downloadUrl = await getSignedUrl(r2(), command, { expiresIn: 900 });
    return res.status(200).json({ download_url: downloadUrl, expires_in_seconds: 900 });
  } catch (error) {
    console.error('local-ai-delivery:', error);
    return res.status(500).json({ error: 'Payment verified but delivery could not be issued' });
  }
}
