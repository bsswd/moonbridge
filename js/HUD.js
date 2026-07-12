import { CONFIG } from './config.js';
import { formatDistance } from './utils.js';

/**
 * Интерфейс: расстояние, прогресс-бар, название зоны
 */
export class HUD {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;

        // Текст расстояния
        this.distanceText = scene.add.text(20, 20, '', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        }).setScrollFactor(0);

        // Прогресс-бар: фон
        this.progressBg = scene.add.rectangle(
            scene.scale.width / 2, 70, 400, 12, 0x333333
        ).setScrollFactor(0).setOrigin(0.5);

        // Прогресс-бар: заполнение
        this.progressFill = scene.add.rectangle(
            scene.scale.width / 2 - 200, 70, 0, 12, 0x00ffcc
        ).setScrollFactor(0).setOrigin(0, 0.5);

        // Название зоны
        this.zoneText = scene.add.text(scene.scale.width - 20, 20, '', {
            fontSize: '24px',
            fill: '#00ffcc',
            fontFamily: 'Arial',
        }).setOrigin(1, 0).setScrollFactor(0);
    }

    /**
     * Обновляет все элементы UI
     * @param {number} distanceLeft
     * @param {number} totalDistance
     * @param {string} zoneName
     */
    update(distanceLeft, totalDistance, zoneName) {
        // Расстояние
        this.distanceText.setText(`Осталось: ${formatDistance(distanceLeft)} км`);

        // Прогресс-бар
        const progress = Math.max(0, distanceLeft / totalDistance);
        const fillWidth = 400 * (1 - progress);
        this.progressFill.setSize(fillWidth, 12);
        this.progressFill.setPosition(this.scene.scale.width / 2 - 200, 70);

        // Цвет прогресс-барa
        if (progress < 0.2) {
            this.progressFill.setFillStyle(0xff4444);
        } else if (progress < 0.5) {
            this.progressFill.setFillStyle(0xffaa00);
        } else {
            this.progressFill.setFillStyle(0x00ffcc);
        }

        // Зона
        this.zoneText.setText(zoneName);
    }
}