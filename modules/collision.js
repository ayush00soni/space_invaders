/**
 * Performs Axis-Aligned Bounding Box (AABB) collision detection.
 * Checks if two rectangular objects overlap.
 * @param {object} objA - The first game object (must have getBounds() method)
 * @param {object} objB - The second game object (must have getBounds() method)
 * @param {CanvasRenderingContext2D} gctx - The drawing context (used to calculate bounds)
 * @returns {boolean} True if a collision is occurring
 */
export function collisionDetected(objA, objB, gctx) {
    const a = objA.getBounds(gctx);
    const b = objB.getBounds(gctx);
    return (a.x < b.x + b.width &&     // A.left < B.right
        a.x + a.width > b.x &&         // A.right > B.left
        a.y < b.y + b.height &&        // A.top < B.bottom
        a.y + a.height > b.y);         // A.bottom > B.top
}
