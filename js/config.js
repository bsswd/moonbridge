export const CONFIG = {
    BLOCK: {
        SIZE: 120,
        BOUNCE: 0.2,
    },

    PHYSICS: {
        MAX_ACTIVE_BLOCKS: 3,
    },

    CAMERA: {
        SPAWN_OFFSET: 150,
        TRIGGER_LINE: 0.8,
    },

    DISTANCE: {
        TOTAL: 100,                 // 384400 для финальной версии
        PER_BLOCK: 10,              // Нужно тестировать
    },

    CRANE: {
        SWING: 220,
        SPEED: 0.0025,
    },

    HELICOPTER: {
        SPEED_MIN: 180,
        SPEED_MAX: 260,
        HOVER_CHANCE: 0.3,
        HOVER_DURATION_MIN: 400,
        HOVER_DURATION_MAX: 1400,
        NEXT_HOVER_MIN: 1500,
        NEXT_HOVER_MAX: 3000,
    },
    SHIP: {
        SPEED_MIN: 180,
        SPEED_MAX: 300,
        AMPLITUDE_MIN: 30,
        AMPLITUDE_MAX: 70,
    },

    TEXTURES: {
        // Транспорт
        CRANE: 'crane',
        HELI: 'heli',
        SHIP: 'ship',

        // Окружение
        GROUND: 'ground',
        CITY: 'city',
        MOON: 'moon',
        
        // Массив всех блоков
        BLOCKS: [
            'block_01',
            'block_02',
            'block_03',
            'block_04',
            'block_05',
            'block_06',
            'block_07',
            'block_08',
            'block_09',
            'block_10',
            'block_11'
        ],
    },
};

export const ZONES = [
    {
        label: 'earth',
        name: 'ЗЕМЛЯ',
        color: '#1414af',
        minDistance: 50,
        transport: 'crane',
    },
    {
        label: 'sky',
        name: 'НЕБО',
        color: '#1a0b2e',
        minDistance: 30,
        transport: 'heli',
    },
    {
        label: 'space',
        name: 'КОСМОС',
        color: '#050510',
        minDistance: 0,
        transport: 'ship',
    },
];

export const MOON_ZONE = {
    label: 'moon',
    name: 'ЛУНА',
    color: '#0a0a0a',
    transport: 'ship',
};

/**
 * Возвращает текущую зону по оставшемуся расстоянию
 */
export function getZoneByDistance(distanceLeft) {
    for (const zone of ZONES) {
        if (distanceLeft > zone.minDistance) return zone;
    }
    return MOON_ZONE;
}