import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Ecosystem-Uid');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache-Control headers optimised for Cloudflare Edge
app.use((req, res, next) => {
    if (req.url === '/' || req.url.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, must-revalidate');
    } else if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    }
    next();
});

// SaaS Purchase Interceptor
app.use((req, res, next) => {
    const isSaaSCheckout = req.path.includes('/checkout') || req.path.includes('/payment') || req.path.includes('/order');
    if (isSaaSCheckout) {
        const country = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'US';
        const currency = req.body?.currency || req.query?.currency || 'USD';
        
        if (country === 'IN' || currency === 'INR') {
            return res.status(403).json({
                error: 'SaaS Billing Restricted',
                code: 'regional_saas_billing_blocked',
                message: 'SaaS licensing is not available in India. Access is restricted to local-first workstations or verified academic student accounts.'
            });
        }
    }
    next();
});

// Dynamic Vercel Serverless Function Emulator
app.use('/api', async (req, res) => {
    let funcPath = path.join(__dirname, 'api', req.path);
    
    if (fs.existsSync(funcPath) && fs.statSync(funcPath).isDirectory()) {
        funcPath = path.join(funcPath, 'index.js');
    } else if (!funcPath.endsWith('.js')) {
        funcPath += '.js';
    }

    if (fs.existsSync(funcPath)) {
        try {
            const module = await import('file://' + funcPath);
            const handler = module.default || module;
            await handler(req, res);
        } catch (e) {
            console.error(`[API ERROR] ${req.path}:`, e);
            res.status(500).json({ error: 'Internal Server Error', details: e.message });
        }
    } else {
        res.status(404).json({ error: 'Function not found' });
    }
});

// Fallback for SPA routing
app.use((req, res) => {
    if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).send('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`[SOVEREIGN EDGE] Running autonomously on port ${PORT}`);
});
