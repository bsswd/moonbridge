import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,        // Автовыбор WebGL или Canvas
    width: 720,
    height: 1280,             // Портретное соотношение 9:16
    parent: 'game-container', // Куда вставлять canvas
    backgroundColor: '#0b0b1a',
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 }, // Сила тяжести
            debug: false          // Поставьте true, чтобы видеть физические границы
        }
    },
    
    scale: {
        mode: Phaser.Scale.FIT,           // Вписывает игру в экран
        autoCenter: Phaser.Scale.CENTER_BOTH // Центрирует
    },
    
    scene: [GameScene] // Подключаем нашу сцену
};

new Phaser.Game(config);