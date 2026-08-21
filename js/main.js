import StartScene from './StartScene.js';
import GameScene from './GameScene.js';

// 🌐 Глобальные переменные
window.ysdk = null;
window.GAME_LANG = 'ru';

/**
 * 1. Инициализация Yandex SDK и определение языка
 */
async function initYandexSDK() {
    try {
        window.ysdk = await YaGames.init();
        window.GAME_LANG = window.ysdk.environment.i18n.lang || 'ru';
        console.log('✅ SDK инициализирован. Язык:', window.GAME_LANG);
    } catch (error) {
        console.warn('⚠️ SDK не инициализирован (локальный запуск).', error);
        window.GAME_LANG = 'ru';
    }
}

/**
 * Конфигурация Phaser
 */
const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 720,
    height: 1080,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false,
        },
    },
    scene: [StartScene, GameScene],
    input: {
        mouse: { preventDefaultWheel: true, preventDefaultDown: true },
        touch: { capture: true },
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
    },
};

/**
 * 2. Запуск игры
 */
async function startGame() {
    // Ждём инициализации SDK
    await initYandexSDK();

    // 🎯 Ждём загрузки шрифта через ВСТРОЕННЫЙ API браузера (без внешних скриптов!)
    try {
        await document.fonts.load('16px Daneehand');
        console.log('✅ Шрифт Daneehand загружен');
    } catch (error) {
        console.warn('⚠️ Шрифт не загрузился, используем системный', error);
    }

    // Проверяем Phaser
    if (typeof Phaser === 'undefined') {
        console.error('❌ Phaser не найден! Проверь js/phaser.min.js');
        return;
    }

    // Запускаем игру
    const game = new Phaser.Game(phaserConfig);
    window.game = game;
    console.log('🚀 Игра запущена!');

    // Сообщаем Яндексу, что игра готова
    if (window.ysdk?.features?.LoadingAPI) {
        window.ysdk.features.LoadingAPI.ready();
        console.log('✅ LoadingAPI.ready() вызван');
    }
}

// Старт при загрузке страницы
window.addEventListener('load', startGame);