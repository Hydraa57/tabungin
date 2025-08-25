// public/sw.js
const CACHE = "dk-cache-v1";
const CORE = ["/", "/index.html", "/manifest.webmanifest"];

// install: cache inti
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

// activate: bersihkan cache lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// fetch: network first lalu cache fallback
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// menerima pesan dari halaman (skip waiting)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Deteksi update: kirim pesan ke semua client kalau SW baru waiting
self.addEventListener("install", () => {
  // sudah di-handle skipWaiting di atas; update banner akan muncul via 'updatefound' di halaman
});
