export default class GameScene extends Phaser.Scene
{
    constructor()
    {
        super('GameScene');
    }

    init()
    {
        this.BLOCK_SIZE = 120;
        this.BLOCK_BOUNCE = 0.2;

        this.MAX_PHYSICS_BLOCKS = 3;   
        
        this.SPAWN_OFFSET = 200;
        this.CAMERA_TRIGGER = 0.8;

        this.TOTAL_DISTANCE = 100;                       //384400
        this.distanceLeft = this.TOTAL_DISTANCE;
        this.distancePerBlock = 10;                     //???
        this.distanceAchived = 0;                     

        this.blocks = [];
        this.blockGroup = null;
        this.physicsBlocks = []; 

        this.activeBlock = null;
        this.isGameOver = false;
        this.isDropping = false;
        this.isProcessingLanding = false;

        this.centerX = 0;

        this.currentCollider = null;
        this.fallingCollider = null;
        this.groundCollider = null;

        this.spawnMode = 'crane'; // crane or ship
        this.ship = null;
        this.heli = null;
        this.moon = null;

        this.currentZone = 'earth';

        this.heliDirection = 1;
        this.heliBaseY = 0;
        this.heliSpeed = 200; 
        this.heliHovering = false; 
        this.heliHoverTimer = 0; 
        this.heliHoverDuration = 0;
        this.heliNextHoverTime = 2000 + Math.random() * 2000; 

        this.shipDirection = 1;     
        this.shipBaseY = 0;         
        this.shipSpeed = 0;         
        this.shipAmplitude = 0;  
    }

    getZone()
    {
        if (this.distanceLeft > 50)  return { label: 'earth', name: 'ЗЕМЛЯ', color: '#1414af', swing: 220, speed: 0.0025 };
        if (this.distanceLeft > 30) return { label: 'sky', name: 'НЕБО', color: '#1a0b2e', swing: 280, speed: 0.003 };
        if (this.distanceLeft > 0) return { label: 'space', name: 'КОСМОС', color: '#050510', swing: 0, speed: 0 };
        return { label: 'moon', name: 'ЛУНА', color: '#0a0a0a', swing: 0, speed: 0 };
    }

