/**
 * Manages the dynamic starfield background.
 * Handles spawning, resizing, and rendering of star particles.
 */
export class StarField {
    /**
     * @param {number} density - Star density (star per pixel)
     * @param {number} minRadius - Minimum radius of each star
     * @param {number} minOpacity - Minimum opacity of each star
     */
    constructor(density, minRadius, minOpacity) {
        this.stars = [];
        this.density = density; // star per pixel
        this.minRadius = minRadius;
        this.minOpacity = minOpacity;

        // Utility attributes to help with cropping and filling
        this.lastwidth = 0;
        this.lastheight = 0;

    }

    /**
     * Adjusts the starfield when the window is resized.
     * Spawns new stars in the new empty areas and culls stars that are out of bounds.
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    resize(width, height) {
        // Cropping: Delete stars that are out of bounds
        this.stars = this.stars.filter(star => star.x <= width && star.y <= height);

        // Filling: Add new stars if needed
        if (width > this.lastwidth) {
            // New stars on the right side
            this.spawnStars(this.lastwidth, 0, width - this.lastwidth, height);
        }
        if (height > this.lastheight) {
            // New stars on the bottom side
            this.spawnStars(0, this.lastheight, Math.min(width, this.lastwidth), height - this.lastheight);
        }

        this.lastwidth = width;
        this.lastheight = height;
    }

    /**
     * Generates a new batch of stars for a specific region of the canvas.
     * Used during initialization and resizing.
     * @param {number} offsetX - Starting X coordinate
     * @param {number} offsetY - Starting Y coordinate
     * @param {number} width - Width of the area to fill
     * @param {number} height - Height of the area to fill
     */
    spawnStars(offsetX, offsetY, width, height) {
        const area = width * height;
        const totalStars = Math.floor(this.density * area);

        for (let i = 0; i < totalStars; i++) {
            this.stars.push({
                x: offsetX + Math.random() * width,
                y: offsetY + Math.random() * height,
                radius: Math.random() + this.minRadius,
                opacity: (Math.random() + 1) * this.minOpacity
            });
        }
    }

    /**
     * Renders the entire starfield.
     * @param {CanvasRenderingContext2D} gctx
     */
    draw(gctx) {
        gctx.fillStyle = "white";
        this.stars.forEach(star => {
            gctx.globalAlpha = star.opacity;
            gctx.beginPath();
            gctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            gctx.fill();
        });
        gctx.globalAlpha = 1.0; // Reset alpha
    }
}