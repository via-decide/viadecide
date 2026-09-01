import Razorpay from 'razorpay';

const PRODUCT = {
  id: 'local-first-ai-starter-kit',
  amount: 49900,
  currency: 'INR'
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Payment configuration unavailable' });

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: PRODUCT.amount,
      currency: PRODUCT.currency,
      receipt: `lfai_${Date.now()}`,
      notes: { product_id: PRODUCT.id }
    });
    return res.status(200).json({
      key_id: keyId,
      order_id: order.id,
      amount: PRODUCT.amount,
      currency: PRODUCT.currency
    });
  } catch (error) {
    console.error('local-ai-checkout:', error);
    return res.status(500).json({ error: 'Could not create checkout' });
  }
}