    formatDistance(km)
    {
        return Math.ceil(km).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    create()
    {
        this.centerX = this.scale.width / 2;

        // Generate block texture
        const g = this.make.graphics({ add: false });

        g.fillStyle(0x00ffcc, 1);
        g.fillRect(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE);
        g.lineStyle(3, 0xffffff, 0.6);
        g.strokeRect(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE);
        g.generateTexture('block', this.BLOCK_SIZE, this.BLOCK_SIZE);

        // Generate ground
        const groundG = this.make.graphics({ add: false });
        groundG.fillStyle(0x1a1a2e, 1);
        groundG.fillRect(0, 0, this.scale.width, 80);
        groundG.lineStyle(2, 0x00ffcc, 0.3);
        groundG.strokeRect(0, 0, this.scale.width, 80);
        groundG.generateTexture('ground', this.scale.width, 80);
        this.ground = this.physics.add.staticImage(this.centerX, this.scale.height - 40, 'ground');
        this.ground.setDepth(-1);

        // Generate heli
        const heliG = this.make.graphics({ add: false });
        heliG.fillStyle(0xcccccc, 1);
        heliG.fillStyle(0x444444, 1);
        heliG.fillRect(50, 12, 20, 16); // cockpit
        heliG.fillStyle(0xff6600, 1);
        heliG.fillCircle(30, 30, 15); // rotor
        heliG.generateTexture('heli', 70, 40);

        // Generate ship
        const shipG = this.make.graphics({ add: false });
        shipG.fillStyle(0xcccccc, 1);
        shipG.fillTriangle(0, 20, 50, 0, 50, 40); // body
        shipG.fillStyle(0x444444, 1);
        shipG.fillRect(50, 12, 20, 16); // cockpit
        shipG.fillStyle(0xff6600, 1);
        shipG.fillCircle(15, 20, 6); // thrusters
        shipG.generateTexture('ship', 70, 40);

        // Generate Moon
        const moonG = this.make.graphics({ add: false });
        moonG.fillStyle(0xdddddd, 1);
        moonG.fillCircle(100, 100, 100);
        moonG.fillStyle(0xaaaaaa, 1);
        moonG.fillCircle(60, 70, 25); 
        moonG.fillCircle(140, 110, 18);
        moonG.fillCircle(100, 140, 15);
        moonG.generateTexture('moon', 200, 200);

        // Group for installed blocks
        this.blockGroup = this.physics.add.group();

        // Create base
        const baseY = this.scale.height - 140;
        const base = this.physics.add.staticImage(this.centerX, baseY, 'block');
        this.blocks.push(base);
        this.physicsBlocks.push(base);

        //Distance
        this.distanceText = this.add.text(20, 20, 'Осталось: ' + this.formatDistance(this.distanceLeft) + ' км',
        { fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial'}).setScrollFactor(0);

        //Progress bar
        this.progressBg = this.add.rectangle(this.scale.width / 2, 70, 400, 12, 0x333333)
            .setScrollFactor(0).setOrigin(0.5);
               
        this.progressFill = this.add.rectangle(this.scale.width / 2 - 200, 70, 0, 12, 0x00ffcc)
            .setScrollFactor(0).setOrigin(0, 0.5);

        // Zone
        this.zoneText = this.add.text(this.scale.width - 20, 20, 'ЗЕМЛЯ', {
            fontSize: '24px', fill: '#00ffcc', fontFamily: 'Arial'
        }).setOrigin(1, 0).setScrollFactor(0);

        this.input.on('pointerdown', this.dropBlock, this);
        this.physics.world.setBounds(0, -100000, this.scale.width, 100000 + this.scale.height);

        this.spawnBlock();
    }

    updateDistanceUI()
    {
        this.distanceText.setText('Осталось: ' + this.formatDistance(this.distanceLeft) + ' км');
                
        const progress = Math.max(0, this.distanceLeft / this.TOTAL_DISTANCE);
        const fillWidth = 400 * (1 - progress);
        this.progressFill.setSize(fillWidth, 12);
        this.progressFill.setPosition(this.scale.width / 2 - 200, 70);
               
        if (progress < 0.2)
        {
            this.progressFill.setFillStyle(0xff4444);
        }
        else if (progress < 0.5)
        {
            this.progressFill.setFillStyle(0xffaa00);
        }
    }

    spawnBlock()
    {
        if (this.isGameOver) return;

        this.isDropping = false;
        this.isProcessingLanding = false;

        // Clear old colliders
        if (this.currentCollider)
        {
            this.currentCollider.destroy();
            this.currentCollider = null;
        }

        if (this.fallingCollider)
        {
            this.fallingCollider.destroy();
            this.fallingCollider = null;
        }

        if (this.groundCollider)
        {
            this.groundCollider.destroy();
            this.groundCollider = null;
        }

        const zone = this.getZone();
        const spawnY = this.cameras.main.scrollY + this.SPAWN_OFFSET;

        // Crane or heli or ship
        if (zone.label === 'earth')
        {
            // Crane mode
            this.spawnMode = 'crane';
            this.activeBlock = this.physics.add.image(this.centerX, spawnY, 'block');
            this.activeBlock.setImmovable(true);
            this.activeBlock.body.allowGravity = false;

            if (this.activeBlock.preFX)
            {
                this.activeBlock.preFX.addGlow(0x00ffcc, 6, 0, false, 0.1, 6);
            }

            // Hide ship
            if (this.ship) this.ship.setVisible(false);
        }

        else if (zone.label === 'sky')
        {
            // Heli mode
            this.spawnMode = 'heli';
            
            if(!this.heli)
            {
                this.heli = this.add.image(0, 0, 'heli');
                this.heli.setScale(1.5);
            }

            this.heli.setVisible(true);
            
            this.heliDirection = Math.random() < 0.5 ? 1 : -1;
            this.heliSpeed = 180 + Math.random() * 80;
            this.heliBaseY = spawnY;
            this.heliHovering = false;
            this.heliHoverTimer = 0;
            
            const startX = this.heliDirection === 1 ? -100 : this.scale.width + 100;
            this.heli.setPosition(startX, this.heliBaseY);
            this.heli.setFlipX(this.heliDirection === -1);

            this.activeBlock = this.physics.add.image(startX, this.heliBaseY + 50, 'block');
            this.activeBlock.setImmovable(true);
            this.activeBlock.body.allowGravity = false;

            // Hide ship
            if (this.ship) this.ship.setVisible(false);
        }
        
        else
        {
            // Ship mode
            this.spawnMode = 'ship';

            this.shipDirection = Math.random() < 0.5 ? 1 : -1; 
            this.shipSpeed = 180 + Math.random() * 120;        
            this.shipAmplitude = 30 + Math.random() * 40;      

            const minHeight = this.cameras.main.scrollY + 60;
            const baseHeight = spawnY - 30;
            const randomOffset = (Math.random() - 0.5) * 120;
            this.shipBaseY = Math.max(minHeight, baseHeight + randomOffset);


            if (!this.ship)
            {
                this.ship = this.add.image(0, 0, 'ship');
                this.ship.setScale(1.5);
            }

            this.ship.setVisible(true);
            this.ship.setFlipX(this.shipDirection === -1);
                   
            const startX = this.shipDirection === 1 ? -100 : this.scale.width + 100;
            this.ship.setPosition(startX, this.shipBaseY);
                   
            this.activeBlock = this.physics.add.image(startX, this.shipBaseY + 200, 'block');
            this.activeBlock.setImmovable(true);
            this.activeBlock.body.allowGravity = false;

            if (!this.moon)
            {
                this.moon = this.add.image(this.centerX, spawnY - 600, 'moon');
                this.moon.setScale(0.5);
                this.moon.setAlpha(0.4);
            }

            if(this.heli) this.heli.setVisible(false);
        }
    }

    dropBlock()
    {
        if (!this.activeBlock || this.isDropping || this.isGameOver) return;

        this.isDropping = true;

        // Enable fall physics
        this.activeBlock.setImmovable(false);
        this.activeBlock.body.allowGravity = true;
        this.activeBlock.setBounce(this.BLOCK_BOUNCE);

        const lastBlock = this.blocks[this.blocks.length - 1];

        // Collider for top block
        this.currentCollider = this.physics.add.collider
        (
            this.activeBlock,
            lastBlock,
            this.onBlockLanded,
            null,
            this
        );

        // Collider for second block
        if (this.physicsBlocks.length >= 2)
        {
            const secondFromTop = this.physicsBlocks[this.physicsBlocks.length - 2];
            this.fallingCollider = this.physics.add.collider
            (
            this.activeBlock,
            secondFromTop,
            null, 
            null,
            this
            );
        }

        // Collider for all blocks exept top
        
        if (this.physicsBlocks.length > 0)
        {
            this.fallingCollider = this.physics.add.collider
            (
                this.activeBlock,
                this.physicsBlocks,
                null,
                (block, physBlock) => physBlock !== lastBlock,
                this
            );
        }

        // Collision for ground
        this.groundCollider = this.physics.add.collider
        (
            this.activeBlock,
            this.ground,
            (block, ground) =>
            {
                if (!this.isGameOver && this.isDropping)
                 {
                    if (!this.activeBlock && block.body)
                    {
                        block.body.stop();
                        block.body.allowGravity = false;
                        block.body.moves = false;
                    }
                    this.time.delayedCall(600, () =>
                    {
                        if (!this.isGameOver) this.gameOver();
                    });
                }
            },
            null,
            this
        );

        // If block fall without collision
        this.time.delayedCall(3000, () =>
        {
            if (!this.isGameOver && this.activeBlock)
            {
                const bottomLimit = this.cameras.main.scrollY + this.scale.height + 300;

                if (this.activeBlock.y > bottomLimit)
                {
                    this.gameOver();
                }
            }
        });
    }

    onBlockLanded(fallingBlock, targetBlock)
    {
        if (this.isGameOver || this.isProcessingLanding) return;
        if (fallingBlock !== this.activeBlock) return;

        this.isProcessingLanding = true;

        // Check balance
        const diffX = fallingBlock.x - targetBlock.x;
        const absDiffX = Math.abs(diffX);
        
        if (absDiffX > this.BLOCK_SIZE / 2)
        {
            if (this.currentCollider)
            {
                this.currentCollider.destroy();
                this.currentCollider = null;
            }

            const direction = diffX > 0 ? 1 : -1;
            
            fallingBlock.setImmovable(false);
            fallingBlock.body.allowGravity = true;
            fallingBlock.setBounce(this.BLOCK_BOUNCE);
            fallingBlock.setVelocityX(direction * 160);
            fallingBlock.setVelocityY(0);
            fallingBlock.setAngularVelocity(direction * 180);

            this.activeBlock = null;
            this.isDropping = false;

            this.time.delayedCall(1800, () => this.gameOver());
            return;
        }
        
        if (this.currentCollider)
        {
            this.currentCollider.destroy();
            this.currentCollider = null;
        }

        // Successful landing
        fallingBlock.setImmovable(true);
        fallingBlock.body.allowGravity = false;
        fallingBlock.body.setVelocity(0, 0);
        fallingBlock.body.setAngularVelocity(0);
        fallingBlock.body.setAngularDrag(0);
        fallingBlock.setBounce(0);

        this.blocks.push(fallingBlock);
        this.activeBlock = null;

        // Update distance
        this.distanceLeft -= this.distancePerBlock;
        this.distanceAchived +=this.distancePerBlock;

        // Check goal
        if (this.distanceLeft <= 0)
        {
            this.distanceLeft = 0;
            this.updateDistanceUI();
            this.victory();
            return;
        }

        this.updateDistanceUI();

        // Update zone
        const newZone = this.getZone();
        if (newZone.label !== this.currentZone)
        {
            this.currentZone = newZone.label;
            this.onZoneChange(newZone);
        }

        this.zoneText.setText(newZone.name);

        // Optimization
        this.physicsBlocks.push(fallingBlock);
                
        if (this.physicsBlocks.length > this.MAX_PHYSICS_BLOCKS)
        {
            const oldBlock = this.physicsBlocks.shift();

            if (oldBlock && oldBlock.body)
            {
                oldBlock.body.enable = false;
            }
        }

        // Update camera
        const triggerLine = this.cameras.main.scrollY + (this.scale.height * this.CAMERA_TRIGGER);
        if (fallingBlock.y < triggerLine) {
            const targetScrollY = fallingBlock.y - (this.scale.height * this.CAMERA_TRIGGER);
            this.tweens.add({
                targets: this.cameras.main,
                scrollY: targetScrollY,
                duration: 600,
                ease: 'Sine.easeInOut'
            });
        }

        this.time.delayedCall(400, () => this.spawnBlock());
    }

    onZoneChange(zone)
    {
        this.cameras.main.setBackgroundColor(zone.color);

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height * 0.4;

        const text = this.add.text(cx, cy, zone.name,
        {
            fontSize: '56px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add(
        {
            targets: text,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 400,
            yoyo: true,
            hold: 1200,
            onComplete: () => text.destroy()
        });
    }

    victory()
    {
        this.isGameOver = true;

        if (this.currentCollider) { this.currentCollider.destroy(); this.currentCollider = null; }
        if (this.fallingCollider) { this.fallingCollider.destroy(); this.fallingCollider = null; }
        if (this.groundCollider) { this.groundCollider.destroy(); this.groundCollider = null; }

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height / 2;

        if (this.moon)
        {
            this.tweens.add
            ({
                targets: this.moon,
                scale: 1.5,
                alpha: 1,
                y: cy - 100,
                duration: 1500,
                ease: 'Power2'
            });
        }

        this.time.delayedCall(1600, () =>
        {
            this.add.text(cx, cy - 80, 'ЛУНА ДОСТИГНУТА!',
            {
                fontSize: '52px', fill: '#00ffcc', fontStyle: 'bold', fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(cx, cy, 'Вы преодолели 384 400 км. +/- 12 см.',
            {
                fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial'
            }).setOrigin(0.5);

            const hint = this.add.text(cx, cy + 60, 'Нажмите для рестарта',
            {
                fontSize: '24px', fill: '#aaaaaa', fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.tweens.add({ targets: hint, alpha: 0, duration: 700, yoyo: true, repeat: -1 });
            this.input.once('pointerdown', () => this.scene.restart());
        });
    }

    gameOver()
    {
        if (this.isGameOver) return;

        this.isGameOver = true;

        // Clear colliders
        if (this.currentCollider)
        {
            this.currentCollider.destroy();
            this.currentCollider = null;
        }

        if (this.fallingCollider)
        {
            this.fallingCollider.destroy();
            this.fallingCollider = null;
        }

        if (this.activeBlock)
        {
            this.activeBlock.setTint(0xff0000);
        }

        const cx = this.scale.width / 2;
        const cy = this.cameras.main.scrollY + this.scale.height / 2;

        this.add.text(cx, cy - 50, 'ИГРА ОКОНЧЕНА',
        {
            fontSize: '48px',
            fill: '#ff4444',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 20, 'Вы прошли: ' + this.distanceAchived + ' км.',
        {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const hint = this.add.text(cx, cy + 80, 'Нажмите для рестарта',
        {
            fontSize: '24px',
            fill: '#aaaaaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.tweens.add(
        {
            targets: hint,
            alpha: 0,
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        this.input.once('pointerdown', () => this.scene.restart());
    }

    update(time, delta)
    {
        if (this.activeBlock && !this.isDropping && !this.isGameOver)
        {
            if (this.spawnMode === 'crane')
            {
                // Crane mode: swing
                const zone = this.getZone();
                const offset = Math.sin(time * zone.speed) * zone.swing;
                this.activeBlock.x = this.centerX + offset;
            }
            
                        else if (this.spawnMode === 'heli' && this.heli)
            {
                // Heli mode: fly with random stops
                if (!this.heliHovering)
                {
                    const heliX = this.heli.x + this.heliDirection * this.heliSpeed * (delta / 1000);
                    this.heli.setPosition(heliX, this.heliBaseY);
                    this.activeBlock.setPosition(heliX, this.heliBaseY + 50);

                    const margin = 50;
                    if ((this.heliDirection === 1 && heliX > this.scale.width - margin) ||
                        (this.heliDirection === -1 && heliX < margin))
                    {
                        this.heliDirection *= -1;
                        this.heli.setFlipX(this.heliDirection === -1);
                    }
                    
                    this.heliHoverTimer += delta;
                    if (this.heliHoverTimer > this.heliNextHoverTime)
                    {
                        if (Math.random() < 0.3)
                        {
                            this.heliHovering = true;
                            this.heliHoverDuration = 400 + Math.random() * 1000; // 0.4 - 1.4 секунды
                            this.heliHoverTimer = 0;
                        }
                        else
                        {
                            this.heliNextHoverTime = this.heliHoverTimer + 1500 + Math.random() * 1500;
                        }
                    }
                }
                else
                {
                    this.heliHoverTimer += delta;
                    if (this.heliHoverTimer >= this.heliHoverDuration)
                    {
                        this.heliHovering = false;
                        this.heliHoverTimer = 0;
                        this.heliNextHoverTime = 1500 + Math.random() * 1500;
                    }
                }
            }

            else if (this.spawnMode === 'ship' && this.ship)
            {
                // Ship mode: fly through screen
                const elapsed = (time - (this.shipSpawnTime || time)) / 1000;
                const wobble = Math.sin(time * 0.005) * this.shipAmplitude;
                   
                const shipX = this.ship.x + this.shipDirection * this.shipSpeed * (delta / 1000);
                const shipY = this.shipBaseY + wobble;

                this.ship.setPosition(shipX, shipY);
                this.activeBlock.setPosition(shipX, shipY + 50);

                   
                const margin = 150;

                if ((this.shipDirection === 1 && shipX > this.scale.width + margin) ||
                        (this.shipDirection === -1 && shipX < -margin))
                {
                    this.gameOver();
                }
            }
        }

        // Moon approaching
        if (this.moon && this.score >= 10 && this.score < 20)
        {
            const moonTargetY = this.cameras.main.scrollY + 250;
            this.moon.y += (moonTargetY - this.moon.y) * 0.01;
        }

        if (this.activeBlock && this.isDropping && !this.isGameOver && !this.isProcessingLanding)
        {
            const v = this.activeBlock.body.velocity.y;
            const last = this.blocks[this.blocks.length - 1];

            if (Math.abs(v) < 10 && this.activeBlock.y > last.y + 200)
            {
                this.gameOver();
            }
        }
    }
}