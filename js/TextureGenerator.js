import { CONFIG } from './config.js';

/**
 * Генерирует временные текстуры из примитивов.
 * В будущем легко заменяется на загрузчик спрайтов.
 */
export class TextureGenerator {
    /**
     * Генерирует все текстуры игры
     * @param {Phaser.Scene} scene
     */
    static generateAll(scene) {
        this.generateBlock(scene);
        this.generateGround(scene, scene.scale.width);
        scene.load.image(CONFIG.TEXTURES.CRANE, 'assets/images/crane.png');
        this.generateHeli(scene);
        this.generateShip(scene);
        this.generateMoon(scene);
    }

    static generateBlock(scene) {
        const size = CONFIG.BLOCK.SIZE;
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x00ffcc, 1);
        g.fillRect(0, 0, size, size);
        g.lineStyle(3, 0xffffff, 0.6);
        g.strokeRect(0, 0, size, size);
        g.generateTexture(CONFIG.TEXTURES.BLOCK, size, size);
    }

    static generateGround(scene, width) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x1a1a2e, 1);
        g.fillRect(0, 0, width, 80);
        g.lineStyle(2, 0x00ffcc, 0.3);
        g.strokeRect(0, 0, width, 80);
        g.generateTexture(CONFIG.TEXTURES.GROUND, width, 80);
    }


    static generateHeli(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xcccccc, 1);
        g.fillRect(0, 0, 70, 40);
        g.fillStyle(0x444444, 1);
        g.fillRect(50, 12, 20, 16);
        g.fillStyle(0xff6600, 1);
        g.fillCircle(30, 30, 15);
        g.generateTexture(CONFIG.TEXTURES.HELI, 70, 40);
    }

    static generateShip(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xcccccc, 1);
        g.fillTriangle(0, 20, 50, 0, 50, 40);
        g.fillStyle(0x444444, 1);
        g.fillRect(50, 12, 20, 16);
        g.fillStyle(0xff6600, 1);
        g.fillCircle(15, 20, 6);
        g.generateTexture(CONFIG.TEXTURES.SHIP, 70, 40);
    }

    static generateMoon(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xdddddd, 1);
        g.fillCircle(100, 100, 100);
        g.fillStyle(0xaaaaaa, 1);
        g.fillCircle(60, 70, 25);
        g.fillCircle(140, 110, 18);
        g.fillCircle(100, 140, 15);
        g.generateTexture(CONFIG.TEXTURES.MOON, 200, 200);
    }

    /**
     * В будущем: загрузка настоящих спрайтов
     * @param {Phaser.Scene} scene
     * @param {Function} onComplete
     */
    // static loadAll(scene, onComplete) {
    //     scene.load.image(CONFIG.TEXTURES.BLOCK, 'assets/block.png');
    //     scene.load.image(CONFIG.TEXTURES.HELI, 'assets/heli.png');
    //     ...
    //     scene.load.on('complete', onComplete);
    //     scene.load.start();
    // }
}