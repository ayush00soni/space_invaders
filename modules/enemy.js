import { Bullet } from "./bullet.js";
import { BULLET_DIRECTION } from "./bullet.js";

export const ENEMY_DIRECTION = {
    LEFT: -1,
    RIGHT: 1
};

/**
 * Represents a single enemy invader.
 * Handles positioning, grid logic, edge detection, and firing.
 */
export class Enemy {
    /**
     * @param {number} id - Unique identifier for the enemy
     * @param {number} relX - Relative X position
     * @param {number} relY - Relative Y position
     * @param {number} relSpeed - Movement speed
     * @param {number} relWidth - Relative width
     * @param {string} color - Fallback color
     * @param {number} spacing - Spacing buffer for formation logic
     * @param {number} dir - Initial movement direction (1 for Right, -1 for Left)
     * @param {object} gridPosition - {row, column} coordinates in the wave grid
     * @param {number} bulletRelSpeed - Speed of enemy projectiles
     * @param {number} bulletRelWidth - Width of enemy projectiles
     * @param {string} bulletColor - Color of enemy projectiles
     */
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
        this.relWidth = relWidth;
        this.relHeight = this.relWidth;

        // Bullet properties
        this.bulletRelSpeed = bulletRelSpeed;
        this.bulletRelWidth = bulletRelWidth;
        this.bulletColor = bulletColor;
        this.bulletImageSrc = "assets/img/red_laser.png";

        this.shootSound = "shoot2";

        // Load Image
        this.image = new Image();
        this.image.src = "assets/img/enemy.png";

        // Enemy State
        this.active = true;
    }

    /**
     * @param {number} deltatime
     */
    update(deltatime) {
        this.relX = this.relX + (this.dir * this.relSpeed * deltatime);
    }

    /**
     * Moves the enemy down one row and reverses its horizontal direction.
     * Called when any enemy in the wave hits the screen edge.
     */
    shiftDown() {
        this.relY += this.relHeight + this.spacing;
        this.dir *= -1;
    }

    /**
     * Checks if the enemy is about to hit the screen boundary.
     * @param {number} deltatime - Time elapsed to predict next position
     * @returns {boolean} True if the enemy is touching the edge
     */
    isOnEdge(deltatime) {
        // Minimum distance from edge is made to be same as space between two enemies
        const edgeSpace = this.spacing + this.relWidth / 2;
        return (this.relX + this.dir * this.relSpeed * deltatime < edgeSpace ||
            this.relX + this.dir * this.relSpeed * deltatime > 1 - edgeSpace);
    }

    /**
     * @param {CanvasRenderingContext2D} gctx
     */
    draw(gctx) {
        // Resize enemy to its image aspect ratio
        this.aspectRatio = this.image.naturalHeight / this.image.naturalWidth;
        this.width = gctx.canvas.width * this.relWidth;
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

    /**
     * Returns the bounding box of the enemy for collision detection.
     * @param {CanvasRenderingContext2D} gctx
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds(gctx) {
        return {
            x: gctx.canvas.width * this.relX - this.relWidth * gctx.canvas.width / 2,
            y: gctx.canvas.height * this.relY - this.relHeight * gctx.canvas.height / 2,
            width: this.relWidth * gctx.canvas.width,
            height: this.relHeight * gctx.canvas.height
        };
    }

    /**
     * Creates a bullet originating from the enemy's current position.
     * @param {SoundManager} soundManager - Reference to sound manager to play shooting SFX
     * @returns {Bullet} The newly created bullet object
     */
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