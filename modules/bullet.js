export class Bullet {
    constructor(relX, relY, speed, width, color) {
        this.relX = relX;
        this.relY = relY;
        this.speed = speed;
        this.width = width;
        this.color = color;
        this.active = true;
    }

    update(deltatime) {

    }

    draw(gctx) { }

    isOffScreen() {
        return this.relY < 0;
    }
}