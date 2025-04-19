// This service worker can be customized further
// https://developers.google.com/web/tools/workbox/modules/workbox-recipes

// Import workbox libraries
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, matchPrecache } = workbox.precaching;
const { setCacheNameDetails } = workbox.core;

// Set custom cache names for better organization
setCacheNameDetails({
  prefix: 'kca-dashboard',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime',
});

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'kca-dashboard-google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'kca-dashboard-google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        maxEntries: 30,
      }),
    ],
  })
);

// Cache images with a cache-first strategy
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'kca-dashboard-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache CSS and JavaScript files with stale-while-revalidate
registerRoute(
  /\.(?:js|css)$/,
  new StaleWhileRevalidate({
    cacheName: 'kca-dashboard-static-resources',
  })
);

// Use network-first for API requests but fall back to cache if network fails
registerRoute(
  /\/api\//,
  new NetworkFirst({
    cacheName: 'kca-dashboard-api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Special handling for chess game data - longer cache time
registerRoute(
  /\/api\/chess\//,
  new NetworkFirst({
    cacheName: 'kca-dashboard-chess-data',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cleanup old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [
    'kca-dashboard-google-fonts-stylesheets',
    'kca-dashboard-google-fonts-webfonts',
    'kca-dashboard-images',
    'kca-dashboard-static-resources',
    'kca-dashboard-api-responses',
    'kca-dashboard-chess-data'
  ];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});