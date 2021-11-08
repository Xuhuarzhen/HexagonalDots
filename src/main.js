let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Load, Menu, Play ],
};

let game = new Phaser.Game(config);

//reserve keyboard variables
let keyR, keyQ, keyENTER, keyDOWN, keyUP;

//define Game Settings
game.settings = {
    initialLevel: 0,
    initialSpeed: 1,   
}

// define globals
let centerX = game.config.width/2;
let centerY = game.config.height/2;
let canvasWidth = game.config.width;
let canvasHeight = game.config.height;
let numRows;
let numColumns;
let numColors;
let colorsGroup = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xffa500, 0x8B00FF, 0xFFFFFF, 0xFFC0CB];

let time;
let score;
let highScore;
let newHighScore = false;
