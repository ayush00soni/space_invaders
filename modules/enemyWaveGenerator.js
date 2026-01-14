import { Enemy } from "./enemy.js";

/**
 *
 * @param {number} wavenumber
 * @param {CanvasRenderingContext2D} gctx
 * @returns {Enemy[], }
*/
// TODO: Grid becomes assymetrical for odd number of columns; Fix that
export function generateEnemyWave(wavenumber, gctx) {
    const maxGridSize = {
        rows: 8,
        columns: 10
    };

    const initialGridSize = {
        rows: 3,
        columns: 5
    };


    const enemyArray = [];

    const enemyColumns = Math.min(initialGridSize.columns + Math.floor((wavenumber - 1) / 2), maxGridSize.columns);
    const enemyRows = Math.min(initialGridSize.rows + (wavenumber - 1), maxGridSize.rows);

    const densityFactor = Math.min(0.5 + (wavenumber - 1) * 0.05, 1); // Increase density with wave number

    const enemyRelWidth = 0.05, enemyRelHeight = 0.05;
    const enemyRelSpacing = 0.01;
    const enemyDirection = 1;

    function generateEnemy(i, j) {
        // Minimum distance from edge is made to be same as space between two enemies
        return new Enemy(
            (i * maxGridSize.columns) + j,
            (j + 1) * enemyRelSpacing + (j + 0.5) * enemyRelWidth + 0.001, // Slight offset from left edge
            i * enemyRelSpacing + (i + 0.5) * enemyRelHeight + 0.1, // RelY
            0.3, // RelSpeed
            enemyRelWidth,
            "gray",
            enemyRelSpacing,
            enemyDirection,
            0,
            gctx
        );
    }
    // Using a mirror system to create symmetrical enemy waves

    // Left half
    const halfColumns = Math.floor(enemyColumns / 2);
    const totalSlots = enemyRows * halfColumns;
    const availableSlots = Math.floor(enemyRows * halfColumns * densityFactor);
    const activeSlots = [...Array(availableSlots).fill(1), ...Array(totalSlots - availableSlots).fill(0)];

    // Shuffle active slots
    for (let i = activeSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeSlots[i], activeSlots[j]] = [activeSlots[j], activeSlots[i]];
    }

    // Make sure at least one enemy in the first row
    let enemyInFirstRow = false;
    for (let i = 0; i < halfColumns; i++) {
        if (activeSlots[i] === 1) {
            enemyInFirstRow = true;
            break;
        }
    }
    if (!enemyInFirstRow) {
        for (let i = halfColumns; i < totalSlots; i++) {
            if (activeSlots[i] === 1) {
                // Swap
                activeSlots[i] = 0;
                activeSlots[Math.floor(Math.random() * halfColumns)] = 1;
                break;
            }
        }

    }

    let slotIndex = 0;

    for (let i = 0; i < enemyRows; i++) {
        for (let j = 0; j < halfColumns; j++) {
            if (activeSlots[slotIndex++]) {
                enemyArray.push(generateEnemy(i, j));
            }
        }

        // Right half (mirror image)
    }
    slotIndex = 0;
    for (let i = 0; i < enemyRows; i++) {
        for (let j = enemyColumns - 1; j >= halfColumns + (enemyColumns % 2); j--) {
            if (activeSlots[slotIndex++]) {
                enemyArray.push(generateEnemy(i, j));
            }
        }
    }
    // Randomly fill center column for odd number of columns
    if (enemyColumns % 2 === 1) {
        const centerCol = Math.floor(enemyColumns / 2);
        const centerFill = Math.floor(enemyRows * densityFactor);
        const centerColSlots = [...Array(centerFill).fill(1), ...Array(enemyRows - centerFill).fill(0)];
        // Shuffle center column slots
        for (let i = centerColSlots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [centerColSlots[i], centerColSlots[j]] = [centerColSlots[j], centerColSlots[i]];
        }
        slotIndex = 0;
        for (let i = 0; i < enemyRows; i++) {
            if (centerColSlots[slotIndex++]) {
                enemyArray.push(generateEnemy(i, centerCol));
            }
        }
    }


    return [enemyArray, ((enemyColumns === maxGridSize.columns) && (enemyRows === maxGridSize.rows) && (densityFactor === 1))];
}