/**
 * Centralized audio controller.
 * Preloads all sound assets and handles playback to ensure low latency.
 */
export class SoundManager {
    constructor() {
        this.sounds = {
            "explosion": new Audio('assets/audio/explosion.ogg'),
            "shoot": new Audio('assets/audio/shoot.ogg'),
            "shoot2": new Audio('assets/audio/shoot2.ogg'),
            "gameOver": new Audio('assets/audio/game_over.ogg'),
            "startGame": new Audio('assets/audio/start_game.ogg'),
            "playerWon": new Audio('assets/audio/player_won.ogg'),
            "respawn": new Audio('assets/audio/respawn.ogg'),
            "newWave": new Audio('assets/audio/new_wave.ogg'),
            "pause": new Audio('assets/audio/pause.ogg')
        };
    }

    /**
     * Plays a specific sound effect.
     * Resets the audio track to 0 to allow rapid re-triggering (e.g., shooting).
     * @param {string} name - The key name of the sound (e.g., "shoot", "explosion")
     */
    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play();
        }
    }

    /**
     * Retrieves the duration of a sound asset.
     * Useful for syncing events (like Game Over screens) to audio.
     * @param {string} name - The key name of the sound
     * @returns {number} Duration in seconds, or 0 if not found
     */
    getDuration(name) {
        return (this.sounds[name] && !isNaN(this.sounds[name].duration)) ? this.sounds[name].duration : 0;
    }
}