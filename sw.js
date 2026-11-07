/* 薪火医语 · Service Worker
 * 只做一件事：让浏览器认为这是一个「可安装的应用」（安卓 Chrome 需要页面内有
 * 一个带 fetch 处理的 Service Worker 才允许「添加到主屏幕」）。
 *
 * 刻意不做任何缓存：每次请求都直接走网络。
 * 页面本体接近 2MB，一旦缓存住，后续改了内容用户看到的还是旧版，
 * 排查问题会非常费劲。离线可用不是这个作品的目标，永远拿到最新版才是。
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  /* 显式绕开 HTTP 缓存：不写 this 的话，手机浏览器会把 index.html 缓存住，
     改了内容用户在桌面上点开还是旧版，看起来就像「改了没用」。
     失败时回落到普通请求（比如某些跨域资源不接受 no-store）。 */
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(function () {
      return fetch(event.request);
    })
  );
});
