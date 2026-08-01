import { Transport } from './Transport.js';
import { CONFIG } from '../../config.js';
import { randomRange, randomSign } from '../../utils.js';

/**
 * Вертолёт — летает между краями экрана, случайно зависает (зона "Небо")
 */
export class Helicopter extends Transport {
    constructor(scene) {
        super(scene);
        this.direction = 1;
        this.speed = 0;
        this.baseY = 0;
        this.blockGap = -20;

        // Состояние зависания
        this.isHovering = false;
        this.hoverTimer = 0;
        this.hoverDuration = 0;
        this.nextHoverCheckTime = 0;
    }

    activate(spawnY) {
        super.activate(spawnY);

        if (!this.sprite) {
            this.sprite = this.scene.add.sprite(0, 0, CONFIG.TEXTURES.HELI);
            this.sprite.setScale(0.8);

            this.sprite.setOrigin(0.5, 0.5);
            this.sprite.setDepth(50);
        }

        this.direction = randomSign();
        this.speed = randomRange(CONFIG.HELICOPTER.SPEED_MIN, CONFIG.HELICOPTER.SPEED_MAX);
        this.baseY = spawnY;
        this.isHovering = false;
        this.hoverTimer = 0;
        this.nextHoverCheckTime = randomRange(2000, 4000);

        const startX = this.direction === 1 ? -100 : this.scene.scale.width + 100;
        this.sprite.setPosition(startX, this.baseY);
        this.sprite.setFlipX(this.direction === -1);

        this.sprite.setVisible(true);

        if (this.scene.anims.exists('heli_fly')) {
            this.sprite.play('heli_fly');
        }
    }

    update(time, delta) {
        if (this.isHovering) {
            this.hoverTimer += delta;
            if (this.hoverTimer >= this.hoverDuration) {
                this.isHovering = false;
                this.hoverTimer = 0;
                this.nextHoverCheckTime = randomRange(
                    CONFIG.HELICOPTER.NEXT_HOVER_MIN,
                    CONFIG.HELICOPTER.NEXT_HOVER_MAX
                );
            }
        } else {
            const newX = this.sprite.x + this.direction * this.speed * (delta / 1000);
            this.sprite.setPosition(newX, this.baseY);

            // Разворот у границ
            const margin = 150;
            if ((this.direction === 1 && newX > this.scene.scale.width - margin) ||
                (this.direction === -1 && newX < margin)) {
                this.direction *= -1;
                this.sprite.setFlipX(this.direction === -1);
            }

            // Случайное зависание
            this.hoverTimer += delta;
            if (this.hoverTimer > this.nextHoverCheckTime) {
                if (Math.random() < CONFIG.HELICOPTER.HOVER_CHANCE) {
                    this.isHovering = true;
                    this.hoverDuration = randomRange(
                        CONFIG.HELICOPTER.HOVER_DURATION_MIN,
                        CONFIG.HELICOPTER.HOVER_DURATION_MAX
                    );
                    this.hoverTimer = 0;
                } else {
                    this.nextHoverCheckTime = this.hoverTimer + randomRange(
                        CONFIG.HELICOPTER.NEXT_HOVER_MIN,
                        CONFIG.HELICOPTER.NEXT_HOVER_MAX
                    );
                }
            }
        }

        return {
            x: this.sprite.x,
            y: this.baseY,
        };
    }
}