class SceneOne extends Phaser.Scene {

    playerShootCooldown = 500;

    totalEnemies = 32;
    enemyShootCooldown = 3 * 1000;

    constructor() {
        super("SceneOne");
    }

    create() {
        const endlessMode = false;

        // Starting Time (used for lasers and enemy balls)
        this.gameStartTime = Date.now();

        // Flavour text (I didn't make more levels)
        this.levelText = this.add.text(20, 20, "Level One: Outer Heaven")

        // Create player object.
        this.player = this.physics.add.image(config.width / 2, config.height - 32, "player");
        this.player.setCollideWorldBounds(true);
        this.player.alive = true;

        // Create group to handle enemies.
        this.enemies = this.physics.add.group();

        // Enemies remaining counter
        this.enemiesRemaining = this.totalEnemies;
        this.enemiesRemainingText = this.add.text(20, 40, `Enemies Remaining: ${ this.enemiesRemaining }`);

        // you win text
        this.youWinText = this.add.text(200, 500 / 2, "", {
            fill: "yellow",
            font: "20px"
        });

        // Kills
        this.kills = 0;

        // Check to see if the player collides with an enemy
        this.physics.add.overlap(this.player, this.enemies, this.enemyCollision, null, this);

        // Keyboard input.
        this.keys = this.input.keyboard.createCursorKeys();
        this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // Spawns enemies
        for (let i = 0; i < this.totalEnemies; i++) {
            if (this.enemies.countActive() < this.totalEnemies) {
                const newEnemy = this.physics.add.image(
                    Phaser.Math.Between(0 + 32, 500 - 32),
                    Phaser.Math.Between(0 + 32, 400 / 2),
                    "enemy"
                    );
                newEnemy.direction = Math.random() >= 0.5 ? -1 : 1;
                newEnemy.speedOffset = Math.random();
                this.enemies.add(newEnemy);
            }
        }
    }

    // Runs once per frame.
    update() {
        this.playerControl();
        this.enemyHandle();

        if (this.endlessMode){
            this.totalEnemies = 16
            this.youWinText.text = " ";
        }

        if (this.kills >= 32 && !this.endlessMode) {
            this.youWinText.text = "You Win!";
        }
    }

    // player movement
    playerControl() {
        if (!this.player.alive) return;
        if (this.keys.down.isDown) this.player.y += 2;
        if (this.keys.up.isDown) this.player.y -= 2;
        if (this.keys.left.isDown) this.player.x -= 2;
        if (this.keys.right.isDown) this.player.x += 2;
        if (this.keys.space.isDown) this.playerShoot();
        if (this.keyP.isDown) {
            if (!this.endlessMode)
                this.add.text(0, 480, "ENDLESS MODE", {
                    fill: "white",
                    font: "20px"
                });
            this.endlessMode = true;
        }
    }

    // fires a laser
    timeSinceLastLaser = 0;
    playerShoot() {
        if (this.timeSinceLastLaser + this.playerShootCooldown > this.deltaTime()) return;
        const laser = this.physics.add.image(this.player.x, this.player.y, "laser");
        this.physics.add.overlap(this.enemies, laser, this.playerShotEnemy, null, this);
        this.physics.world.enableBody(laser);
        laser.body.velocity.y -= 200;
        this.timeSinceLastLaser = this.deltaTime();
    }

    // laser and enemy collisions
    playerShotEnemy(enemy, laser) {
        if (!this.endlessMode){
            this.kills++;
            this.enemiesRemaining--;
            this.enemiesRemainingText.text = `Enemies Remaining: ${ this.enemiesRemaining }`;
        } else {
            this.enemiesRemaining--;
            this.kills++;
            this.enemiesRemainingText.text = `Enemy kills: ${ this.kills }`;
        }
        enemy.destroy();
        laser.destroy();
    }

    // player and enemy collision.
    enemyCollision(player, enemy) {
        enemy.destroy();
        this.playerDeath();
    }

    // player death
    playerDeath() {
        this.player.destroy();
        this.player.alive = false;
        this.add.text(20, 500 / 2, "You got hit! Refresh to try again!", {
            fill: "red",
            font: "20px"
        });
    }

    lastShot = 0;
    lastRespawn = 0;
    async enemyHandle() {
        // Moves enemies side to side
        for (let i = 0; i < this.enemies.getChildren().length; i++) {
            const enemy = this.enemies.getChildren()[i];
            if (enemy.x > 500 - 16 || enemy.x < 0 + 16) {
                enemy.direction *= -1;
            }
            enemy.x += enemy.speedOffset * enemy.direction;
        }

        // Shoots every 3 seconds
        if (this.lastShot + this.enemyShootCooldown < this.deltaTime()) {
            for (let i = 0; i < this.enemies.getChildren().length; i++) {
                const enemy = this.enemies.getChildren()[i];

                // creates the devil ball
                const devilBall = this.physics.add.image(enemy.x, enemy.y, "devilball");
                this.physics.world.enableBody(devilBall);

                // player collision with enemy projectile
                this.physics.add.overlap(devilBall, this.player, () => { this.playerDeath(); }, null, this);

                // does a random
                const thing = Math.random() >= 0.5 ? -1 : 1;
                const randomOffset = Math.random() * 50;

                // makes the ball move straight down with x offset
                devilBall.body.velocity.x += (25 + randomOffset) * thing;
                devilBall.body.velocity.y += 2 * randomOffset + 100;
            }
            this.lastShot = this.deltaTime();
        }

        // if endless mode is enabled
        if (!this.endlessMode) return;
        if (this.lastRespawn + 6000 < this.deltaTime()) {
            for (let i = 0; i < this.totalEnemies; i++) {
                if (this.enemies.countActive() < this.totalEnemies) {
                    const newEnemy = this.physics.add.image(
                        Phaser.Math.Between(0 + 32, 500 - 32),
                        Phaser.Math.Between(0 + 32, 400 / 2),
                        "enemy"
                        );
                    newEnemy.direction = Math.random() >= 0.5 ? -1 : 1;
                    newEnemy.speedOffset = Math.random();
                    this.enemies.add(newEnemy);
                    this.enemiesRemaining++;
                }
            }
            this.lastRespawn = this.deltaTime();
        }
    }

    // Returns time since scene was created.
    deltaTime() {
        return Date.now() - this.gameStartTime;
    }

}