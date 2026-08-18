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
            scene.scale.width - 680, 50,                       
            CONFIG.TEXTURES.TEXT_PLATE
        );
        this.plateDistance.setScrollFactor(0);
        this.plateDistance.setDepth(150); 

        // Текст осталось пройти
         this.leftDistanceCapition = scene.add.text(20, 20, '', {
            fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
            fill: CONFIG.UI.COLOR_BLUE,
            fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setScrollFactor(0);
        this.leftDistanceCapition.setDepth(200);

        this.leftDistanceText = scene.add.text(20, 80, '', {
            fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
            fill: CONFIG.UI.COLOR_BLUE,
            fontFamily: CONFIG.UI.FONT_FAMILY,
        }).setScrollFactor(0);
        this.leftDistanceText.setDepth(200);

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
        this.leftDistanceCapition.setText('до Луны:');
        this.leftDistanceText.setText(`${formatDistance(distanceLeft)} км`);

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