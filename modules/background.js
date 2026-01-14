export class StarField {
    constructor(density) {
        this.stars = [];
        this.density = density; // Number of stars per 100x100 pixels
        this.lastwidth = 0;
        this.lastheight = 0;
    }

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

    spawnStars(offsetX, offsetY, width, height) {
        const area = width * height;
        const totalStars = Math.floor(this.density * (area / (100 * 100)));

        for (let i = 0; i < totalStars; i++) {
            this.stars.push({
                x: offsetX + Math.random() * width,
                y: offsetY + Math.random() * height,
                radius: Math.random() + 0.5,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

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