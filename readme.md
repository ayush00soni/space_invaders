# Space Invaders (JS Canvas Engine)

A modern, object-oriented implementation of the arcade classic using vanilla JavaScript and HTML5 Canvas. This project demonstrates a custom 2D rendering engine, state management, and procedural content generation without external game libraries.

## 🎮 Play the Game
**Link Will Be Availble when published**

## ✨ Features
* **Custom Game Engine:** Built from scratch using `requestAnimationFrame` with Delta Time for frame-rate independent movement.
* **Procedural Waves:** Enemy formations are procedurally generated with increasing difficulty and density using a symmetrical grid algorithm.
* **Responsive Rendering:** The game canvas scales dynamically to fit any screen size while maintaining aspect ratio.
* **State Management:** Robust handling of Game Over, Win, Pause, and Menu states.
* **Polished Game Feel:**
    * Particle systems for explosions and player respawn (implosion) effects.
    * Invincibility frames and visual feedback (force field) for the player.
    * Dynamic starfield background.
    * Sound effect management.

## 🕹️ Controls
* **Move:** `Arrow Keys` or `WASD`
* **Shoot:** `Spacebar`
* **Pause:** `Esc` or the on-screen Pause button

## 🛠️ Technical Highlights
* **ES6 Modules:** Codebase is structured into modular classes (`Player`, `Enemy`, `Bullet`, `Particle`, `StarField`).
* **Asset Management:** dedicated `SoundManager` class for handling audio events.
* **Collision Detection:** AABB (Axis-Aligned Bounding Box) collision logic.
* **Configuration:** All gameplay variables (speed, cooldowns, density) are centralized for easy balancing.

## 📂 Project Structure
```text
/
├── index.html          # Entry point
├── main.js             # Game loop and state manager
├── modules/            # Game logic classes
│   ├── player.js       # Player physics and input
│   ├── enemy.js        # Enemy AI and rendering
│   ├── bullet.js       # Projectile logic
│   ├── particle.js     # Visual effects system
│   └── ...
└── assets/             # Images and Audio
```
## 🎨 Credits
* **Development:** Ayush Soni
* **Assets:** Graphics and Audio provided by [Kenney.nl](https://kenney.nl) (License: CC0 1.0 Universal)
* **Tools:** Favicons generated using [RealFaviconGenerator.net](https://realfavicongenerator.net)