export class Enemy {
    constructor(id, relX, relY, speed, width, height, color, spacing, dir, column) {
        this.id = id;
        this.relX = relX;
        this.relY = relY;
        this.relYi = relY; // Initial y position (relative)
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.color = color;
        this.spacing = spacing;
        this.dir = dir;
        this.column = column;
        this.dirSwitch = false;
    }

    update(deltatime, gctx) {
        if (!this.isOnEdge(gctx) || this.dirSwitch) {
            this.relX = this.relX + this.dir * this.speed * deltatime / gctx.canvas.width;
            this.dirSwitch = false;
        } else {
            this.relY += this.height / gctx.canvas.height + this.spacing * gctx.canvas.width / gctx.canvas.height;
            this.column++;
            this.switchDir();
        }

    }

    switchDir() {
        this.dir = -this.dir;
        this.dirSwitch = true;
    }

    isOnEdge(gctx) {
        // Minimum distance from edge is made to be same as space between two enemies
        const edgeSpace = this.spacing + this.width / gctx.canvas.width / 2;
        return (this.relX < edgeSpace || this.relX > 1 - edgeSpace);
    }

    draw(gctx) {
        this.x = gctx.canvas.width * this.relX - this.width / 2;
        this.y = gctx.canvas.height * this.relY - this.height / 2;
        gctx.fillStyle = this.color;
        gctx.fillRect(this.x, this.y, this.width, this.height);

        const mS = 5;
        this.x = gctx.canvas.width * this.relX - mS / 2;
        this.y = gctx.canvas.height * this.relY - mS / 2;
        gctx.fillStyle = "blue";
        gctx.fillRect(this.x, this.y, mS, mS);
    }

    /**
     * @param {Enemy} prevEnemy
     * @param {Enemy} nextEnemy
     */
    adjustSpacing(prevEnemy, gctx) {
        if (prevEnemy) {
            if (this.column === prevEnemy.column && this.relX - prevEnemy.relX !== this.dir * (this.width / gctx.canvas.width + this.spacing)) {
                this.relX = prevEnemy.relX + this.dir * (this.width / gctx.canvas.width + this.spacing);
            }
        }
    }
}