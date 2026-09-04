import { Transport } from './Transport.js';
import { CONFIG } from '../../config.js';

export class Crane extends Transport {
    constructor(scene) {
        super(scene);
        this.craneSprite = null;
        this.currentX = scene.scale.width / 2;
        this.SCREEN_Y = -10; 
    }

    activate(spawnY) {
        super.activate(spawnY);

        if (!this.craneSprite) {
            this.craneSprite = this.scene.add.image(0, 0, CONFIG.TEXTURES.CRANE);
            
            this.craneSprite.setScale(1);
            this.craneSprite.setOrigin(0.5, 0); 
            this.craneSprite.setScrollFactor(0);
            this.craneSprite.setDepth(50);
        }

        this.craneSprite.setPosition(this.currentX, this.SCREEN_Y);
        this.craneSprite.setVisible(true);
    }

        getBlockSpawnPosition() {
        if (!this.craneSprite) {
            return { x: this.scene.scale.width / 2, y: 100 };
        }

        const cameraScrollY = this.scene.cameras.main.scrollY;
        const craneWorldY = this.craneSprite.y + cameraScrollY;
        const craneBottom = craneWorldY + this.craneSprite.displayHeight;
       
        const gap = 50;

        return {
            x: this.currentX,
            y: craneBottom + gap
        };
    }

    update(time, delta, zoneConfig) {
        const centerX = this.scene.scale.width / 2;
        const speed = zoneConfig?.speed || CONFIG.CRANE.SPEED;
        const swing = zoneConfig?.swing || CONFIG.CRANE.SWING;

        const offset = Math.sin(time * speed) * swing;
        this.currentX = centerX + offset;

        if (this.craneSprite) {
            this.craneSprite.setPosition(this.currentX, this.SCREEN_Y);
        }

        return { 
            x: this.currentX, 
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
}