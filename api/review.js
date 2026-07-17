import { getDb, ensureReviewsTable } from './db.js';
import { transporter } from '../lib/mailer.js';
import { escapeHTML } from '../security/inputSanitizer.js';

// Simple in-memory rate limiter for reviews (max 3 per IP per hour)
const rateLimitMap = new Map();
const MAX_REVIEWS_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return true;
  }
  let requests = rateLimitMap.get(ip);
  requests = requests.filter(time => now - time < HOUR_MS);
  if (requests.length >= MAX_REVIEWS_PER_HOUR) {
    rateLimitMap.set(ip, requests);
    return false;
  }
  requests.push(now);
  rateLimitMap.set(ip, requests);
  return true;
}

function extractIp(req) {
  const h = req.headers || {};
  return (
    h['cf-connecting-ip'] ||
    (h['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

export default async function handleReview(req, res) {
  try {
    const { name, email, rating, text, context, source } = req.body || {};
    const ip = extractIp(req);
    const userAgent = (req.headers || {})['user-agent'] || 'unknown';

    if (!checkRateLimit(ip)) {
      return res.status(429).json({ ok: false, error: 'Too many reviews submitted. Please try again later.' });
    }

    if (!name || !text || !rating) {
      return res.status(400).json({ ok: false, error: 'Name, rating, and review text are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ ok: false, error: 'Rating must be an integer between 1 and 5.' });
    }

    const safeName = escapeHTML(name || '');
    const safeEmail = escapeHTML(email || '');
    const safeText = escapeHTML(text || '');
    const safeContext = escapeHTML(context || '');
    const safeSource = escapeHTML(source || 'website');

    ensureReviewsTable();
    const db = getDb();

    db.prepare(`
      INSERT INTO reviews (name, email, rating, review_text, context, source, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      safeName,
      safeEmail || null,
      numRating,
      safeText,
      safeContext || null,
      safeSource,
      ip,
      userAgent
    );

    // Send email notification (fire and forget)
    const adminEmail = process.env.TITAN_SMTP_USER || 'dispatch@daxini.xyz';
    const emailHtml = `
      <h3>New Field Report Received</h3>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail || 'N/A'}</p>
      <p><strong>Rating:</strong> ${numRating} / 5</p>
      <p><strong>Context:</strong> ${safeContext || 'N/A'}</p>
      <p><strong>Source:</strong> ${safeSource}</p>
      <hr />
      <p><strong>Review:</strong><br/>${safeText.replace(/\n/g, '<br/>')}</p>
    `;

    transporter.sendMail({
      from: `"Daxini XYZ" <${adminEmail}>`,
      to: adminEmail,
      subject: `New Review: ${numRating} Star from ${safeName}`,
      html: emailHtml,
    }).catch(err => {
      console.error('[REVIEW] Error sending email notification:', err);
    });

    return res.status(200).json({
      ok: true,
      message: 'Review submitted successfully. Thank you!'
    });

  } catch (err) {
    console.error('[REVIEW] Error processing review:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error.' });
  }
}
