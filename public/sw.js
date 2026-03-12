const CACHE_NAME = 'ghoneimy-law-v1'
const urlsToCache = [
  '/',
  '/cases',
  '/clients',
  '/sessions',
  '/documents',
  '/offline',
]

// تثبيت الـ Service Worker وتخزين الصفحات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// تفعيل الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// استقبال الطلبات - Network First ثم Cache
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات الـ API
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
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
      tag: 'ghoneimy-notification',
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
