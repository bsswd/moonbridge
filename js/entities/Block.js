import { CONFIG } from '../config.js';

/**
 * Игровой блок моста.
 * Автоматически выбирает случайную текстуру из списка.
 * В случае определенного ивента загружает особенную текстуру.
 * Инкапсулирует физику, состояние и визуальное представление.
 */
export class Block {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} textureKey
     */
    constructor(scene, x, y, textureKey = null) {
        this.scene = scene;
        
        // Если текстура не передана, выбираем случайную
        this.textureKey = textureKey || this.getRandomBlockTexture();
        
        // Создаём физический объект
        this.sprite = scene.physics.add.image(x, y, this.textureKey);
        this.sprite.setImmovable(true);
        this.sprite.body.allowGravity = false;

        const bodyWidth = this.sprite.displayWidth;
        const bodyHeight = this.sprite.displayHeight - 10;
        
        this.sprite.body.setSize(bodyWidth, bodyHeight);
        
        this.isLanded = false;
    }

    /**
     * Выбирает случайный блок из массива
     * @returns {string} Ключ текстуры
     */
    getRandomBlockTexture() {
        const blocks = CONFIG.TEXTURES.BLOCKS;
        
        if (!blocks || blocks.length === 0) {
            console.warn('Массив блоков пуст! Использую block_01');
            return 'block_01';
        }
        
        const randomIndex = Math.floor(Math.random() * blocks.length);
        const selectedBlock = blocks[randomIndex];

        return selectedBlock;
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    get size() { return this.sprite.displayWidth; }

    /**
     * Начинает падение (для активного блока)
     */
    startFalling() {
        this.sprite.setImmovable(false);
        this.sprite.body.allowGravity = true;
        this.sprite.setBounce(CONFIG.BLOCK.BOUNCE);
    }

    /**
     * Фиксирует блок после успешной посадки
     */
    fixInPlace() {
        this.sprite.setImmovable(true);
        this.sprite.body.allowGravity = false;
        this.sprite.body.setVelocity(0, 0);
        this.sprite.body.setAngularVelocity(0);
        this.sprite.body.setAngularDrag(0);
        this.sprite.setBounce(0);
        this.isLanded = true;
    }

    /**
     * Сбрасывает блок в сторону (при промахе)
     * @param {number} direction -1 или +1
     */
    slideAway(direction) {
        this.sprite.setImmovable(false);
        this.sprite.body.allowGravity = true;
        this.sprite.setBounce(CONFIG.BLOCK.BOUNCE);
        this.sprite.setVelocityX(direction * 160);
        this.sprite.setVelocityY(0);
        this.sprite.setAngularVelocity(direction * 180);
    }

    /**
     * Проверяет, достаточно ли блок перекрыт с целевым
     * @param {Block} targetBlock
     * @returns {boolean}
     */
    isBalancedOn(targetBlock) {
        const diffX = Math.abs(this.x - targetBlock.x);
        return diffX <= this.size / CONFIG.BLOCK.OVERLAP;
    }

    // Устанавливает цвет блока (для визуального эффекта)
    setTint(color) {
        this.sprite.setTint(color);
    }

    // Уничтожает блок
    destroy() {
        this.sprite.destroy();
    }
}