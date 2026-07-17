/**
 * Daxini Publishing — Sovereign Dispatch System Subscription API
 * 
 * Double opt-in subscription verification.
 * Stores: email, IP address, timestamp, user-agent fingerprint in SQLite.
 * Sends verification email via Titan SMTP (Nodemailer).
 * 
 * Endpoints:
 *   POST /api/subscribe        → Register pending subscription and send email
 *   GET  /api/subscribe/check  → Check if current IP or cookie is verified
 */

import crypto from 'crypto';
import { getDb, ensureSubscribersTable } from './db.js';
import { transporter } from '../lib/mailer.js';

const TOKEN_TTL_HOURS = 48;

/**
 * Extract real client IP from request headers
 */
function extractIp(req) {
  const headers = req.headers || {};
  return (
    headers['cf-connecting-ip'] ||
    (headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

/**
 * POST /api/subscribe
 * Body: { email: string }
 */
export async function handleSubscribe(req, res) {
  try {
    const headers = req.headers || {};
    const ip = extractIp(req);
    const { email, name, interest } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ ok: false, error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ ok: false, error: 'Invalid email format' });
    }

    const userAgent = headers['user-agent'] || 'unknown';
    
    // Ensure table and schema exists
    ensureSubscribersTable();
    const db = getDb();

    // Reject duplicates that are already verified; allow re-issuing tokens for pending ones.
    const existing = db.prepare(
      'SELECT id, is_verified FROM subscribers WHERE email = ?'
    ).get(cleanEmail);

    const token = crypto.randomBytes(32).toString('hex'); // 256-bit token
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000).toISOString();

    if (existing) {
      if (existing.is_verified) {
        return res.status(409).json({ ok: false, error: 'This email is already subscribed.' });
      }
      db.prepare(`
        UPDATE subscribers 
        SET verification_token = ?, token_expires_at = ?, ip_address = ?, user_agent = ?, last_seen = CURRENT_TIMESTAMP,
            name = COALESCE(?, name), interest_category = COALESCE(?, interest_category)
        WHERE email = ?
      `).run(token, expiresAt, ip, userAgent, name || null, interest || null, cleanEmail);
    } else {
      db.prepare(`
        INSERT INTO subscribers (email, ip_address, user_agent, is_verified, verification_token, token_expires_at, subscribed_at, last_seen, name, interest_category)
        VALUES (?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)
      `).run(cleanEmail, ip, userAgent, token, expiresAt, name || null, interest || null);
    }

    const verifyUrl = `https://daxini.xyz/verify?token=${token}`;

    const fromEmail = process.env.TITAN_SMTP_USER || 'dispatch@daxini.xyz';

    if (!process.env.TITAN_SMTP_PASS) {
      console.log(`[SUBSCRIBE] [DEV MODE] Verification Link: ${verifyUrl}`);
      return res.status(200).json({ ok: true, message: 'Verification email simulated. Check server logs.' });
    }

    try {
      await transporter.sendMail({
        from: `"The Journal Dispatch" <${fromEmail}>`,
        to: cleanEmail,
        subject: 'Confirm your subscription',
        text: `Confirm your subscription to the dispatch: ${verifyUrl}\n\nThis link expires in ${TOKEN_TTL_HOURS} hours.`,
        html: `<p>Confirm your subscription to the dispatch:</p>
               <p><a href="${verifyUrl}">${verifyUrl}</a></p>
               <p style="color:#888;font-size:12px">This link expires in ${TOKEN_TTL_HOURS} hours.</p>`,
      });
    } catch (mailErr) {
      console.error('[SUBSCRIBE] Nodemailer error:', mailErr);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[SUBSCRIBE] [FALLBACK] Email failed. Verification Link: ${verifyUrl}`);
        return res.status(200).json({ ok: true, message: 'Local fallback: Email failed but registration succeeded. Check server logs.' });
      }
      return res.status(500).json({ ok: false, error: 'Could not send verification email at this time.' });
    }

    return res.status(200).json({ ok: true, message: 'Verification email sent. Check your inbox.' });
  } catch (error) {
    console.error('[SUBSCRIBE] Error:', error);
    return res.status(500).json({ ok: false, error: 'Internal error. Please try again later.' });
  }
}

/**
 * GET /api/subscribe/check
 * Checks if current IP is subscribed (backward compatibility for UI)
 */
export async function checkSubscription(req, res) {
  try {
    const ip = extractIp(req);
    ensureSubscribersTable();
    const db = getDb();

    const subscriber = db.prepare(
      'SELECT id, email FROM subscribers WHERE ip_address = ? AND is_verified = 1'
    ).get(ip);

    if (subscriber) {
      try {
        db.prepare('UPDATE subscribers SET last_seen = CURRENT_TIMESTAMP WHERE ip_address = ?').run(ip);
      } catch (dbErr) {}
      return res.status(200).json({ subscribed: true });
    }
    return res.status(200).json({ subscribed: false });
  } catch (error) {
    return res.status(200).json({ subscribed: false });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') return handleSubscribe(req, res);
  if (req.method === 'GET') return checkSubscription(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
