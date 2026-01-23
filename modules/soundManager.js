export class SoundManager {
    constructor() {
        this.sounds = {
            "explosion": new Audio('assets/audio/explosion.ogg'),
            "shoot": new Audio('assets/audio/shoot.ogg'),
            "gameOver": new Audio('assets/audio/game_over.ogg'),
            "startGame": new Audio('assets/audio/start_game.ogg'),
            "playerWon": new Audio('assets/audio/player_won.ogg'),
            "respawn": new Audio('assets/audio/respawn.ogg'),
            "newWave": new Audio('assets/audio/new_wave.ogg')
        };
    }

    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play();
        }
    }

    getDuration(name) {
        return (this.sounds[name] && !isNaN(this.sounds[name].duration)) ? this.sounds[name].duration : 0;
    }
}