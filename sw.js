const CACHE_NAME='lima-field-v0.4.7';
const PDFJS_PAYLOAD_URL='https://raw.githubusercontent.com/limaagrimensor/limaagrimensor.github.io/a31b65197efb29e8869ba844cc402641234120aa/index.html';
const CORE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  PDFJS_PAYLOAD_URL
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE_ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);

  if(event.request.url===PDFJS_PAYLOAD_URL){
    event.respondWith(
      caches.match(event.request).then(cached=>cached||fetch(event.request))
    );
    return;
  }

  if(url.origin!==self.location.origin)return;

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
