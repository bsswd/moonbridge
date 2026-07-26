import { Transport } from './Transport.js';
import { CONFIG } from '../../config.js';

/**
 * Кран — раскачивается по синусоиде (зона "Земля")
 */
export class Crane extends Transport {
    constructor(scene) {
        super(scene);
        // У крана нет отдельного спрайта — блок сам "висит на тросе"
    }

    activate(spawnY) {
        super.activate(spawnY);
        this.baseY = spawnY;
    }

    /**
     * @param {number} time
     * @param {number} delta
     * @param {object} zoneConfig - параметры зоны (swing, speed)
     */
    update(time, delta, zoneConfig) {
        const centerX = this.scene.scale.width / 2;
        const offset = Math.sin(time * CONFIG.CRANE.SPEED) * CONFIG.CRANE.SWING;
        return {
            x: centerX + offset,
            y: this.baseY,
        };
    }

    deactivate() {
        super.deactivate();
    }

    getBlockOffsetY() {
        return 20;
    }
}