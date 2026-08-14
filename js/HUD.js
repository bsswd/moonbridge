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

        // Подложка для расстояния
        this.plateDistance = scene.add.image(
            scene.scale.width - 580, 30,                       
            CONFIG.TEXTURES.TEXT_PLATE
        );
        this.plateDistance.setScrollFactor(0);
        this.plateDistance.setDepth(150); 

        // Текст расстояние
        this.distanceText = scene.add.text(20, 20, '', {
            fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
            fill: CONFIG.UI.COLOR_BLUE,
            fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setScrollFactor(0);
        this.distanceText.setDepth(200);

        // Подложка для названия зоны
        this.plateZone = scene.add.image(
            scene.scale.width - 0, 30,                      
            CONFIG.TEXTURES.TEXT_PLATE
        );
        this.plateZone.setScrollFactor(0);
        this.plateZone.setDepth(150); 
        
        // Текст название зоны
        this.zoneText = scene.add.text(scene.scale.width - 20, 20, '', {
            fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
            fill: CONFIG.UI.COLOR_BLUE,
            fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setOrigin(1, 0).setScrollFactor(0);
        this.zoneText.setDepth(200);

        this.createProgressBar(scene);
    }

    createProgressBar(scene) {
        const barConfig = CONFIG.UI.PROGRESS_BAR;
        
        this.progressBarFill = scene.add.image(
            barConfig.X + barConfig.WIDTH / 2,
            barConfig.Y + barConfig.HEIGHT,
            CONFIG.TEXTURES.BAR_FILL
        );
        
        this.originalWidth = this.progressBarFill.width;
        this.originalHeight = this.progressBarFill.height;
        this.progressBarFill.setDisplaySize(barConfig.WIDTH, barConfig.HEIGHT);
        this.progressBarFill.setOrigin(0.5, 1);
        this.progressBarFill.setCrop(0, this.originalHeight, this.originalWidth, 0);
        this.progressBarFill.setScrollFactor(0);
        this.progressBarFill.setDepth(101);
        this.barConfig = barConfig;
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

        // Зона
        this.zoneText.setText(zoneName);

        // Прогресс-бар
        this.updateProgressBar(distanceLeft, totalDistance);
    }

    updateProgressBar(distanceLeft, totalDistance) {
       
        const progress = 1 - (distanceLeft / totalDistance);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        const fillHeight = this.barConfig.HEIGHT * clampedProgress;
        
        this.progressBarFill.setCrop(
            0,                             
            this.barConfig.HEIGHT - fillHeight, 
            this.barConfig.WIDTH,          
            fillHeight                     
        );
    }
}