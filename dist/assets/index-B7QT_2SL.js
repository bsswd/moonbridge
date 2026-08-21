import { P as Phaser } from "./phaser-BhJor0i-.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const CONFIG = {
  BLOCK: {
    BOUNCE: 0.2,
    OVERLAP: 2
  },
  CAMERA: {
    SPAWN_OFFSET: 150,
    TRIGGER_LINE: 0.8
  },
  DISTANCE: {
    TOTAL: 384400,
    PER_BLOCK: 1
  },
  CRANE: {
    SWING: 220,
    SPEED: 25e-4
  },
  HELICOPTER: {
    SPEED_MIN: 150,
    SPEED_MAX: 300,
    HOVER_CHANCE: 0.3,
    HOVER_DURATION_MIN: 400,
    HOVER_DURATION_MAX: 1400,
    NEXT_HOVER_MIN: 1500,
    NEXT_HOVER_MAX: 3e3
  },
  SHIP: {
    SPEED_MIN: 180,
    SPEED_MAX: 300,
    AMPLITUDE_MIN: 30,
    AMPLITUDE_MAX: 70
  },
  TEXTURES: {
    // Транспорт
    CRANE: "crane",
    HELI: "heli",
    SHIP: "ship",
    // Окружение
    GROUND: "ground",
    MOON: "moon",
    BG_EARTH: "bg_earth",
    BG_SKY: "bg_sky",
    BG_SPACE: "bg_space",
    // Массив всех блоков
    BLOCKS: [
      "block_01",
      "block_02",
      "block_03",
      "block_04",
      "block_05",
      "block_06",
      "block_07",
      "block_08",
      "block_09"
    ],
    // UI
    BAR_FILL: "bar_fill",
    TEXT_PLATE: "text_plate"
  },
  // Настройки фона
  BACKGROUND: {
    TILE_HEIGHT: 720
  },
  UI: {
    // Шрифты
    FONT_FAMILY: '"Daneehand"',
    // Размеры шрифтов
    FONT_SIZE_SMALL: "32px",
    FONT_SIZE_MEDIUM: "40px",
    FONT_SIZE_LARGE: "64px",
    FONT_SIZE_XLARGE: "104px",
    // Цвета текста
    COLOR_BLUE: "#130B60",
    COLOR_RED: "#c10808",
    COLOR_GREEN: "#007100fe",
    PROGRESS_BAR: {
      X: 20,
      Y: 100,
      WIDTH: 20,
      HEIGHT: 1e3,
      COLOR_BG: 3355443,
      COLOR_BORDER: 65484
    }
  },
  // АЧИВКИ ПО НОМЕРАМ БЛОКОВ
  ACHIEVEMENTS: {
    1: "1 - Первый шаг сделан!",
    10: "10 - Десяточка! Фундамент крепок",
    27: "27 - Красивый уход. Но это не точно",
    42: "42 - Ответ на главный вопрос жизни, вселенной и всего такого",
    67: "67 - Хеллоу Полли!",
    100: "100 - Ты настоящий строитель мостов",
    400: "400 - Почти у цели... Осталось всего-то 384 000 км!",
    2001: "2001 - Кубрик!",
    1e5: "100 000! А ты хорош!"
  }
};
const ZONES = [
  {
    label: "earth",
    name: "ЗЕМЛЯ",
    minDistance: 2e5,
    transport: "crane"
  },
  {
    label: "sky",
    name: "НЕБО",
    minDistance: 8e4,
    transport: "heli"
  },
  {
    label: "space",
    name: "КОСМОС",
    minDistance: 0,
    transport: "ship"
  }
];
const MOON_ZONE = {
  label: "moon",
  name: "ЛУНА",
  transport: "ship"
};
function getZoneByDistance(distanceLeft) {
  for (const zone of ZONES) {
    if (distanceLeft > zone.minDistance) return zone;
  }
  return MOON_ZONE;
}
class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }
  preload() {
    this.load.image(CONFIG.TEXTURES.BG_EARTH, "assets/images/bg_earth.png");
    this.load.image("btn_start", "assets/images/btn_start.png");
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
    this.add.text(centerX, centerY - 200, "В этой игре тебе предстоит\nпостроить мост до Луны!\n\nЕсли готов, то", {
      fontSize: CONFIG.UI.FONT_SIZE_LARGE,
      fill: CONFIG.UI.COLOR_BLUE,
      fontFamily: CONFIG.UI.FONT_FAMILY,
      align: "center",
      wordWrap: { width: this.scale.width * 0.8 }
    }).setOrigin(0.5).setDepth(10);
    this.startButton = this.add.image(centerX, centerY + 80, "btn_start").setInteractive({ useHandCursor: true });
    if (!this.textures.exists("btn_start") || this.textures.get("btn_start").key === "__MISSING") {
      this.startButton.destroy();
      const btnGraphics = this.add.graphics();
      btnGraphics.fillStyle(65484, 1);
      btnGraphics.fillRoundedRect(centerX - 100, centerY + 50, 200, 60, 15);
      btnGraphics.setInteractive(new Phaser.Geom.Rectangle(centerX - 100, centerY + 50, 200, 60), Phaser.Geom.Rectangle.Contains);
      this.add.text(centerX, centerY + 80, "ПОЕХАЛИ!", {
        fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
        fill: "#000000",
        fontFamily: CONFIG.UI.FONT_FAMILY,
        fontStyle: "bold"
      }).setOrigin(0.5);
      this.startButton = btnGraphics;
    } else {
      this.startButton.setScale(0.7);
    }
    this.startButton.on("pointerover", () => {
      this.startButton.setScale(0.8);
    });
    this.startButton.on("pointerout", () => {
      this.startButton.setScale(0.7);
    });
    this.startButton.on("pointerdown", () => {
      this.tweens.add({
        targets: this.startButton,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.scene.start("GameScene");
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
class AudioManager {
  constructor() {
    this.enabled = true;
    this.sounds = {};
  }
  /**
   * В будущем: загрузка звуков
   * @param {Phaser.Scene} scene
   */
  init(scene) {
  }
  /**
   * Воспроизводит звук по ключу
   * @param {string} key
   */
  play(key) {
    if (!this.enabled) return;
  }
  setEnabled(value) {
    this.enabled = value;
  }
}
function formatDistance(km) {
  return Math.ceil(km).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
function randomSign() {
  return Math.random() < 0.5 ? 1 : -1;
}
class HUD {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.plateDistance = scene.add.image(
      scene.scale.width - 680,
      50,
      CONFIG.TEXTURES.TEXT_PLATE
    );
    this.plateDistance.setScrollFactor(0);
    this.plateDistance.setDepth(150);
    this.leftDistanceCapition = scene.add.text(20, 20, "", {
      fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
      fill: CONFIG.UI.COLOR_BLUE,
      fontFamily: CONFIG.UI.FONT_FAMILY
    }).setScrollFactor(0);
    this.leftDistanceCapition.setDepth(200);
    this.leftDistanceText = scene.add.text(20, 80, "", {
      fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
      fill: CONFIG.UI.COLOR_BLUE,
      fontFamily: CONFIG.UI.FONT_FAMILY
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
    this.leftDistanceCapition.setText("до Луны:");
    this.leftDistanceText.setText(`${formatDistance(distanceLeft)} км`);
    this.updateProgressBar(distanceLeft, totalDistance);
  }
  updateProgressBar(distanceLeft, totalDistance) {
    const progress = 1 - distanceLeft / totalDistance;
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
class Block {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} textureKey
   */
  constructor(scene, x, y, textureKey = null) {
    this.scene = scene;
    this.textureKey = textureKey || this.getRandomBlockTexture();
    this.sprite = scene.physics.add.image(x, y, this.textureKey);
    this.sprite.setImmovable(true);
    this.sprite.body.allowGravity = false;
    const bodyWidth = this.sprite.displayWidth;
    const bodyHeight = this.sprite.displayHeight - 10;
    this.sprite.body.setSize(bodyWidth, bodyHeight);
    this.isLanded = false;
  }
  /**
   * Выбирает случайный блок из массива
   * @returns {string} Ключ текстуры
   */
  getRandomBlockTexture() {
    const blocks = CONFIG.TEXTURES.BLOCKS;
    if (!blocks || blocks.length === 0) {
      console.warn("Массив блоков пуст! Использую block_01");
      return "block_01";
    }
    const randomIndex = Math.floor(Math.random() * blocks.length);
    const selectedBlock = blocks[randomIndex];
    return selectedBlock;
  }
  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
  get size() {
    return this.sprite.displayWidth;
  }
  /**
   * Начинает падение (для активного блока)
   */
  startFalling() {
    this.sprite.setImmovable(false);
    this.sprite.body.allowGravity = true;
    this.sprite.setBounce(CONFIG.BLOCK.BOUNCE);
  }
  /**
   * Фиксирует блок после успешной посадки
   */
  fixInPlace() {
    this.sprite.setImmovable(true);
    this.sprite.body.allowGravity = false;
    this.sprite.body.setVelocity(0, 0);
    this.sprite.body.setAngularVelocity(0);
    this.sprite.body.setAngularDrag(0);
    this.sprite.setBounce(0);
    this.isLanded = true;
  }
  /**
   * Сбрасывает блок в сторону (при промахе)
   * @param {number} direction -1 или +1
   */
  slideAway(direction) {
    this.sprite.setImmovable(false);
    this.sprite.body.allowGravity = true;
    this.sprite.setBounce(CONFIG.BLOCK.BOUNCE);
    this.sprite.setVelocityX(direction * 160);
    this.sprite.setVelocityY(0);
    this.sprite.setAngularVelocity(direction * 180);
  }
  /**
   * Проверяет, достаточно ли блок перекрыт с целевым
   * @param {Block} targetBlock
   * @returns {boolean}
   */
  isBalancedOn(targetBlock) {
    const diffX = Math.abs(this.x - targetBlock.x);
    return diffX <= this.size / CONFIG.BLOCK.OVERLAP;
  }
  // Устанавливает цвет блока (для визуального эффекта)
  setTint(color) {
    this.sprite.setTint(color);
  }
  // Уничтожает блок
  destroy() {
    this.sprite.destroy();
  }
}
class Transport {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.sprite = null;
    this.active = false;
    this.blockGap = -10;
  }
  /**
   * Активирует транспорт на новой высоте
   * @param {number} spawnY
   */
  activate(spawnY) {
    this.active = true;
    if (this.sprite) this.sprite.setVisible(true);
  }
  /**
   * Деактивирует транспорт
   */
  deactivate() {
    this.active = false;
    if (this.sprite) this.sprite.setVisible(false);
  }
  /**
   * Обновляет позицию транспорта и возвращает координаты для блока
   * @param {number} time
   * @param {number} delta
   * @returns {{x: number, y: number}}
   */
  update(time, delta) {
    throw new Error("Метод update() должен быть реализован в подклассе");
  }
  /**
   * Проверяет, должен ли транспорт вызвать Game Over (например, улетел за экран)
   * @returns {boolean}
   */
  isOutOfBounds() {
    return false;
  }
  getBlockSpawnPosition() {
    if (!this.sprite) return { x: 0, y: 0 };
    return {
      x: this.sprite.x,
      y: this.sprite.y + this.sprite.displayHeight + this.blockGap
    };
  }
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
class Crane extends Transport {
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
    const speed = (zoneConfig == null ? void 0 : zoneConfig.speed) || CONFIG.CRANE.SPEED;
    const swing = (zoneConfig == null ? void 0 : zoneConfig.swing) || CONFIG.CRANE.SWING;
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
class Helicopter extends Transport {
  constructor(scene) {
    super(scene);
    this.direction = 1;
    this.speed = 0;
    this.baseY = 0;
    this.blockGap = -20;
    this.isHovering = false;
    this.hoverTimer = 0;
    this.hoverDuration = 0;
    this.nextHoverCheckTime = 0;
  }
  activate(spawnY) {
    super.activate(spawnY);
    if (!this.sprite) {
      this.sprite = this.scene.add.sprite(0, 0, CONFIG.TEXTURES.HELI);
      this.sprite.setScale(0.8);
      this.sprite.setOrigin(0.5, 0.5);
      this.sprite.setDepth(50);
    }
    this.direction = randomSign();
    this.speed = randomRange(CONFIG.HELICOPTER.SPEED_MIN, CONFIG.HELICOPTER.SPEED_MAX);
    this.baseY = spawnY;
    this.isHovering = false;
    this.hoverTimer = 0;
    this.nextHoverCheckTime = randomRange(2e3, 4e3);
    const startX = this.direction === 1 ? -100 : this.scene.scale.width + 100;
    this.sprite.setPosition(startX, this.baseY);
    this.sprite.setFlipX(this.direction === -1);
    this.sprite.setVisible(true);
    if (this.scene.anims.exists("heli_fly")) {
      this.sprite.play("heli_fly");
    }
  }
  update(time, delta) {
    if (this.isHovering) {
      this.hoverTimer += delta;
      if (this.hoverTimer >= this.hoverDuration) {
        this.isHovering = false;
        this.hoverTimer = 0;
        this.nextHoverCheckTime = randomRange(
          CONFIG.HELICOPTER.NEXT_HOVER_MIN,
          CONFIG.HELICOPTER.NEXT_HOVER_MAX
        );
      }
    } else {
      const newX = this.sprite.x + this.direction * this.speed * (delta / 1e3);
      this.sprite.setPosition(newX, this.baseY);
      const margin = 150;
      if (this.direction === 1 && newX > this.scene.scale.width - margin || this.direction === -1 && newX < margin) {
        this.direction *= -1;
        this.sprite.setFlipX(this.direction === -1);
      }
      this.hoverTimer += delta;
      if (this.hoverTimer > this.nextHoverCheckTime) {
        if (Math.random() < CONFIG.HELICOPTER.HOVER_CHANCE) {
          this.isHovering = true;
          this.hoverDuration = randomRange(
            CONFIG.HELICOPTER.HOVER_DURATION_MIN,
            CONFIG.HELICOPTER.HOVER_DURATION_MAX
          );
          this.hoverTimer = 0;
        } else {
          this.nextHoverCheckTime = this.hoverTimer + randomRange(
            CONFIG.HELICOPTER.NEXT_HOVER_MIN,
            CONFIG.HELICOPTER.NEXT_HOVER_MAX
          );
        }
      }
    }
    return {
      x: this.sprite.x,
      y: this.baseY
    };
  }
}
class Ship extends Transport {
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
    const newX = this.sprite.x + this.direction * this.speed * (delta / 1e3);
    const wobble = Math.sin(time * 5e-3) * this.amplitude;
    const newY = this.baseY + wobble;
    this.sprite.setPosition(newX, newY);
    return {
      x: newX,
      y: newY
    };
  }
  isOutOfBounds() {
    const margin = 150;
    return this.direction === 1 && this.sprite.x > this.scene.scale.width + margin || this.direction === -1 && this.sprite.x < -margin;
  }
}
class Puff {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, "puff_spritesheet", 0);
    this.sprite.setScale(2);
    this.sprite.setAlpha(0.8);
    this.sprite.setDepth(10);
    this.sprite.play("puff");
    this.sprite.on("animationcomplete", () => {
      this.sprite.destroy();
    });
  }
}
class BackgroundManager {
  constructor(scene, textureKey, depth = -10) {
    this.scene = scene;
    this.textureKey = textureKey;
    this.depth = depth;
    this.tiles = [];
    this.tileHeight = CONFIG.BACKGROUND.TILE_HEIGHT;
    this.createInitialTiles();
  }
  /**
   * Создаём начальный набор тайлов, чтобы покрыть экран + небольшой запас
   */
  createInitialTiles() {
    const centerX = this.scene.scale.width / 2;
    const screenHeight = this.scene.scale.height;
    const count = 3;
    console.log(`Создаём начальные тайлы: ${count} шт., высота: ${this.tileHeight}`);
    let startY = screenHeight + this.tileHeight / 2;
    for (let i = 0; i < count; i++) {
      const yPos = startY - i * this.tileHeight;
      const tile = this.scene.add.image(centerX, yPos, this.textureKey);
      tile.setDepth(this.depth);
      tile.setDisplaySize(this.scene.scale.width, this.tileHeight);
      this.tiles.push(tile);
      console.log(`Тайл ${i} создан на Y: ${yPos} (верхний край: ${yPos - this.tileHeight / 2})`);
    }
  }
  /**
   * Главная логика: если нижний тайл ушёл за экран, переносим его наверх
   */
  update() {
    const camera = this.scene.cameras.main;
    const cameraBottomY = camera.worldView.bottom;
    let bottomTileIndex = -1;
    let maxY = -Infinity;
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const tileTopEdge = tile.y - this.tileHeight / 2;
      if (tileTopEdge > cameraBottomY + 50) {
        if (tile.y > maxY) {
          maxY = tile.y;
          bottomTileIndex = i;
        }
      }
    }
    if (bottomTileIndex !== -1) {
      const tileToMove = this.tiles[bottomTileIndex];
      let minY = Infinity;
      let topTileIndex = 0;
      for (let i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i].y < minY) {
          minY = this.tiles[i].y;
          topTileIndex = i;
        }
      }
      const topTile = this.tiles[topTileIndex];
      tileToMove.y = topTile.y - this.tileHeight;
      console.log(`Тайл перенесён наверх. Новый Y: ${tileToMove.y}`);
    }
  }
  destroy() {
    this.tiles.forEach((tile) => tile.destroy());
    this.tiles = [];
  }
}
class Crash {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, "crash_spritesheet", 0);
    this.sprite.setScale(2);
    this.sprite.setAlpha(0.8);
    this.sprite.setDepth(10);
    this.sprite.play("crash");
    this.sprite.on("animationcomplete", () => {
    });
  }
}
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }
  init() {
    this.distanceLeft = CONFIG.DISTANCE.TOTAL;
    this.distanceAchived = 0;
    this.currentZone = null;
    this.blocksPlacedCount = 0;
    this.installedBlocks = [];
    this.physicsBlocks = [];
    this.activeBlock = null;
    this.activeTransport = null;
    this.isGameOver = false;
    this.isDropping = false;
    this.isProcessingLanding = false;
    this.colliders = [];
    this.ground = null;
    this.moon = null;
    this.backgroundManager = null;
    this.audio = new AudioManager();
    this.hud = null;
    this.transportFactories = {
      crane: () => new Crane(this),
      heli: () => new Helicopter(this),
      ship: () => new Ship(this)
    };
  }
  preload() {
    this.load.image(CONFIG.TEXTURES.BG_EARTH, "assets/images/bg_earth.png");
    this.load.image(CONFIG.TEXTURES.BG_SKY, "assets/images/bg_sky.png");
    this.load.image(CONFIG.TEXTURES.BG_SPACE, "assets/images/bg_space.png");
    this.load.image(CONFIG.TEXTURES.GROUND, "assets/images/ground.png");
    this.load.image(CONFIG.TEXTURES.MOON, "assets/images/moon.png");
    console.log("Окружение загружено");
    if (CONFIG.TEXTURES.BLOCKS && Array.isArray(CONFIG.TEXTURES.BLOCKS)) {
      CONFIG.TEXTURES.BLOCKS.forEach((blockKey) => {
        this.load.image(blockKey, `assets/images/${blockKey}.png`);
      });
      console.log(`В очередь загрузки добавлено блоков: ${CONFIG.TEXTURES.BLOCKS.length}`);
    } else {
      console.warn("Массив BLOCKS не найден в конфиге!");
    }
    this.load.image(CONFIG.TEXTURES.CRANE, "assets/images/crane.png");
    this.load.spritesheet(
      CONFIG.TEXTURES.HELI,
      "assets/images/heli_spritesheet.png",
      {
        frameWidth: 320,
        frameHeight: 180
      }
    );
    this.load.image(CONFIG.TEXTURES.SHIP, "assets/images/ship.png");
    console.log("Транспорт загружен");
    this.load.spritesheet(
      "puff_spritesheet",
      "assets/images/puff_spritesheet.png",
      {
        frameWidth: 128,
        frameHeight: 128
      }
    );
    this.load.spritesheet(
      "crash_spritesheet",
      "assets/images/crash_spritesheet.png",
      {
        frameWidth: 128,
        frameHeight: 128
      }
    );
    console.log("Эффекты загружены");
    this.load.image(CONFIG.TEXTURES.BAR_FILL, "assets/images/bar_fill.png");
    this.load.image(CONFIG.TEXTURES.TEXT_PLATE, "assets/images/plate.png");
    console.log("UI загружен");
    this.load.on("loaderror", (file) => {
      console.error("НЕ УДАЛОСЬ ЗАГРУЗИТЬ: ${file.key} (${file.src})");
    });
    this.load.on("complete", () => {
      console.log("Все спрайты успешно загружены!");
    });
  }
  create() {
    const heliTexture = this.textures.get(CONFIG.TEXTURES.HELI);
    const frameCount = heliTexture.frameTotal;
    console.log(`Вертолёт: загружено ${frameCount} кадров`);
    if (frameCount > 1) {
      this.anims.create({
        key: "heli_fly",
        frames: this.anims.generateFrameNumbers(CONFIG.TEXTURES.HELI, {
          start: 0,
          end: frameCount - 1
        }),
        frameRate: 8,
        repeat: -1
      });
      console.log(`Анимация вертолёта создана (кадры 0-${frameCount - 1})`);
    }
    this.anims.create({
      key: "puff",
      frames: this.anims.generateFrameNumbers("puff_spritesheet", {
        start: 0,
        end: 6
      }),
      frameRate: 12,
      repeat: 0,
      hideOnComplete: true
    });
    this.anims.create({
      key: "crash",
      frames: this.anims.generateFrameNumbers("crash_spritesheet", {
        start: 0,
        end: 8
      }),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: false
    });
    this.audio.init(this);
    const centerX = this.scale.width / 2;
    this.ground = this.physics.add.staticImage(
      centerX,
      this.scale.height - 40,
      CONFIG.TEXTURES.GROUND
    );
    this.ground.setDepth(-1);
    this.backgroundManager = new BackgroundManager(this, CONFIG.TEXTURES.BG_EARTH, -10);
    const baseY = this.scale.height - 140;
    const baseBlock = new Block(this, centerX, baseY);
    this.installedBlocks.push(baseBlock);
    this.physicsBlocks.push(baseBlock);
    this.hud = new HUD(this);
    this.physics.world.setBounds(0, -1e5, this.scale.width, 1e5 + this.scale.height);
    this.input.on("pointerdown", this.dropBlock, this);
    this.currentZone = getZoneByDistance(this.distanceLeft);
    this.cameras.main.setBackgroundColor(this.currentZone.color);
    this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);
    this.spawnBlock();
  }
  /**
   * Спавн нового активного блока и транспорта для текущей зоны
   */
  spawnBlock() {
    if (this.isGameOver) return;
    this.isDropping = false;
    this.isProcessingLanding = false;
    this.clearColliders();
    const zone = getZoneByDistance(this.distanceLeft);
    const spawnY = this.cameras.main.scrollY + CONFIG.CAMERA.SPAWN_OFFSET;
    if (!this.activeTransport || this.activeTransport.constructor.name.toLowerCase() !== zone.transport) {
      if (this.activeTransport) this.activeTransport.destroy();
      this.activeTransport = this.transportFactories[zone.transport]();
    }
    this.activeTransport.activate(spawnY);
    this.activeTransport.update(this.time.now, 0, this.currentZone);
    const spawnPos = this.activeTransport.getBlockSpawnPosition();
    this.activeBlock = new Block(this, spawnPos.x, spawnPos.y);
  }
  /**
   * Обработка клика — сброс блока
   */
  dropBlock() {
    if (!this.activeBlock || this.isDropping || this.isGameOver) return;
    this.isDropping = true;
    this.activeBlock.startFalling();
    this.audio.play("drop");
    const topBlock = this.installedBlocks[this.installedBlocks.length - 1];
    this.colliders.push(
      this.physics.add.collider(
        this.activeBlock.sprite,
        topBlock.sprite,
        this.onBlockLanded,
        null,
        this
      )
    );
    this.installedBlocks.forEach((block) => {
      if (block !== topBlock) {
        this.colliders.push(
          this.physics.add.collider(
            this.activeBlock.sprite,
            block.sprite,
            () => {
              if (!this.isGameOver && this.isDropping) {
                this.gameOver();
              }
            },
            null,
            this
          )
        );
      }
    });
    this.colliders.push(
      this.physics.add.collider(
        this.activeBlock.sprite,
        this.ground,
        this.onGroundHit,
        null,
        this
      )
    );
    this.time.delayedCall(3e3, () => {
      if (!this.isGameOver && this.activeBlock) {
        const bottomLimit = this.cameras.main.scrollY + this.scale.height + 300;
        if (this.activeBlock.y > bottomLimit) {
          this.gameOver();
        }
      }
    });
  }
  /**
   * Попадание блока в землю
   */
  onGroundHit(blockSprite, groundSprite) {
    if (this.isGameOver || !this.isDropping) return;
    if (blockSprite.body) {
      blockSprite.body.stop();
      blockSprite.body.allowGravity = false;
      blockSprite.body.moves = false;
    }
    if (this.activeBlock) {
      this.activeBlock.sprite.setVisible(false);
    }
    new Crash(this, blockSprite.x, blockSprite.y - 50);
    this.time.delayedCall(600, () => {
      if (!this.isGameOver) this.gameOver();
    });
  }
  /**
   * Приземление блока на другой блок
   */
  onBlockLanded(fallingSprite, targetSprite) {
    if (this.isGameOver || this.isProcessingLanding) return;
    if (!this.activeBlock || fallingSprite !== this.activeBlock.sprite) return;
    this.isProcessingLanding = true;
    this.clearColliders();
    const fallingBlock = this.activeBlock;
    const targetBlock = this.installedBlocks[this.installedBlocks.length - 1];
    if (!fallingBlock.isBalancedOn(targetBlock)) {
      const direction = fallingBlock.x > targetBlock.x ? 1 : -1;
      fallingBlock.slideAway(direction);
      this.activeBlock = null;
      this.isDropping = false;
      this.audio.play("fail");
      this.time.delayedCall(1800, () => this.gameOver());
      return;
    }
    fallingBlock.fixInPlace();
    this.installedBlocks.push(fallingBlock);
    this.physicsBlocks.push(fallingBlock);
    this.activeBlock = null;
    this.audio.play("land");
    const effectX = fallingBlock.x + /*(fallingBlock.size/2) + */
    randomRange(-30, 30);
    const effectY = fallingBlock.y + fallingBlock.size / 2 + randomRange(-15, 10);
    new Puff(this, effectX, effectY);
    this.blocksPlacedCount++;
    const achievementMsg = CONFIG.ACHIEVEMENTS[this.blocksPlacedCount];
    if (achievementMsg) {
      this.showAchievement(achievementMsg);
      console.log(`Ачивка разблокирована на блоке #${this.blocksPlacedCount}: ${achievementMsg}`);
    }
    this.distanceLeft -= CONFIG.DISTANCE.PER_BLOCK;
    this.distanceAchived += CONFIG.DISTANCE.PER_BLOCK;
    if (this.distanceLeft <= 0) {
      this.distanceLeft = 0;
      this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);
      this.victory();
      return;
    }
    const newZone = getZoneByDistance(this.distanceLeft);
    if (newZone.label !== this.currentZone.label) {
      this.currentZone = newZone;
      this.onZoneChange(newZone);
    }
    this.hud.update(this.distanceLeft, CONFIG.DISTANCE.TOTAL, this.currentZone.name);
    this.cleanupOldBlocks();
    const triggerLine = this.cameras.main.scrollY + this.scale.height * CONFIG.CAMERA.TRIGGER_LINE;
    if (fallingBlock.y < triggerLine) {
      const targetScrollY = fallingBlock.y - this.scale.height * CONFIG.CAMERA.TRIGGER_LINE;
      this.tweens.add({
        targets: this.cameras.main,
        scrollY: targetScrollY,
        duration: 600,
        ease: "Sine.easeInOut"
      });
    }
    this.time.delayedCall(400, () => this.spawnBlock());
  }
  /**
   * Смена игровой зоны
   */
  onZoneChange(zone) {
    if (this.backgroundManager) {
      this.backgroundManager.destroy();
    }
    let bgTexture = CONFIG.TEXTURES.BG_EARTH;
    if (zone.label === "sky") {
      bgTexture = CONFIG.TEXTURES.BG_SKY;
    } else if (zone.label === "space") {
      bgTexture = CONFIG.TEXTURES.BG_SPACE;
    }
    this.backgroundManager = new BackgroundManager(this, bgTexture, -10);
    this.audio.play("zone");
    const cx = this.scale.width / 2;
    const cy = this.cameras.main.scrollY + this.scale.height * 0.4;
    const text = this.add.text(cx, cy, zone.name, {
      fontSize: CONFIG.UI.FONT_SIZE_XLARGE,
      fill: CONFIG.UI.COLOR_BLUE,
      fontStyle: "bold",
      fontFamily: CONFIG.UI.FONT_FAMILY
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: text,
      alpha: 1,
      scale: { from: 0.8, to: 1 },
      duration: 400,
      yoyo: true,
      hold: 1200,
      onComplete: () => text.destroy()
    });
  }
  /**
  * Показывает сообщение об ачивке в стиле смены зоны
  * @param {string} text - Текст сообщения
  */
  showAchievement(text) {
    const cx = this.scale.width / 2;
    const cy = this.scale.height * 0.4;
    const maxWidth = this.scale.width * 0.8;
    const achievementText = this.add.text(cx, cy, text, {
      fontSize: CONFIG.UI.FONT_SIZE_LARGE,
      fill: CONFIG.UI.COLOR_GREEN,
      fontStyle: "bold",
      fontFamily: CONFIG.UI.FONT_FAMILY,
      wordWrap: {
        width: maxWidth
      },
      align: "center"
    }).setOrigin(0.5).setAlpha(0).setScrollFactor(0).setDepth(300);
    this.tweens.add({
      targets: achievementText,
      alpha: 1,
      duration: 600,
      ease: "Power2",
      yoyo: true,
      hold: 2500,
      onComplete: () => {
        achievementText.destroy();
      }
    });
  }
  /**
   * Победа
   */
  victory() {
    this.isGameOver = true;
    this.clearColliders();
    this.audio.play("victory");
    const cx = this.scale.width / 2;
    const cy = this.cameras.main.scrollY + this.scale.height / 2;
    if (!this.moon) {
      this.moon = this.add.image(cx, this.cameras.main.scrollY - 600, CONFIG.TEXTURES.MOON);
      this.moon.setScale(0.15);
    }
    this.tweens.add({
      targets: this.moon,
      scale: 1.3,
      alpha: 1,
      y: cy - 100,
      duration: 1500,
      ease: "Power2"
    });
    this.time.delayedCall(1600, () => {
      this.add.text(cx, cy - 80, "А ВОТ И ЛУНА!", {
        fontSize: CONFIG.UI.FONT_SIZE_XLARGE,
        fill: CONFIG.UI.COLOR_GREEN,
        fontStyle: "bold",
        fontFamily: CONFIG.UI.FONT_FAMILY
      }).setOrigin(0.5);
      this.add.text(cx, cy, "Пройдено 384 400 км. +/- 12 см.", {
        fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
        fill: CONFIG.UI.COLOR_BLUE,
        fontFamily: CONFIG.UI.FONT_FAMILY
      }).setOrigin(0.5);
      const hint = this.add.text(cx, cy + 60, "Нажмите для рестарта", {
        fontSize: CONFIG.UI.FONT_SIZE_SMALL,
        fill: CONFIG.UI.COLOR_BLUE,
        fontFamily: CONFIG.UI.FONT_FAMILY
      }).setOrigin(0.5);
      this.tweens.add({
        targets: hint,
        alpha: 0,
        duration: 700,
        yoyo: true,
        repeat: -1
      });
      this.input.once("pointerdown", () => this.scene.restart());
    });
  }
  /**
   * Конец игры
   */
  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.clearColliders();
    this.blocksPlacedCount = 0;
    const cx = this.scale.width / 2;
    const cy = this.cameras.main.scrollY + this.scale.height / 2;
    this.add.text(cx, cy - 50, "ИГРА ОКОНЧЕНА", {
      fontSize: CONFIG.UI.FONT_SIZE_XLARGE,
      fill: CONFIG.UI.COLOR_RED,
      fontStyle: "bold",
      fontFamily: CONFIG.UI.FONT_FAMILY
    }).setOrigin(0.5);
    this.add.text(cx, cy + 20, `Вы прошли: ${this.distanceAchived} км.`, {
      fontSize: CONFIG.UI.FONT_SIZE_MEDIUM,
      fill: CONFIG.UI.COLOR_BLUE,
      fontFamily: CONFIG.UI.FONT_FAMILY
    }).setOrigin(0.5);
    const hint = this.add.text(cx, cy + 80, "Нажмите для рестарта", {
      fontSize: CONFIG.UI.FONT_SIZE_SMALL,
      fill: CONFIG.UI.COLOR_BLUE,
      fontFamily: CONFIG.UI.FONT_FAMILY
    }).setOrigin(0.5);
    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 700,
      yoyo: true,
      repeat: -1
    });
    this.input.once("pointerdown", () => this.scene.restart());
  }
  /**
   * Главный цикл обновления
   */
  update(time, delta) {
    if (this.backgroundManager) {
      this.backgroundManager.update();
    }
    if (this.activeBlock && !this.isDropping && !this.isGameOver && this.activeTransport) {
      this.activeTransport.update(time, delta, this.currentZone);
      const blockPos = this.activeTransport.getBlockSpawnPosition();
      this.activeBlock.sprite.setPosition(blockPos.x, blockPos.y);
      if (this.activeTransport.isOutOfBounds()) {
        this.gameOver();
      }
    }
    if (this.activeBlock && this.isDropping && !this.isGameOver && !this.isProcessingLanding) {
      const v = this.activeBlock.sprite.body.velocity.y;
      const last = this.installedBlocks[this.installedBlocks.length - 1];
      if (Math.abs(v) < 10 && this.activeBlock.y > last.y + 200) {
        this.gameOver();
      }
    }
  }
  /**
   * Очищает все активные коллайдеры
   */
  clearColliders() {
    this.colliders.forEach((c) => c == null ? void 0 : c.destroy());
    this.colliders = [];
  }
  /**
   * ОЧИСТКА ПАМЯТИ: Удаляет блоки, которые ушли ниже камеры
   * Вызывается после каждой успешной установки блока.
   */
  cleanupOldBlocks() {
    const cameraBottom = this.cameras.main.worldView.bottom;
    const buffer = 300;
    let removedCount = 0;
    while (this.installedBlocks.length > 0) {
      const oldestBlock = this.installedBlocks[0];
      if (oldestBlock.y > cameraBottom + buffer) {
        const physIndex = this.physicsBlocks.indexOf(oldestBlock);
        if (physIndex > -1) {
          this.physicsBlocks.splice(physIndex, 1);
        }
        oldestBlock.destroy();
        this.installedBlocks.shift();
        removedCount++;
      } else {
        break;
      }
    }
    if (removedCount > 0) {
      console.log(`Оптимизация: удалено старых блоков из памяти: ${removedCount}`);
    }
  }
  /**
   * ДЕБАГ: Имитирует идеальную установку текущего блока
   * Позволяет быстро проверять ачивки, камеру и смену зон.
   */
  debugPlaceBlock() {
    return;
  }
}
WebFont.load({
  custom: {
    families: ["Daneehand"],
    urls: ["./assets/fonts/Daneehand.ttf"]
  },
  active: () => {
    console.log("Шрифты загружены");
  },
  inactive: () => {
    console.warn("Шрифты не загрузились, используем системные");
  }
});
const phaserConfig = {
  type: Phaser.AUTO,
  // WebGL или Canvas
  parent: "game-container",
  width: 720,
  height: 1080,
  backgroundColor: "#000000",
  // Масштабирование под экран
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // Физика
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: false
      //  true для отладки физики
    }
  },
  // Сцены
  scene: [StartScene, GameScene],
  // Отключаем контекстное меню по правому клику
  input: {
    mouse: {
      preventDefaultWheel: true,
      preventDefaultDown: true
    },
    touch: {
      capture: true
    }
  },
  // Рендеринг
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  }
};
window.addEventListener("load", () => {
  const game = new Phaser.Game(phaserConfig);
  window.game = game;
  console.log('Игра "384400" запущена!');
});
