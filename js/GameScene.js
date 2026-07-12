import Phaser from 'phaser'; 
import { CONFIG, getZoneByDistance } from './config.js';
import { TextureGenerator } from './TextureGenerator.js';
import { AudioManager } from './AudioManager.js';
import { HUD } from './HUD.js';
import { Block } from './entities/Block.js';
import { Crane } from './entities/transports/Crane.js';
import { Helicopter } from './entities/transports/Helicopter.js';
import { Ship } from './entities/transports/Ship.js';

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
        this.audio = new AudioManager();
        this.hud = null;

        // Фабрика транспорта
        this.transportFactories = {
            crane: () => new Crane(this),
            heli: () => new Helicopter(this),
            ship: () => new Ship(this),
        };
    }

    create() {
        // 1. Генерация текстур
        TextureGenerator.generateAll(this);

        // 2. Инициализация звуков
        this.audio.init(this);

        // 3. Создание земли
        const centerX = this.scale.width / 2;
        this.ground = this.physics.add.staticImage(
            centerX, this.scale.height - 40, CONFIG.TEXTURES.GROUND
        );
        this.ground.setDepth(-1);

        // 4. Базовый блок
        const baseY = this.scale.height - 140;
        const baseBlock = new Block(this, centerX, baseY);
        this.installedBlocks.push(baseBlock);
        this.physicsBlocks.push(baseBlock);

        // 5. UI
        this.hud = new HUD(this);

        // 6. Настройка мира
        this.physics.world.setBounds(0, -100000, this.scale.width, 100000 + this.scale.height);
        this.input.on('pointerdown', this.dropBlock, this);

        // 7. Начальная зона
        this.currentZone = getZoneByDistance(this.distanceLeft);
        this.cameras.main.setBackgroundColor(this.currentZone.color);
        this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);

        // 8. Спавн первого блока
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

        // Создаём/активируем нужный транспорт
        if (!this.activeTransport || this.activeTransport.constructor.name.toLowerCase() !== zone.transport) {
            if (this.activeTransport) this.activeTransport.destroy();
            this.activeTransport = this.transportFactories[zone.transport]();
        }
        this.activeTransport.activate(spawnY);

        // Создаём активный блок под транспортом
        const pos = this.activeTransport.update(0, 0);
        this.activeBlock = new Block(this, pos.x, pos.y + this.activeTransport.getBlockOffsetY());

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
        this.cameras.main.setBackgroundColor(zone.color);
        this.audio.play('zone');

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height * 0.4;

        const text = this.add.text(cx, cy, zone.name, {
            fontSize: '56px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial',
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
            this.moon.setScale(0.5);
        }

        this.tweens.add({
            targets: this.moon,
            scale: 1.5,
            alpha: 1,
            y: cy - 100,
            duration: 1500,
            ease: 'Power2',
        });

        this.time.delayedCall(1600, () => {
            this.add.text(cx, cy - 80, 'ЛУНА ДОСТИГНУТА!', {
                fontSize: '52px', fill: '#00ffcc', fontStyle: 'bold', fontFamily: 'Arial',
            }).setOrigin(0.5);

            this.add.text(cx, cy, 'Вы преодолели 384 400 км. +/- 12 см.', {
                fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial',
            }).setOrigin(0.5);

            const hint = this.add.text(cx, cy + 60, 'Нажмите для рестарта', {
                fontSize: '24px', fill: '#aaaaaa', fontFamily: 'Arial',
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
            fontSize: '48px', fill: '#ff4444', fontStyle: 'bold', fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.add.text(cx, cy + 20, `Вы прошли: ${this.distanceAchived} км.`, {
            fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial',
        }).setOrigin(0.5);

        const hint = this.add.text(cx, cy + 80, 'Нажмите для рестарта', {
            fontSize: '24px', fill: '#aaaaaa', fontFamily: 'Arial',
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
        // Обновление транспорта и позиции активного блока
        if (this.activeBlock && !this.isDropping && !this.isGameOver && this.activeTransport) {
            const pos = this.activeTransport.update(time, delta, this.currentZone);
            this.activeBlock.sprite.setPosition(
                pos.x,
                pos.y + this.activeTransport.getBlockOffsetY()
            );

            // Проверка выхода транспорта за границы (для корабля)
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