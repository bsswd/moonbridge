/**
 * Базовый класс для транспорта (Crane, Helicopter, Ship).
 * Использует паттерн "Стратегия" — сцена не знает деталей движения.
 */
export class Transport {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
        this.active = false;
    }

    /**
     * Активирует транспорт на новой высоте
     * @param {number} spawnY
     */
    activate(spawnY) {
        this.active = true;
        if (this.sprite) this.sprite.setVisible(true);
    }

    /**
     * Деактивирует транспорт
     */
    deactivate() {
        this.active = false;
        if (this.sprite) this.sprite.setVisible(false);
    }

    /**
     * Обновляет позицию транспорта и возвращает координаты для блока
     * @param {number} time
     * @param {number} delta
     * @returns {{x: number, y: number}}
     */

    getBlockAttachPoint() {
        if (!this.sprite) return { x: 0, y: 0 };
        
        return {
            x: this.sprite.x,
            y: this.sprite.y + (this.sprite.displayHeight)
        };
    }

    update(time, delta) {
        throw new Error('Метод update() должен быть реализован в подклассе');
    }

    /**
     * Проверяет, должен ли транспорт вызвать Game Over (например, улетел за экран)
     * @returns {boolean}
     */
    isOutOfBounds() {
        return false;
    }

    /**
     * Возвращает Y-координату для подвешенного блока
     * @returns {number}
     */
    getBlockOffsetY() {
        return 50;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}