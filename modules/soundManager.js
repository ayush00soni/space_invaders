export class SoundManager {
    constructor() {
        this.sounds = {
            "explosion": new Audio('assets/explosion.ogg'),
            "shoot": new Audio('assets/shoot.ogg'),
            "gameOver": new Audio('assets/game_over.ogg'),
            "startGame": new Audio('assets/start_game.ogg'),
            "playerWon": new Audio('assets/player_won.ogg'),
            "respawn": new Audio('assets/respawn.ogg'),
            "newWave": new Audio('assets/new_wave.ogg')
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