import { Transport } from './Transport.js';
import { CONFIG } from '../../config.js';
import { randomRange, randomSign } from '../../utils.js';

/**
 * Космический корабль — пролетает через экран (зона "Космос")
 * В случае, если корабль улетел за другую границу - проигрыш.
 */
export class Ship extends Transport {
    constructor(scene) {
        super(scene);
        this.direction = 1;
        this.speed = 0;
        this.baseY = 0;
        this.amplitude = 0;
        this.spawnTime = 0;
        this.blockGap = -70;
    }

    activate(spawnY) {
        super.activate(spawnY);

        if (!this.sprite) {
            this.sprite = this.scene.add.image(0, 0, CONFIG.TEXTURES.SHIP);
            this.sprite.setScale(0.8);
        }

        this.direction = randomSign();
        this.speed = randomRange(CONFIG.SHIP.SPEED_MIN, CONFIG.SHIP.SPEED_MAX);
        this.amplitude = randomRange(CONFIG.SHIP.AMPLITUDE_MIN, CONFIG.SHIP.AMPLITUDE_MAX);

        const minHeight = this.scene.cameras.main.scrollY + 60;
        const randomOffset = (Math.random() - 0.5) * 120;
        this.baseY = Math.max(minHeight, spawnY - 30 + randomOffset);

        this.spawnTime = this.scene.time.now;

        const startX = this.direction === 1 ? -100 : this.scene.scale.width + 100;
        this.sprite.setPosition(startX, this.baseY);
        this.sprite.setFlipX(this.direction === -1);
    }

    update(time, delta) {
        const newX = this.sprite.x + this.direction * this.speed * (delta / 1000);
        const wobble = Math.sin(time * 0.005) * this.amplitude;
        const newY = this.baseY + wobble;

        this.sprite.setPosition(newX, newY);

        return {
            x: newX,
            y: newY,
        };
    }

    isOutOfBounds() {
        const margin = 150;
        return (this.direction === 1 && this.sprite.x > this.scene.scale.width + margin) ||
               (this.direction === -1 && this.sprite.x < -margin);
    }
}