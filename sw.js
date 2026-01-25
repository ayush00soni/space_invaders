const CACHE_NAME = "invader-v1.1";
const cacheFiles = [
    // Root
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.webmanifest',

    // Modules
    './modules/background.js',
    './modules/bullet.js',
    './modules/collision.js',
    './modules/enemy.js',
    './modules/enemyWaveGenerator.js',
    './modules/particle.js',
    './modules/player.js',
    './modules/soundManager.js',

    // Images
    './assets/img/player.png',
    './assets/img/enemy.png',
    './assets/img/green_laser.png',
    './assets/img/red_laser.png',

    // Audio
    './assets/audio/explosion.ogg',
    './assets/audio/shoot.ogg',
    './assets/audio/shoot2.ogg',
    './assets/audio/game_over.ogg',
    './assets/audio/start_game.ogg',
    './assets/audio/player_won.ogg',
    './assets/audio/respawn.ogg',
    './assets/audio/new_wave.ogg',
    './assets/audio/pause.ogg',

    // Favicons (Standard)
    './assets/favicon/favicon.ico',
    './assets/favicon/favicon.svg',
    './assets/favicon/apple-touch-icon.png',

    // Favicons (Android PWA)
    './assets/favicon/android/android-launchericon-192-192.png',
    './assets/favicon/android/android-launchericon-512-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(cacheFiles);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
