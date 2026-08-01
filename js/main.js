import Phaser from 'phaser';
import GameScene from './GameScene.js';
import { CONFIG } from './config.js';

WebFont.load({
    custom: {
        families: ['Daneehand'],
        urls: ['./assets/fonts/Daneehand.ttf']
    },
    active: () => {
        console.log('Шрифты загружены');
       
    },
    inactive: () => {
        console.warn('Шрифты не загрузились, используем системные');
        
    }
});


/**
 * Конфигурация движка Phaser
 */
const phaserConfig = {
    type: Phaser.AUTO, // WebGL или Canvas
    parent: 'game-container',
    width: 720,
    height: 1080,
    backgroundColor: '#000000',

    // Масштабирование под экран
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    // Физика
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false, //  true для отладки физики
        },
    },

    // Сцены
    scene: [GameScene],

    // Отключаем контекстное меню по правому клику
    input: {
        mouse: {
            preventDefaultWheel: true,
            preventDefaultDown: true,
        },
        touch: {
            capture: true,
        },
    },

    // Рендеринг
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
    },
};

/**
 * Запуск игры
 */
window.addEventListener('load', () => {
    const game = new Phaser.Game(phaserConfig);

    // Делаем игру доступной глобально (для отладки в консоли)
    window.game = game;

    console.log('Игра "384400+12 см" запущена!');
});