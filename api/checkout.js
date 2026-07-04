import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // CORS Handling
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { product_type, product_id, price } = req.body;

  try {
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_T3BiCiW0o4slky', // Note: Make sure to set in Vercel
      key_secret: process.env.RAZORPAY_KEY_SECRET || ''
    });

    // 1. SOVEREIGN WRITER PLATFORM (Subscription)
    if (product_type === 'subscription') {
      // By default, assume $5-$10/mo equivalent in INR (e.g. INR 499/mo)
      // Use specific plan_id provided by the dashboard
      const planId = process.env.RAZORPAY_PLAN_ID_INR || 'plan_placeholder_123';
      
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12
      });
      return res.status(200).json({ 
        checkout_type: 'subscription', 
        subscription_id: subscription.id,
        checkout_url: subscription.short_url // Optional redirect link
      });
    }

    // 2. PRINTBYDD HARDWARE (One-Time Order)
    if (product_type === 'printbydd_hardware' || product_type === 'one_time') {
      let amountInPaise = parseInt(price || 1000) * 100; // Default ₹1000 if not provided
      
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });
      
      return res.status(200).json({ 
        checkout_type: 'order', 
        order_id: order.id 
      });
    }

    return res.status(400).json({ error: 'Invalid product_type' });

  } catch (error) {
    console.error('Razorpay Error:', error);
    return res.status(500).json({ error: 'Payment gateway initialization failed.' });
  }
}
