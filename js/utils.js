// ============================================
// Aami & the Flying Hen — Utils & Constants
// ============================================

const GAME = {
    WIDTH: 800,
    HEIGHT: 600,
    GROUND_HEIGHT: 80,
    get PLAY_HEIGHT() { return this.HEIGHT - this.GROUND_HEIGHT; },
};

const PHYSICS = {
    GRAVITY: 0.10,
    JUMP_VELOCITY: -3.5,
    MAX_FALL_SPEED: 3,
    SCROLL_SPEED: 2.0,
    MAX_SCROLL_SPEED: 3.5,
    SPEED_INCREMENT: 0.00015,
};

const OBSTACLES = {
    GAP_SIZE: 165,
    MIN_GAP_SIZE: 125,
    GAP_SHRINK_RATE: 0.02,
    SPAWN_INTERVAL: 1800,      // ms
    MIN_SPAWN_INTERVAL: 1200,
    OBSTACLE_WIDTH: 70,
    MIN_TOP: 60,
    MAX_TOP_RATIO: 0.55,
};

const COLORS = {
    // Sky
    SKY_TOP: '#87CEEB',
    SKY_BOTTOM: '#E0F7FA',
    SKY_SUNSET_TOP: '#FF7043',
    SKY_SUNSET_BOTTOM: '#FFE082',

    // Village
    GROUND: '#5D8233',
    GROUND_DARK: '#4A6B28',
    DIRT: '#8B6914',

    // Trees / obstacles
    TRUNK: '#6D4C2E',
    TRUNK_DARK: '#5A3D24',
    LEAVES: '#2E7D32',
    LEAVES_LIGHT: '#66BB6A',
    LEAVES_DARK: '#1B5E20',

    // Rooftops
    ROOF: '#D84315',
    ROOF_LIGHT: '#FF5722',
    WALL: '#FFF9C4',
    WALL_SHADOW: '#F0E68C',

    // Character
    HEN_BODY: '#FFFFFF',
    HEN_WING: '#F5E6CA',
    HEN_COMB: '#E53935',
    HEN_BEAK: '#FF8F00',
    HEN_FEET: '#FF8F00',
    AAMI_SKIN: '#D2956A',
    AAMI_HAIR: '#1A1A1A',
    AAMI_DRESS: '#E91E63',
    AAMI_DRESS_2: '#9C27B0',

    // Collectibles
    COIN: '#FFD700',
    COIN_SHINE: '#FFF176',
    GOLDEN_EGG: '#FFB300',
    GOLDEN_EGG_SHINE: '#FFE082',

    // UI
    UI_BG: 'rgba(0, 0, 0, 0.5)',
    UI_TEXT: '#FFFFFF',
    UI_ACCENT: '#FFD700',
    UI_BUTTON: '#4CAF50',
    UI_BUTTON_HOVER: '#66BB6A',

    // Power-ups
    SPEED_BOOST: '#2196F3',
    EGG_SHIELD: '#9C27B0',
    MAGNET: '#F44336',

    // Particles
    FEATHER_COLORS: ['#FFFFFF', '#F5E6CA', '#FFE0B2', '#FFCCBC'],
    SPARKLE_COLORS: ['#FFD700', '#FFF176', '#FFEB3B', '#FFE082'],
};

// Theme presets for each stage
const THEME_PRESETS = {
    village: {
        skyTop: [135, 206, 235],
        skyBottom: [224, 247, 250],
        sunsetTop: [255, 112, 67],
        sunsetBottom: [255, 224, 130],
        farHill: '#81C784',
        nearHill: '#66BB6A',
        ground: '#5D8233',
        groundDark: '#4A6B28',
        dirtTop: '#5D8233',
        dirtBottom: '#5A3D1A',
        elements: 'houses',   // background elements
        obstacles: 'village', // obstacle style
        flowerColors: ['#E91E63', '#FF5722', '#FFEB3B', '#9C27B0', '#2196F3'],
    },
    forest: {
        skyTop: [76, 132, 100],
        skyBottom: [180, 220, 180],
        sunsetTop: [120, 90, 60],
        sunsetBottom: [200, 180, 130],
        farHill: '#2E7D32',
        nearHill: '#388E3C',
        ground: '#33691E',
        groundDark: '#1B5E20',
        dirtTop: '#33691E',
        dirtBottom: '#3E2723',
        elements: 'trees',
        obstacles: 'forest',
        flowerColors: ['#CDDC39', '#8BC34A', '#C6FF00', '#AEEA00', '#76FF03'],
    },
    mountain: {
        skyTop: [55, 71, 100],
        skyBottom: [150, 170, 200],
        sunsetTop: [180, 100, 80],
        sunsetBottom: [220, 180, 160],
        farHill: '#78909C',
        nearHill: '#90A4AE',
        ground: '#6D7B8D',
        groundDark: '#546E7A',
        dirtTop: '#6D7B8D',
        dirtBottom: '#37474F',
        elements: 'peaks',
        obstacles: 'mountain',
        flowerColors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#BBDEFB', '#90CAF9'],
    },
};

const POWERUP = {
    DURATION: 5000,         // ms
    SPAWN_CHANCE: 0.15,     // per obstacle pair
    TYPES: ['speed', 'shield', 'magnet'],
};

// --- Utility Functions ---

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// AABB collision detection
function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// Circle-rect collision
function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    return distance(cx, cy, closestX, closestY) < cr;
}

function easeOutQuad(t) {
    return t * (2 - t);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
