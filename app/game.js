const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    parent: "game",
    backgroundColor: "red",
    scene: {
        preload,
        create,
        update
    }
};

const state = {};
const gameStartTime = Date.now();

function preload() {
    this.load.image("player", "assets/jesus.png");
    this.load.image("enemy", "assets/enemy.png");
    state.enemies = [];
}

function create() {
    state.player = this.add.image(200, 500, "player");
    
    for (let i = 0; i < 3; i++) {
        state.enemies.push(this.add.image(Math.floor(Math.random() * 368), Math.floor(Math.random() * 300 + 16), "enemy"));
        state.enemies[i].speedOffset = Math.random();
        state.enemies[i].direction = Math.random() >= 0.50 ? -1 : 1;
    }

}

function update() {
}

const game = new Phaser.Game(config);