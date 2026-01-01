export function collisionDetected(objA, objB, gctx) {
    const a = objA.getBounds(gctx);
    const b = objB.getBounds(gctx);
    return (a.x < b.x + b.width &&     // A.left < B.right
        a.x + a.width > b.x &&         // A.right > B.left
        a.y < b.y + b.height &&        // A.top < B.bottom
        a.y + a.height > b.y);         // A.bottom > B.top
}
