import { CONFIG } from './config.js';

export class BackgroundManager {
    constructor(scene, textureKey, depth = -10) {
        this.scene = scene;
        this.textureKey = textureKey;
        this.depth = depth;
        this.tiles = [];
        
        // Высота одного тайла
        this.tileHeight = CONFIG.BACKGROUND.TILE_HEIGHT;        
        this.createInitialTiles();
    }

    /**
     * Создаём начальный набор тайлов, чтобы покрыть экран + небольшой запас
     */
    createInitialTiles() {
        const centerX = this.scene.scale.width / 2;
        const screenHeight = this.scene.scale.height;
        
        // Рассчитываем, сколько тайлов нужно, чтобы покрыть экран + 1 запасной сверху и снизу
        const count = Math.ceil(screenHeight / this.tileHeight) + 2;
        
        console.log(`🌍 Создаём начальные тайлы: ${count} шт., высота: ${this.tileHeight}`);

        for (let i = 0; i < count; i++) {
            // Располагаем их друг под другом, начиная чуть выше центра экрана
            const yPos = (i * this.tileHeight) - (this.tileHeight * 2);
            
            const tile = this.scene.add.image(centerX, yPos, this.textureKey);
            tile.setDepth(this.depth);
            tile.setDisplaySize(this.scene.scale.width, this.tileHeight);
            
            this.tiles.push(tile);
        }
    }

    /**
     * Главная логика: если нижний тайл ушёл за экран, переносим его наверх
     */
    update() {
        const camera = this.scene.cameras.main;
        const cameraBottomY = camera.worldView.bottom; // Нижняя граница видимой области камеры

        // 1. Ищем самый НИЖНИЙ тайл, который УЖЁ ушёл за нижнюю границу камеры
        let bottomTileIndex = -1;
        let maxY = -Infinity;

        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            const tileTopEdge = tile.y - (this.tileHeight / 2);

            // Если верхний край тайла ниже нижнего края камеры (с небольшим запасом в 50px)
            if (tileTopEdge > cameraBottomY + 50) {
                if (tile.y > maxY) {
                    maxY = tile.y;
                    bottomTileIndex = i;
                }
            }
        }

        // 2. Если такой тайл найден, переносим его на САМЫЙ ВЕРХ
        if (bottomTileIndex !== -1) {
            const tileToMove = this.tiles[bottomTileIndex];

            // Находим текущий самый ВЕРХНИЙ тайл (у него минимальный Y)
            let minY = Infinity;
            let topTileIndex = 0;
            
            for (let i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].y < minY) {
                    minY = this.tiles[i].y;
                    topTileIndex = i;
                }
            }

            const topTile = this.tiles[topTileIndex];

            // Перемещаем "нижний" тайл ровно над "верхним"
            tileToMove.y = topTile.y - this.tileHeight;
            
            // console.log(`Тайл перенесён наверх. Новый Y: ${tileToMove.y}`);
        }
    }

    destroy() {
        this.tiles.forEach(tile => tile.destroy());
        this.tiles = [];
    }
}