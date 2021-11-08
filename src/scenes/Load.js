class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        //load background
        this.load.image('background', './assets/bg.png');
        this.load.image('dot', './assets/dot.png');
        this.load.image('hex', './assets/hex.png');
        this.load.image('minus', './assets/minus.png');
        this.load.image('plus', './assets/plus.png');
    }
    
    create() {
        if(window.localStorage) {
            console.log('Local storage supported');
        } else {
            console.log('Local storage not supported');
        }

        this.scene.start('menuScene');
    }
}