// Service Worker for EduMind PWA
const CACHE_NAME = 'edumind-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/dashboard.html',
    '/notes.html',
    '/summary.html',
    '/flashcards.html',
    '/quiz.html',
    '/todo.html',
    '/timer.html',
    '/history.html',
    '/whiteboard.html',
    '/css/style.css',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/notes.js',
    '/js/summary.js',
    '/js/flashcards.js',
    '/js/quiz.js',
    '/js/todo.js',
    '/js/timer.js',
    '/js/history.js',
    '/js/whiteboard.js',
    '/js/aiChat.js',
    '/assets/logo.png'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});