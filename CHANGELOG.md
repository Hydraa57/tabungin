# Changelog — Batch B (Final)

## Added
- Auth: Sign up dengan konfirmasi password, validasi huruf+angka, "Lupa kata sandi".
- Greeting di dashboard menggunakan displayName Firebase.
- Network banner online/offline dengan auto-hide 5 detik + animasi fade/slide.
- Prioritas transaksi (Wajib/Butuh/Ingin) di form, tabel, dan edit.
- Category chips (shortcut kategori yang sering dipakai).

## Improved
- Dark mode di form: kontras teks, placeholder, border.
- Header smart: jarak, logo monokrom, compact saat scroll.
- Tabel: kolom aksi lebih kecil, sticky di kanan, responsif (bisa digeser).
- Nominal: auto-format titik ribuan real-time (input & edit).
- Reset filter dipindah ke baris filter tabel.

## Offline & Sync
- PWA service worker sederhana (cache shell + fallback ke /index.html).
- IndexedDB persistence Firestore diaktifkan; antrean offline untuk transaksi lokal.
- Auto-sync antrean saat kembali online.

## Utilities
- Export Excel (CSV ringan) dari transaksi aktif (filter-aware).

---
**Catatan**: Untuk menjalankan proyek ini:
1) `npm ci` atau `npm install`
2) Isi kredensial Firebase di `src/firebase.js`
3) `npm run dev` (dev) atau `npm run build` + deploy ke Firebase Hosting
