/// <reference path="phaser.d.ts"/>
var game = new Phaser.Game('100', '100', Phaser.AUTO, '', { preload: preload, create: create, update: update });
var arrowKeys;
var player;
var objectivePoints;
var obsticles;
var scoreBoard;
var PLAYER_ACCELERATION_RATE = 500;
var PLAYER_MAX_VELOCITY = 250;
var PLAYER_ROTATION_RATE = Math.PI / 30;
function preload() {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('red', 'assets/red.png');
    game.load.image('green', 'assets/green.png');
    game.load.image('blue', 'assets/blue.png');
}
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    objectivePoints = game.add.group();
    objectivePoints.enableBody = true;
    objectivePoints.physicsBodyType = Phaser.Physics.ARCADE;
    objectivePoints.createMultiple(3, 'blue', null, true);
    objectivePoints.forEach(function (obj) {
        obj.scale.setTo(0.5, 0.5);
        obj.anchor.setTo(0.5, 0.5);
        obj.x = game.world.randomX;
        obj.y = game.world.randomY;
    }, this);
    obsticles = game.add.group();
    obsticles.enableBody = true;
    obsticles.physicsBodyType = Phaser.Physics.ARCADE;
    createObsticle();
    scoreBoard = new ScoreBoard(game.add.text(game.world.centerX, 10, '', { font: '34px Arial', fill: '#fff' }), 0);
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
    player.scale.setTo(0.025, 0.025);
    player.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    player.body.maxVelocity = new Phaser.Point(PLAYER_MAX_VELOCITY, PLAYER_MAX_VELOCITY);
    game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
    arrowKeys = game.input.keyboard.createCursorKeys();
}
function update() {
    player.body.acceleration = getPlayerAcceleration();
    player.rotation = getShipAngle();
    game.physics.arcade.collide(player, objectivePoints, function (player, objPoint) {
        objPoint.kill();
        objectivePoints.getFirstDead().reset(game.world.randomX, game.world.randomY);
        scoreBoard.score++;
        createObsticle();
    });
    game.physics.arcade.collide(player, obsticles, function (player, obsticle) {
        obsticle.kill();
        var old;
        if (objectivePoints.countLiving() > 0) {
            old = objectivePoints.getFirstAlive();
        }
        else {
            old = player;
        }
        old.kill();
        var newObsticle = obsticles.getFirstDead();
        newObsticle.reset(old.x, old.y);
        scoreBoard.score--;
    });
}
function getPlayerAcceleration() {
    var x = 0;
    var y = 0;
    if (arrowKeys.left.isDown) {
        x = -PLAYER_ACCELERATION_RATE;
    }
    else if (arrowKeys.right.isDown) {
        x = PLAYER_ACCELERATION_RATE;
    }
    if (arrowKeys.up.isDown) {
        y = -PLAYER_ACCELERATION_RATE;
    }
    else if (arrowKeys.down.isDown) {
        y = PLAYER_ACCELERATION_RATE;
    }
    return new Phaser.Point(x, y);
}
function getShipAngle() {
    var x = 0;
    var y = 0;
    if (arrowKeys.left.isDown) {
        x = -1;
    }
    else if (arrowKeys.right.isDown) {
        x = 1;
    }
    if (arrowKeys.up.isDown) {
        y = -1;
    }
    else if (arrowKeys.down.isDown) {
        y = 1;
    }
    if (x == 0 && y == 0) {
        return player.rotation;
    }
    var delta = Phaser.Math.wrap(Math.atan2(y, x) - player.rotation, -Math.PI, Math.PI);
    return player.rotation + Phaser.Math.clamp(delta, -PLAYER_ROTATION_RATE, PLAYER_ROTATION_RATE);
}
var ScoreBoard = (function () {
    function ScoreBoard(scoreText, score) {
        this.scoreText = scoreText;
        this.score = score || 0;
    }
    Object.defineProperty(ScoreBoard.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (score) {
            this._score = score;
            this.scoreText.text = String(this._score);
        },
        enumerable: true,
        configurable: true
    });
    return ScoreBoard;
})();
function createObsticle() {
    var obj = obsticles.create(game.world.randomX, game.world.randomY, 'red');
    obj.scale.setTo(0.5, 0.5);
    obj.anchor.setTo(0.5, 0.5);
}
