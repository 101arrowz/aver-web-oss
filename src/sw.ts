/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope & {
  __precacheManifest: Array<{ url: string; revision: string }>;
}

const precacheVersion = sw.__precacheManifest.map(p => p.revision).join('');
const precacheFiles = sw.__precacheManifest.map(p => p.url);

sw.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(precacheVersion).then(cache => cache.addAll(precacheFiles))
  );
});

sw.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== precacheVersion).map(k => caches.delete(k))
    ))
  );
});

sw.addEventListener('fetch', ev => {
  ev.respondWith(
    caches.match(ev.request).then(res => {
      return res || fetch(ev.request).then(async res => {
        const cache = await caches.open(precacheVersion);
        cache.put(ev.request, res.clone());
        return res;
      })
    })
  )
});