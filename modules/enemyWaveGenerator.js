import { Enemy } from "./enemy.js";
import { ENEMY_DIRECTION } from "./enemy.js";

/**
 * Generates a new wave of enemies based on the wave number.
 * @param {number} wavenumber
 * @returns {[Enemy[], boolean]} Array of Enemy objects and a boolean indicating if max wave is reached
 */
export function generateEnemyWave(wavenumber) {
    // Grid size limits
    const MAX_GRID_SIZE = {
        ROWS: 7,
        COLUMNS: 9
    };

    const INITIAL_GRID_SIZE = {
        ROWS: 3,
        COLUMNS: 5
    };

    // Density parameters
    const INITIAL_DENSITY = 0.5; // Initial density of enemies
    const DENSITY_INCREMENT = 0.05; // Density increase per wave
    const MAX_DENSITY = 1.0; // Maximum density

    // Enemy properties
    const ENEMY_REL_WIDTH = 0.05, ENEMY_REL_HEIGHT = 0.05;
    const ENEMY_REL_SPACING = 0.01;
    const ENEMY_REL_SPEED = 0.2;

    // Enemy Bullet Configuration
    const ENEMY_BULLET_SPEED = 0.5;
    const ENEMY_BULLET_WIDTH = 0.005;
    const ENEMY_BULLET_COLOR = "red";

    // Array to hold generated enemies
    const enemyArray = [];

    // Determine grid size based on wave number
    const enemyColumns = Math.min(INITIAL_GRID_SIZE.COLUMNS + Math.floor((wavenumber - 1) / 2), MAX_GRID_SIZE.COLUMNS);
    const enemyRows = Math.min(INITIAL_GRID_SIZE.ROWS + (wavenumber - 1), MAX_GRID_SIZE.ROWS);

    const densityFactor = Math.min(INITIAL_DENSITY + (wavenumber - 1) * DENSITY_INCREMENT,
        MAX_DENSITY); // Increase density with wave number

    function generateEnemy(i, j) {
        // Minimum distance from edge is made to be same as space between two enemies
        return new Enemy(
            (i * MAX_GRID_SIZE.COLUMNS) + j,
            (j + 1) * ENEMY_REL_SPACING + (j + 0.5) * ENEMY_REL_WIDTH + 0.001, // Slight offset from left edge
            i * ENEMY_REL_SPACING + (i + 0.5) * ENEMY_REL_HEIGHT + 0.1, // RelY
            ENEMY_REL_SPEED, // RelSpeed
            ENEMY_REL_WIDTH,
            "gray",
            ENEMY_REL_SPACING,
            ENEMY_DIRECTION.RIGHT,
            { row: i, column: j },
            ENEMY_BULLET_SPEED,
            ENEMY_BULLET_WIDTH,
            ENEMY_BULLET_COLOR
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

    // Generate left half first
    let slotIndex = 0;
    for (let i = 0; i < enemyRows; i++) {
        for (let j = 0; j < halfColumns; j++) {
            if (activeSlots[slotIndex++]) {
                enemyArray.push(generateEnemy(i, j));
            }
        }
    }

    // Generate the right half as mirror image of left half
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


    return [enemyArray, ((enemyColumns === MAX_GRID_SIZE.COLUMNS) && (enemyRows === MAX_GRID_SIZE.ROWS) && (densityFactor === 1))];
}