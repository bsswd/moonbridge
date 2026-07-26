import { CONFIG } from './config.js';

/**
 * Менеджер бесшовного фона.
 * Создаёт пул тайлов и перемещает их для создания эффекта бесконечной прокрутки.
 */
export class BackgroundManager {
    /**
     * @param {Phaser.Scene} scene
     * @param {string} textureKey - Ключ текстуры фона
     * @param {number} depth - Слой отрисовки (глубина)
     */
    constructor(scene, textureKey, depth = -10) {
        this.scene = scene;
        this.textureKey = textureKey;
        this.depth = depth;
        this.tiles = [];
        this.tileHeight = CONFIG.BACKGROUND.TILE_HEIGHT;
        
        this.createTiles();
    }

    /**
     * Создаёт пул тайлов фона
     */
    createTiles() {
        const centerX = this.scene.scale.width / 2;
        
        // Создаём 3-4 тайла, чтобы покрыть экран с запасом
        const tileCount = 5;
        
        for (let i = 0; i < tileCount; i++) {
            const tile = this.scene.add.image(
                centerX,
                this.scene.scale.height - (i * this.tileHeight) + this.tileHeight / 2,
                this.textureKey
            );
            
            tile.setDepth(this.depth);
            tile.setDisplaySize(this.scene.scale.width, this.tileHeight);
            
            this.tiles.push(tile);
        }
    }

    /**
     * Обновляет позицию тайлов при движении камеры
     */
    update() {
        const cameraY = this.scene.cameras.main.scrollY;
        const cameraBottom = cameraY + this.scene.scale.height;
        
        // Сортируем тайлы по Y (сверху вниз)
        this.tiles.sort((a, b) => a.y - b.y);
        
        // Проверяем каждый тайл
        this.tiles.forEach(tile => {
            const tileTop = tile.y - this.tileHeight / 2;
            const tileBottom = tile.y + this.tileHeight / 2;
            
            // Если тайл ушёл ниже камеры — перемещаем его наверх
            if (tileBottom < cameraY) {
                // Находим самый верхний тайл
                const topTile = this.tiles.reduce((min, t) => t.y < min.y ? t : min, this.tiles[0]);
                
                // Перемещаем текущий тайл над самым верхним
                tile.y = topTile.y - this.tileHeight;
            }
            // Если тайл выше камеры на высоту экрана — перемещаем вниз
            else if (tileTop > cameraBottom) {
                const bottomTile = this.tiles.reduce((max, t) => t.y > max.y ? t : max, this.tiles[0]);
                tile.y = bottomTile.y + this.tileHeight;
            }
        });
    }

    /**
     * Уничтожает все тайлы
     */
    destroy() {
        this.tiles.forEach(tile => tile.destroy());
        this.tiles = [];
    }
}