export const CONFIG = {
    BLOCK: {
        SIZE: 120,
        BOUNCE: 0.2,
        OVERLAP: 2,
    },

    PHYSICS: {
        MAX_ACTIVE_BLOCKS: 3,
    },

    CAMERA: {
        SPAWN_OFFSET: 150,
        TRIGGER_LINE: 0.8,
    },

    DISTANCE: {
        TOTAL: 384400,                // 384400 для финальной версии
        PER_BLOCK: 1,              // Нужно тестировать
    },

    CRANE: {
        SWING: 220,
        SPEED: 0.0025,
    },

    HELICOPTER: {
        SPEED_MIN: 150,
        SPEED_MAX: 300,
        HOVER_CHANCE: 0.3,
        HOVER_DURATION_MIN: 400,
        HOVER_DURATION_MAX: 1400,
        NEXT_HOVER_MIN: 1500,
        NEXT_HOVER_MAX: 3000,
        SPAWN_OFFSET: -18,
    },
    SHIP: {
        SPEED_MIN: 180,
        SPEED_MAX: 300,
        AMPLITUDE_MIN: 30,
        AMPLITUDE_MAX: 70,
        SPAWN_OFFSET: -20,
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

        BG_EARTH: 'bg_earth',
        BG_SKY: 'bg_sky',
        BG_SPACE: 'bg_space',
        
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
        ],

        // UI
        BAR_FILL: 'bar_fill',
        TEXT_PLATE: 'text_plate', 
    },

    // Настройки фона
        BACKGROUND: {
        TILE_HEIGHT: 720,  
        OVERLAP: 0,        
        },

    UI: {
    // Шрифты
    FONT_FAMILY: '"Daneehand"', 
    FONT_FAMILY_BOLD: '"Exo2-Bold"',
        
    // Размеры шрифтов
    FONT_SIZE_SMALL: '32px',
    FONT_SIZE_MEDIUM: '40px',
    FONT_SIZE_LARGE: '72px',
    FONT_SIZE_XLARGE: '104px',
        
    // Цвета текста
    COLOR_BLUE: '#130B60',      
    COLOR_RED: '#c10808',       
    COLOR_GREEN: '#007100fe',

    PROGRESS_BAR: {
            X: 20,              
            Y: 100,             
            WIDTH: 20,         
            HEIGHT: 1000,       
            COLOR_BG: 0x333333,
            COLOR_BORDER: 0x00ffcc, 
        },
    },

    // НАСТРОЙКИ ДЕБАГА
    DEBUG: {
        ENABLED: true,           // Включить/выключить дебаг-режим
        SKIP_DISTANCE: 1,     // Сколько км пропускать за одно нажатие        
    },

    // АЧИВКИ ПО НОМЕРАМ БЛОКОВ
    ACHIEVEMENTS: {
        1: "Первый шаг сделан!",
        10: "Десяточка! Фундамент крепок",
        27: "Красивый уход. Но это не точно",
        42: "42. Ответ на главный вопрос жизни, вселенной и всего такого",
        67: "67 - Хеллоу Полли!",
        100: "Сотня! Ты настоящий строитель мостов",
        400: "Почти у цели... Осталось всего-то 384 000 км!",
        2001: "2001 - Кубрик!",
        100000: "100 000! А ты хорош!",      
    },
};


export const ZONES = [
    {
        label: 'earth',
        name: 'ЗЕМЛЯ',
        color: '#1414af',
        minDistance: 200000, 
        transport: 'crane',
    },
    {
        label: 'sky',
        name: 'НЕБО',
        color: '#1a0b2e',
        minDistance: 80000, 
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