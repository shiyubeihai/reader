/* 北海阅读器 1.0 — Service Worker
 *
 * 改了 index.html / 图标 / manifest 之后，必须把 VERSION 改掉，
 * 否则浏览器会一直用旧缓存。
 */
const VERSION = '2.1.2';
const CACHE = 'beihai-reader-' + VERSION;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './fonts/serif-1.woff2',
  './fonts/serif-2.woff2',
  './fonts/serif-3.woff2',
  './fonts/sans-1.woff2',
  './fonts/sans-2.woff2',
  './fonts/sans-3.woff2',
  './fonts/round-1.woff2',
  './fonts/round-2.woff2',
  './fonts/round-3.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((k) => (k === CACHE ? null : caches.delete(k)))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  // 页面导航：先联网拿新版，断网时回落到缓存
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // 其他静态资源：先缓存，没有再去网络并顺手存下来
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
