export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name, role } = req.body;

  // Validate
  if (!email || !role || !['reader', 'blogger'].includes(role)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Call Aporaksha email auth
    const apoRes = await fetch(
      `${process.env.APORAKSHA_ENDPOINT}/auth/email-link`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.APORAKSHA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          redirect_url: `${process.env.ORIGIN}/auth/callback`,
          metadata: { role, name }
        })
      }
    );

    if (!apoRes.ok) {
      return res.status(401).json({ error: 'Auth failed' });
    }

    const { auth_url, user_id } = await apoRes.json();

    return res.json({
      session_id: crypto.randomUUID(),
      email,
      role,
      auth_url,
      message: `Email sent to ${email}`
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
