/**
 * Менеджер звуков. Сейчас — заглушка.
 * Позже сюда добавится загрузка аудио и Phaser Audio Sprites.
 */
export class AudioManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
    }

    /**
     * В будущем: загрузка звуков
     * @param {Phaser.Scene} scene
     */
    init(scene) {
        // scene.load.audio('drop', 'assets/drop.mp3');
        // scene.load.audio('land', 'assets/land.mp3');
        // scene.load.audio('fail', 'assets/fail.mp3');
        // scene.load.audio('zone', 'assets/zone.mp3');
        // scene.load.audio('victory', 'assets/victory.mp3');
    }

    /**
     * Воспроизводит звук по ключу
     * @param {string} key
     */
    play(key) {
        if (!this.enabled) return;
        // if (this.sounds[key]) this.sounds[key].play();
    }

    setEnabled(value) {
        this.enabled = value;
    }
}