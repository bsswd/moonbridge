import GameScene from './scenes/GameScene.js';

const config =
{
    type: Phaser.AUTO,        
    width: 720,
    height: 1280,            
    parent: 'game-container', 
    backgroundColor: '#0b0b1a',
    
    physics:
    {
        default: 'arcade',
        arcade:
        {
            gravity: { y: 1200 }, 
            debug: false          
        }
    },
    
    scale:
    {
        mode: Phaser.Scale.FIT,                  
        autoCenter: Phaser.Scale.CENTER_BOTH    
    },
    
    scene: [GameScene] 
};

new Phaser.Game(config);