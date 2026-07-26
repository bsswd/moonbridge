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

        // Расстояние от нижней границы транспорта до центра блока
        this.blockYOffset = 10; // По умолчанию 10 пикселей
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
     * Возвращает мировые координаты для спавна блока.
     * Автоматически определяет, закреплен ли транспорт на экране (scrollFactor === 0)
     * или движется в игровом мире, и корректирует Y-координату.
     * 
     * @param {number} cameraScrollY - Текущая прокрутка камеры
     * @returns {{x: number, y: number}}
     */

    getBlockSpawnPosition(cameraScrollY) {
        if (!this.sprite) return { x: 0, y: 0 };

        // Проверяем, закреплен ли спрайт на экране (как кран)
        const isScreenFixed = this.sprite.scrollFactorX === 0;
        
        // Если закреплен, его Y - это экранные координаты. Прибавляем scroll камеры.
        // Если нет, его Y - это уже мировые координаты.
        const baseWorldY = isScreenFixed ? (this.sprite.y + cameraScrollY) : this.sprite.y;

        // Вычисляем нижнюю границу спрайта + настраиваемый отступ
        const attachY = baseWorldY + (this.sprite.displayHeight / 2) + this.blockYOffset;

        return {
            x: this.sprite.x,
            y: attachY
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
    
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}