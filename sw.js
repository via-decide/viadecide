const CACHE_NAME = 'decide-os-v95'; // Version bumped to force refresh
const ASSETS = [
  './',                // Relative path (Critical for GitHub Pages)
  './index.html',
  './manifest.json',
  './icon.png',        // Ensures the icon is cached for offline use
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

// 1. Install Event: Cache Core Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force new SW to take control immediately
});

// 2. Activate Event: Clean Up Old Caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim(); // Take control of all open clients
});

// 3. Fetch Event: Smart Strategy
self.addEventListener('fetch', (e) => {
  
  // RULE A: Database/API calls -> NETWORK ONLY
  // (Never cache the Google Script prices/specs)
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // RULE B: Static Assets -> CACHE FIRST, then NETWORK
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
        // Optional: If offline and image missing, return nothing (prevents errors)
        if (e.request.destination === 'image') return;
      });
    })
  );
});
