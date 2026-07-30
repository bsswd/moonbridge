export class Crash {
    constructor(scene, x, y) {
        this.scene = scene;
        
        this.sprite = scene.add.sprite(x, y, 'crash_spritesheet', 0);        
        this.sprite.setScale(2);        
        this.sprite.setAlpha(0.8);        
        this.sprite.setDepth(10);        
        this.sprite.play('crash');        
        this.sprite.on('animationcomplete', () => {
            //this.sprite.destroy();
        });
    }
}