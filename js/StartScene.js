import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        this.load.image(CONFIG.TEXTURES.BG_EARTH, 'assets/images/bg_earth.png');
        this.load.image('btn_start', 'assets/images/btn_start.png');
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        this.bgTile = this.add.tileSprite(
            centerX, 
            centerY, 
            this.scale.width, 
            this.scale.height, 
            CONFIG.TEXTURES.BG_EARTH
        );

        const descriptionText = this.add.text(centerX, centerY - 200, 'В этой игре тебе предстоит\nпостроить мост до Луны!\n\nЕсли готов, то', {
            fontSize: CONFIG.UI.FONT_SIZE_LARGE, 
            fill: CONFIG.UI.COLOR_BLUE,    
            fontFamily: CONFIG.UI.FONT_FAMILY,  
            align: 'center',
            wordWrap: { width: this.scale.width * 0.8 }
        })
        .setOrigin(0.5)
        .setDepth(10); 

        
        this.startButton = this.add.image(centerX, centerY + 80, 'btn_start')
            .setInteractive({ useHandCursor: true });

        if (!this.textures.exists('btn_start') || this.textures.get('btn_start').key === '__MISSING') {
            this.startButton.destroy(); 
            
            const btnGraphics = this.add.graphics();
            btnGraphics.fillStyle(0x00ffcc, 1); // Цвет из твоего конфига (COLOR_SECONDARY)
            btnGraphics.fillRoundedRect(centerX - 100, centerY + 50, 200, 60, 15);
            
            btnGraphics.setInteractive(new Phaser.Geom.Rectangle(centerX - 100, centerY + 50, 200, 60), Phaser.Geom.Rectangle.Contains);
            
            this.add.text(centerX, centerY + 80, 'ПОЕХАЛИ!', {
                fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
                fill: '#000000',
                fontFamily: CONFIG.UI.FONT_FAMILY,
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.startButton = btnGraphics;
        } else {
            
            this.startButton.setScale(0.7); 
        }

        this.startButton.on('pointerover', () => {
            this.startButton.setScale(0.8);
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setScale(0.7);
        });

        this.startButton.on('pointerdown', () => {
            this.tweens.add({
                targets: this.startButton,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.scene.start('GameScene');
                }
            });
        });
    }

    update() {
       
        if (this.bgTile) {
            this.bgTile.tilePositionY -= 0.5; 
        }
    }
}