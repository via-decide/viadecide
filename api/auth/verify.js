import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { aporaksha_credential, method } = req.body;
    
    // Verify with Aporaksha (single HTTP call)
    // We expect APORAKSHA_ENDPOINT and APORAKSHA_API_KEY in environment
    const endpoint = process.env.APORAKSHA_ENDPOINT || 'https://aporaksha.viadecide.com/api';
    const apiKey = process.env.APORAKSHA_API_KEY || 'test_key';
    
    const verifyRes = await fetch(
      `${endpoint}/verify`,
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential: aporaksha_credential, method })
      }
    );
    
    // For local dev without a real endpoint, we can mock success if it fails
    if (!verifyRes.ok && process.env.NODE_ENV !== 'production') {
       const sessionId = crypto.randomUUID();
       return res.status(200).json({
         user: { email: 'mock_user@viadecide.com', role: 'reader' },
         session_id: sessionId
       });
    }

    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { verified_email } = await verifyRes.json();
    
    // Return session ID (client stores in localStorage)
    const sessionId = crypto.randomUUID();
    
    return res.status(200).json({
      user: { email: verified_email, role: 'reader' },
      session_id: sessionId
    });
  } catch (error) {
    // Local dev fallback
    if (process.env.NODE_ENV !== 'production') {
      return res.status(200).json({
         user: { email: 'mock_user@viadecide.com', role: 'reader' },
         session_id: crypto.randomUUID()
      });
    }
    return res.status(500).json({ error: error.message });
  }
}
