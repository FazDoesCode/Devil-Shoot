class LoadingScene extends Phaser.Scene {

    constructor() {
        super("LoadingScene");
    }

    // Load assets.
    preload() {
        this.load.image("player", "assets/jesus.png");
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("laser", "assets/laser.png");
        this.load.image("devilball", "assets/devilball.png");
    }

    create() {
        this.add.text(20, 20, "Loading game...");
        this.scene.start("SceneOne");
    }

}