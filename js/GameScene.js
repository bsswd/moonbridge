import Phaser from 'phaser'; 
import { CONFIG, getZoneByDistance } from './config.js';
import { TextureGenerator } from './TextureGenerator.js';
import { AudioManager } from './AudioManager.js';
import { HUD } from './HUD.js';
import { Block } from './entities/Block.js';
import { Crane } from './entities/transports/Crane.js';
import { Helicopter } from './entities/transports/Helicopter.js';
import { Ship } from './entities/transports/Ship.js';
import { Puff } from './effects/Puff.js';
import { randomRange } from './utils.js';
import { BackgroundManager } from './BackgroundManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // Состояние игры
        this.distanceLeft = CONFIG.DISTANCE.TOTAL;
        this.distanceAchived = 0;
        this.currentZone = null;
        
        // Сущности
        this.installedBlocks = [];      // уже поставленные блоки
        this.physicsBlocks = [];        // блоки с активной физикой (для оптимизации)
        this.activeBlock = null;        // текущий падающий блок
        this.activeTransport = null;    // текущий транспорт
        
        // Флаги состояния
        this.isGameOver = false;
        this.isDropping = false;
        this.isProcessingLanding = false;
        
        // Коллизии (нужно хранить для очистки)
        this.colliders = [];
        
        // Земля
        this.ground = null;
        this.moon = null;
        
        // Менеджеры
        this.backgroundManager = null;
        this.audio = new AudioManager();
        this.hud = null;

        // Фабрика транспорта
        this.transportFactories = {
            crane: () => new Crane(this),
            heli: () => new Helicopter(this),
            ship: () => new Ship(this),
        };
    }

    preload() {
        // Показываем, что загрузка началась
        console.log('Начинаем загрузку спрайтов...');

        // Загружаем окружение
        this.load.image(CONFIG.TEXTURES.BG_EARTH, 'assets/images/bg_earth.png');
        this.load.image(CONFIG.TEXTURES.BG_SKY, 'assets/images/bg_sky.png');
        this.load.image(CONFIG.TEXTURES.BG_SPACE, 'assets/images/bg_space.png');
        this.load.image(CONFIG.TEXTURES.GROUND, 'assets/images/ground.png');
        this.load.image(CONFIG.TEXTURES.MOON, 'assets/images/moon.png');
        console.log('Окружение загружено');

        // Загружаем блоки  
       if (CONFIG.TEXTURES.BLOCKS && Array.isArray(CONFIG.TEXTURES.BLOCKS)) {
            CONFIG.TEXTURES.BLOCKS.forEach(blockKey => {
                this.load.image(blockKey, `assets/images/${blockKey}.png`); 
            });
            console.log(`В очередь загрузки добавлено блоков: ${CONFIG.TEXTURES.BLOCKS.length}`);
        } else {
            console.warn('Массив BLOCKS не найден в конфиге!');
        }

        // Загружаем транспорт
        this.load.image(CONFIG.TEXTURES.CRANE, 'assets/images/crane.png');
        this.load.image(CONFIG.TEXTURES.HELI, 'assets/images/heli.png');
        this.load.image(CONFIG.TEXTURES.SHIP, 'assets/images/ship.png');
        console.log('Транспорт загружен');

        // Загружаем эффекты
        this.load.spritesheet(
            'puff_spritesheet',                    
            'assets/images/puff_spritesheet.png', 
            { 
                frameWidth: 128,   
                frameHeight: 128   
            }
        );
        console.log('Эффекты загружены');

        // Загружаем UI
        this.load.image(CONFIG.TEXTURES.BAR_FILL, 'assets/images/bar_fill.png');
        console.log('UI загружен');

        // Обработка ошибок
        this.load.on('loaderror', (file) => {
            console.error('НЕ УДАЛОСЬ ЗАГРУЗИТЬ: ${file.key} (${file.src})');
        });

        // Когда всё загрузилось
        this.load.on('complete', () => {
            console.log('Все спрайты успешно загружены!');
        });
    }

    create() {
        // Создание эффекта приземления
         this.anims.create({
            key: 'puff',
            frames: this.anims.generateFrameNumbers('puff_spritesheet', { 
                start: 0,   
                end: 6      
            }),
            frameRate: 12,       
            repeat: 0,           
            hideOnComplete: true
        });

        // Инициализация звуков
        this.audio.init(this);

        // Создание земли
        const centerX = this.scale.width / 2;
        this.ground = this.physics.add.staticImage(
            centerX, this.scale.height - 40, CONFIG.TEXTURES.GROUND
        );
        this.ground.setDepth(-1);
        
        // Создание тайлового фона
        this.backgroundManager = new BackgroundManager(this, CONFIG.TEXTURES.BG_EARTH, -10);

        // Базовый блок
        const baseY = this.scale.height - 140;
        const baseBlock = new Block(this, centerX, baseY);
        this.installedBlocks.push(baseBlock);
        this.physicsBlocks.push(baseBlock);

        // UI
        this.hud = new HUD(this);

        // Настройка мира
        this.physics.world.setBounds(0, -100000, this.scale.width, 100000 + this.scale.height);
        this.input.on('pointerdown', this.dropBlock, this);

        // Начальная зона
        this.currentZone = getZoneByDistance(this.distanceLeft);
        this.cameras.main.setBackgroundColor(this.currentZone.color);
        this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);

        // Спавн первого блока
        this.spawnBlock();
    }

    /**
     * Спавн нового активного блока и транспорта для текущей зоны
     */
    spawnBlock() {
        if (this.isGameOver) return;

        this.isDropping = false;
        this.isProcessingLanding = false;
        this.clearColliders();

        const zone = getZoneByDistance(this.distanceLeft);
        const spawnY = this.cameras.main.scrollY + CONFIG.CAMERA.SPAWN_OFFSET;

        // Создаём/активируем транспорт
        if (!this.activeTransport || this.activeTransport.constructor.name.toLowerCase() !== zone.transport) {
            if (this.activeTransport) this.activeTransport.destroy();
            this.activeTransport = this.transportFactories[zone.transport]();
        }
        this.activeTransport.activate(spawnY);

        // Обновляем позицию транспорта
        this.activeTransport.update(this.time.now, 0, this.currentZone);
        
        // 🎯 ВЫЗОВ БЕЗ АРГУМЕНТОВ
        const spawnPos = this.activeTransport.getBlockSpawnPosition();

        // Создаём блок
        this.activeBlock = new Block(this, spawnPos.x, spawnPos.y);
        
        if (zone.transport === 'crane') {
            this.activeBlock.addGlow();
        }
    }

    /**
     * Обработка клика — сброс блока
     */
    dropBlock() {
        if (!this.activeBlock || this.isDropping || this.isGameOver) return;

        this.isDropping = true;
        this.activeBlock.startFalling();
        this.audio.play('drop');

        const topBlock = this.installedBlocks[this.installedBlocks.length - 1];

        // Коллизия с верхним блоком (главная)
        this.colliders.push(
            this.physics.add.collider(
                this.activeBlock.sprite, topBlock.sprite,
                this.onBlockLanded, null, this
            )
        );
       

         // Коллизия с остальными блоками — если упал не на верхний, проигрыш
        this.installedBlocks.forEach(block => {
            if (block !== topBlock) {
                this.colliders.push(
                    this.physics.add.collider(
                        this.activeBlock.sprite, block.sprite,
                        () => {
                            if (!this.isGameOver && this.isDropping) {
                                this.gameOver();
                            }
                        },
                        null, this
                    )
                );
            }
        });


        // Коллизия с землёй = проигрыш
        this.colliders.push(
            this.physics.add.collider(
                this.activeBlock.sprite, this.ground,
                this.onGroundHit, null, this
            )
        );

        // Защита от зависания
        this.time.delayedCall(3000, () => {
            if (!this.isGameOver && this.activeBlock) {
                const bottomLimit = this.cameras.main.scrollY + this.scale.height + 300;
                if (this.activeBlock.y > bottomLimit) {
                    this.gameOver();
                }
            }
        });
    }

    

    /**
     * Попадание блока в землю
     */
    onGroundHit(blockSprite, groundSprite) {
        if (this.isGameOver || !this.isDropping) return;

        if (blockSprite.body) {
            blockSprite.body.stop();
            blockSprite.body.allowGravity = false;
            blockSprite.body.moves = false;
        }

        this.time.delayedCall(600, () => {
            if (!this.isGameOver) this.gameOver();
        });
    }

    /**
     * Приземление блока на другой блок
     */
    onBlockLanded(fallingSprite, targetSprite) {
        if (this.isGameOver || this.isProcessingLanding) return;
        if (!this.activeBlock || fallingSprite !== this.activeBlock.sprite) return;
        

        this.isProcessingLanding = true;
        this.clearColliders();

        const fallingBlock = this.activeBlock;
        const targetBlock = this.installedBlocks[this.installedBlocks.length - 1];

        // Проверка баланса
        if (!fallingBlock.isBalancedOn(targetBlock)) {
            const direction = fallingBlock.x > targetBlock.x ? 1 : -1;
            fallingBlock.slideAway(direction);
            this.activeBlock = null;
            this.isDropping = false;
            this.audio.play('fail');
            this.time.delayedCall(1800, () => this.gameOver());
            return;
        }

        // Успешная посадка
        fallingBlock.fixInPlace();
        this.installedBlocks.push(fallingBlock);
        this.physicsBlocks.push(fallingBlock);
        this.activeBlock = null;
        this.audio.play('land');

        const effectX = fallingBlock.x + /*(fallingBlock.size/2) + */randomRange(-30, 30);
        const effectY = fallingBlock.y + (fallingBlock.size/2) + randomRange(-15, 10);

        new Puff(this, effectX, effectY);

        // Обновление расстояния
        this.distanceLeft -= CONFIG.DISTANCE.PER_BLOCK;
        this.distanceAchived += CONFIG.DISTANCE.PER_BLOCK;

        // Проверка победы
        if (this.distanceLeft <= 0) {
            this.distanceLeft = 0;
            this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);
            this.victory();
            return;
        }

        // Проверка смены зоны
        const newZone = getZoneByDistance(this.distanceLeft);
        if (newZone.label !== this.currentZone.label) {
            this.currentZone = newZone;
            this.onZoneChange(newZone);
        }

        // Обновление UI
        this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);

        
        // Оптимизация: отключаем физику у старых блоков
        if (this.physicsBlocks.length > CONFIG.PHYSICS.MAX_ACTIVE_BLOCKS) {
            const oldBlock = this.physicsBlocks.shift();
            if (oldBlock?.sprite?.body) {
                oldBlock.sprite.body.enable = false;
            }
        }


        // Движение камеры
        const triggerLine = this.cameras.main.scrollY + (this.scale.height * CONFIG.CAMERA.TRIGGER_LINE);
        if (fallingBlock.y < triggerLine) {
            const targetScrollY = fallingBlock.y - (this.scale.height * CONFIG.CAMERA.TRIGGER_LINE);
            this.tweens.add({
                targets: this.cameras.main,
                scrollY: targetScrollY,
                duration: 600,
                ease: 'Sine.easeInOut',
            });
        }

        this.time.delayedCall(400, () => this.spawnBlock());
    }

    /**
     * Смена игровой зоны
     */
    onZoneChange(zone) {
        // Меняем фон в зависимости от зоны
        if (this.backgroundManager) {
            this.backgroundManager.destroy();
        }
        
        let bgTexture = CONFIG.TEXTURES.BG_EARTH;

        if (zone.label === 'sky') {
            bgTexture = CONFIG.TEXTURES.BG_SKY;
        } else if (zone.label === 'space') {
            bgTexture = CONFIG.TEXTURES.BG_SPACE;
        }
        
        this.backgroundManager = new BackgroundManager(this, bgTexture, -10);

        this.cameras.main.setBackgroundColor(zone.color);
        this.audio.play('zone');

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height * 0.4;

        const text = this.add.text(cx, cy, zone.name, {
            fontSize: CONFIG.UI.FONT_SIZE_XLARGE,
            fill: CONFIG.UI.COLOR_BLUE,
            fontStyle: 'bold',
            fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 400,
            yoyo: true,
            hold: 1200,
            onComplete: () => text.destroy(),
        });
    }

    /**
     * Победа
     */
    victory() {
        this.isGameOver = true;
        this.clearColliders();
        this.audio.play('victory');

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height / 2;

        if (!this.moon) {
            this.moon = this.add.image(cx, this.cameras.main.scrollY - 600, CONFIG.TEXTURES.MOON);
            this.moon.setScale(0.25);
        }

        this.tweens.add({
            targets: this.moon,
            scale: 1,
            alpha: 1,
            y: cy - 100,
            duration: 1500,
            ease: 'Power2',
        });

        this.time.delayedCall(1600, () => {
            this.add.text(cx, cy - 80, 'А ВОТ И ЛУНА!', {
                fontSize: CONFIG.UI.FONT_SIZE_XLARGE, fill: CONFIG.UI.COLOR_GREEN, fontStyle: 'bold', fontFamily: CONFIG.UI.FONT_FAMILY,
            }).setOrigin(0.5);

            this.add.text(cx, cy, 'Вы преодолели 384 400 км. +/- 12 см.', {
                fontSize: CONFIG.UI.FONT_SIZE_MEDIUM, fill: CONFIG.UI.COLOR_BLUE, fontFamily: CONFIG.UI.FONT_FAMILY,
            }).setOrigin(0.5);

            const hint = this.add.text(cx, cy + 60, 'Нажмите для рестарта', {
                fontSize: CONFIG.UI.FONT_SIZE_SMALL, fill: CONFIG.UI.COLOR_BLUE, fontFamily: CONFIG.UI.FONT_FAMILY,
            }).setOrigin(0.5);

            this.tweens.add({
                targets: hint, alpha: 0, duration: 700, yoyo: true, repeat: -1,
            });

            this.input.once('pointerdown', () => this.scene.restart());
        });
    }

    /**
     * Конец игры
     */
    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.clearColliders();

        if (this.activeBlock) {
            this.activeBlock.setTint(0xff0000);
        }

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height / 2;

        this.add.text(cx, cy - 50, 'ИГРА ОКОНЧЕНА', {
            fontSize: CONFIG.UI.FONT_SIZE_XLARGE, fill: CONFIG.UI.COLOR_RED, fontStyle: 'bold', fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setOrigin(0.5);

        this.add.text(cx, cy + 20, `Вы прошли: ${this.distanceAchived} км.`, {
            fontSize: CONFIG.UI.FONT_SIZE_MEDIUM, fill: CONFIG.UI.COLOR_BLUE, fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setOrigin(0.5);

        const hint = this.add.text(cx, cy + 80, 'Нажмите для рестарта', {
            fontSize: CONFIG.UI.FONT_SIZE_SMALL, fill: CONFIG.UI.COLOR_BLUE, fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: hint, alpha: 0, duration: 700, yoyo: true, repeat: -1,
        });

        this.input.once('pointerdown', () => this.scene.restart());
    }

    /**
     * Главный цикл обновления
     */
    update(time, delta) {
        //Обновление позиции фона
        if (this.backgroundManager) {
            this.backgroundManager.update();
        }

        // Обновление транспорта и позиции активного блока
        if (this.activeBlock && !this.isDropping && !this.isGameOver && this.activeTransport) {
            this.activeTransport.update(time, delta, this.currentZone);
            
            // 🎯 ВЫЗОВ БЕЗ АРГУМЕНТОВ
            const blockPos = this.activeTransport.getBlockSpawnPosition();
            
            this.activeBlock.sprite.setPosition(blockPos.x, blockPos.y);

            if (this.activeTransport.isOutOfBounds()) {
                this.gameOver();
            }
        }

        // Проверка "зависшего" падающего блока
        if (this.activeBlock && this.isDropping && !this.isGameOver && !this.isProcessingLanding) {
            const v = this.activeBlock.sprite.body.velocity.y;
            const last = this.installedBlocks[this.installedBlocks.length - 1];
            if (Math.abs(v) < 10 && this.activeBlock.y > last.y + 200) {
                this.gameOver();
            }
        }
    }

    /**
     * Очищает все активные коллайдеры
     */
    clearColliders() {
        this.colliders.forEach(c => c?.destroy());
        this.colliders = [];
    }
}