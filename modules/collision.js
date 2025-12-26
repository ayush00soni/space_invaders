export function collisionDetected(objA, objB) {
    return (objA.x < objB.x + objB.width &&     // A.left < B.right
        objA.x + objA.width > objB.x &&         // A.right > B.left
        objA.y < objB.y + objB.height &&        // A.top < B.bottom
        objA.y + objA.height > objB.y);         // A.bottom > B.top
}
