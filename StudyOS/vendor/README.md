# StudyOS vendor assets

This folder is reserved for pinned third-party assets loaded by `StudyOS/index.html`.

Expected files and upstream sources:
- `tailwindcss-runtime-3.4.16.js` (runtime script snapshot from `https://cdn.tailwindcss.com`)
- `chart.umd.min.js` (Chart.js `4.4.3`)
- `pdf.min.js` (PDF.js `3.4.120`)
- `pdf.worker.min.js` (PDF.js worker `3.4.120`)

If any file is missing or invalid, StudyOS now shows graceful in-app notices and disables related features.
