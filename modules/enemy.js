import { Bullet } from "./bullet.js";
import { BULLET_DIRECTION } from "./bullet.js";

export const ENEMY_DIRECTION = {
    LEFT: -1,
    RIGHT: 1
};

export class Enemy {
    constructor(
        id, relX, relY, relSpeed, relWidth, color, spacing, dir, gridPosition,
        bulletRelSpeed, bulletRelWidth, bulletColor
        ) {
        this.id = id;
        this.relX = relX;
        this.relY = relY;
        this.relSpeed = relSpeed;
        this.color = color;
        this.spacing = spacing;
        this.dir = dir;
        this.gridPosition = gridPosition;
        this.active = true;
        this.image = new Image();
        this.image.src = "assets/img/enemy.png";
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;

        // Bullet properties
        this.bulletRelSpeed = bulletRelSpeed;
        this.bulletRelWidth = bulletRelWidth;
        this.bulletColor = bulletColor;
        this.bulletImageSrc = "assets/img/red_laser.png";

        this.shootSound = "shoot2";
    }

    update(deltatime) {
        this.relX = this.relX + (this.dir * this.relSpeed * deltatime);
    }

    shiftDown() {
        this.relY += this.relHeight + this.spacing;
        this.dir *= -1;
    }

    isOnEdge(deltatime) {
        // Minimum distance from edge is made to be same as space between two enemies
        const edgeSpace = this.spacing + this.relWidth / 2;
        return (this.relX + this.dir * this.relSpeed * deltatime < edgeSpace ||
            this.relX + this.dir * this.relSpeed * deltatime > 1 - edgeSpace);
    }

    draw(gctx) {
        this.width = gctx.canvas.width * this.relWidth;
        this.aspectRatio = this.image.naturalHeight / this.image.naturalWidth;
        this.height = this.width * this.aspectRatio;
        this.relHeight = this.height / gctx.canvas.height;
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        if (this.image.complete) {
            gctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            gctx.fillStyle = this.color;
            gctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - this.relWidth * gctx.canvas.width / 2,
            y: gctx.canvas.height * this.relY - this.relHeight * gctx.canvas.height / 2,
            width: this.relWidth * gctx.canvas.width,
            height: this.relHeight * gctx.canvas.height
        };
    }

    shoot(soundManager) {
        soundManager.playSound(this.shootSound);
        const bullet = new Bullet(
            this.relX, this.relY,
            this.bulletRelSpeed,
            this.bulletRelWidth,
            this.bulletColor,
            this.bulletImageSrc,
            BULLET_DIRECTION.DOWN
        );
        return bullet;
    }

}