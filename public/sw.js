// Cukupin™ PWA Service Worker (v1.0.0)
const CACHE_NAME = 'cukupin-cache-v1';
const PRECACHE_ASSETS = ['/', '/manifest.webmanifest', '/icon.png', '/icon-192.png', '/apple-icon.png'];
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
		return cache.addAll(PRECACHE_ASSETS);
	}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
	event.waitUntil(caches.keys().then((cacheNames) => {
		return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
	}).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
	const {
		request
	} = event;
	// Only handle http/https requests (ignore chrome-extension://, moz-extension://, etc.)
	if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
		return;
	}
	// Never cache Supabase API calls or non-GET requests
	if (request.method !== 'GET' || request.url.includes('supabase.co') || request.url.includes('/auth/')) {
		return;
	}
	// Stale-while-revalidate for static assets & pages
	event.respondWith(caches.match(request).then((cachedResponse) => {
		const fetchPromise = fetch(request).then((networkResponse) => {
			if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
				const responseToCache = networkResponse.clone();
				caches.open(CACHE_NAME).then((cache) => {
					cache.put(request, responseToCache);
				});
			}
			return networkResponse;
		}).catch(() => {
			// If offline and request is for a document, serve cached root
			if (request.mode === 'navigate') {
				return caches.match('/');
			}
			return cachedResponse;
		});
		return cachedResponse || fetchPromise;
	}));
});
