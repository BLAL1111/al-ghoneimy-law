const CACHE_NAME = 'ghoneimy-law-v2'
const urlsToCache = [
  '/',
  '/cases',
  '/clients',
  '/sessions',
  '/documents',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // تجاهل أي حاجة مش GET (POST, PUT, DELETE...)
  if (event.request.method !== 'GET') return

  // تجاهل طلبات الـ API
  if (event.request.url.includes('/api/')) return

  // تجاهل chrome-extension وغيرها
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // تأكد إن الـ response صالح قبل ما تحفظه
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/offline')
        })
      })
  )
})

// استقبال الإشعارات Push
self.addEventListener('push', (event) => {
  let data = { title: 'مكتب الغنيمي', body: 'لديك إشعار جديد', icon: '/logo.png' }

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: '/logo.png',
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200],
      tag: data.tag || 'ghoneimy-notification',
      data: { url: data.url || '/' }
    })
  )
})

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})