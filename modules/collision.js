export function collisionDetected(objA, objB, gctx) {
    return (objA.getBounds(gctx).x < objB.getBounds(gctx).x + objB.getBounds(gctx).width &&     // A.left < B.right
        objA.getBounds(gctx).x + objA.getBounds(gctx).width > objB.getBounds(gctx).x &&         // A.right > B.left
        objA.getBounds(gctx).y < objB.getBounds(gctx).y + objB.getBounds(gctx).height &&        // A.top < B.bottom
        objA.getBounds(gctx).y + objA.getBounds(gctx).height > objB.getBounds(gctx).y);         // A.bottom > B.top
}
