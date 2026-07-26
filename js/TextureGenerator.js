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
        this.generateGround(scene, scene.scale.width);
        
    }

    static generateGround(scene, width) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x1a1a2e, 1);
        g.fillRect(0, 0, width, 80);
        g.lineStyle(2, 0x00ffcc, 0.3);
        g.strokeRect(0, 0, width, 80);
        g.generateTexture(CONFIG.TEXTURES.GROUND, width, 80);
    }

    /*
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
        */
}