# Dashboard Keuangan — Batch B Final

## Cara pakai
1. `npm ci` (atau `npm install`)
2. Edit `src/firebase.js` → isi `apiKey`, `projectId`, dll.
3. Development: `npm run dev`
4. Build: `npm run build`
5. Deploy Firebase Hosting: `firebase deploy --only hosting`

## Catatan
- Offline mode aktif dengan service worker sederhana (`public/sw.js`).
- Firestore persistence aktif + antrean offline (`src/services/offlineQueue.js`).
- Jika pakai Capacitor Android, pastikan `StatusBar` plugin versi 6 agar kompatibel dengan core 6.
