// ===== Service Worker: نمایش صفحه‌ی اختصاصی «قطع اینترنت» به‌جای خطای پیش‌فرض مرورگر =====
// این Service Worker هیچ داده‌ای از بازی (Supabase و غیره) را کش نمی‌کند؛
// تنها وظیفه‌اش این است که وقتی درخواست بارگذاری صفحه (navigation) به‌خاطر
// قطعی اینترنت با شکست مواجه شود، به‌جای صفحه‌ی خطای پیش‌فرض مرورگر
// (که معمولاً آدرس واقعی سایت را هم نشان می‌دهد)، صفحه‌ی offline.html خودمان را نشان دهد.

const CACHE_NAME = 'iron-sky-offline-v1';
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // فقط درخواست‌های بارگذاری صفحه (navigation) را می‌گیریم؛
    // بقیه‌ی درخواست‌ها (API، فونت، و غیره) دست‌نخورده به شبکه می‌روند.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL))
            )
        );
    }
});
