import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, ensureDownloadsTable } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function extractIp(req) {
  const h = req.headers || {};
  return (
    h['cf-connecting-ip'] ||
    (h['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

export default function handleApkDownload(req, res) {
  try {
    ensureDownloadsTable();
    const db = getDb();
    
    const ip = extractIp(req);
    const userAgent = (req.headers || {})['user-agent'] || 'unknown';

    db.prepare(`
      INSERT INTO downloads (app_name, ip_address, user_agent)
      VALUES (?, ?, ?)
    `).run('alchemist', ip, userAgent);

    // Serve the APK directly with forced headers
    const apkPath = path.join(__dirname, '..', 'alchemist.apk');
    if (!fs.existsSync(apkPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('APK file not found on server.');
    }

    const stat = fs.statSync(apkPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="alchemist.apk"'
    });
    
    const stream = fs.createReadStream(apkPath);
    stream.pipe(res);
    stream.on('error', () => res.end());

  } catch (err) {
    console.error('[DOWNLOAD] Error tracking download:', err);
    res.writeHead(302, { 'Location': '/alchemist.apk' });
    res.end();
  }
}
