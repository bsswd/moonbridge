import { Transport } from './Transport.js';
import { CONFIG } from '../../config.js';

/**
 * Кран — раскачивается по синусоиде (зона "Земля")
 * Использует загруженный PNG-спрайт.
 */
export class Crane extends Transport {
    constructor(scene) {
        super(scene);
        this.craneSprite = null;
    }

    activate(spawnY) {
        super.activate(spawnY);
        this.baseY = spawnY;

        // Создаём спрайт крана, если его ещё нет
        if (!this.craneSprite) {
            this.craneSprite = this.scene.add.image(0, 0, CONFIG.TEXTURES.CRANE);

            // Масштаб 1.5
            this.craneSprite.setScale(1.5);
            
            // Точка привязки: верхний центр спрайта
            this.craneSprite.setOrigin(0.5, 0); 
            
            // Фиксируем на экране, чтобы он не уезжал вместе с камерой вниз
            this.craneSprite.setScrollFactor(0); 
            
            // Рисуем поверх блоков (depth 50), но под UI (depth 100+)
            this.craneSprite.setDepth(50); 
        }

        this.craneSprite.setPosition(this.currentX, 50);

        this.craneSprite.setVisible(true);
    }

    getBlockAttachPoint() {
        // Кран закреплён на экране на Y=50
        // Чтобы получить мировую координату, нужно добавить scrollY камеры
        const cameraScrollY = this.scene.cameras.main.scrollY;
        const craneScreenY = 50; // Позиция крана на экране
        const craneWorldY = craneScreenY + cameraScrollY;
        
        // Нижняя граница крана в мировых координатах
        const craneBottom = craneWorldY + (this.craneSprite.displayHeight);
        
        return {
            x: this.craneSprite.x,
            y: craneBottom
        };
    }

    /**
     * @param {number} time
     * @param {number} delta
     * @param {object} zoneConfig - параметры зоны (swing, speed)
     */

    update(time, delta, zoneConfig) {
        const centerX = this.scene.scale.width / 2;
        const offset = Math.sin(time * CONFIG.CRANE.SPEED) * CONFIG.CRANE.SWING;
        const craneX = centerX + offset;
        const craneY = 0; // Отступ от самого верха экрана

        // Обновляем позицию крана
        if (this.craneSprite) {
            this.craneSprite.setPosition(craneX, craneY);
        }

        // Возвращаем координаты, где должен появиться блок
        return { 
            x: craneX, 
            y: this.baseY 
        };
    }

    deactivate() {
        super.deactivate();
        if (this.craneSprite) {
            this.craneSprite.setVisible(false);
        }
    }

    destroy() {
        super.destroy();
        if (this.craneSprite) {
            this.craneSprite.destroy();
            this.craneSprite = null;
        }
    }

     getBlockOffsetY() {
        return 20;
    }
}