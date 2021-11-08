class Dot extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y ) {
        super(scene, x, y, 'dot');
        scene.add.existing(this);  
        let dotArea = new Phaser.Geom.Circle(64, 64, 45);
        this.setInteractive(dotArea, Phaser.Geom.Circle.Contains);
        this.t = 0;
        this.isTween = false;
        this.scene.events.on('update', (time, delta) => { this.update(time, delta)} );
    }
    
    update() {
        if(this.t > 0) {
                let vec = new Phaser.Math.Vector2();
                this.path.getPoint(this.t, vec);
                this.setPosition(vec.x,vec.y);
            }
    }
    setPos (row, column) {
        this.row = row;
        this.column = column;
    }
    
    setColor(num) {
        this.color = colorsGroup[num];
        this.colorNum = num;
        this.setTint(this.color);
    }
    // call when dot fall 
    tween(path) {
        this.path = path;
        this.scene.tweens.add({
            targets: this,
            t: 1,
            ease: 'Bounce',
            duration: 800,
        }).setCallback('onComplete', () => {
            this.t = 0;
            this.isTween = true;
        }, []);
    }
    // call when spawn new dots
    spawnDots() {
        this.alpha = 0;
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            ease: 'Bounce',
            duration: 800,
        });
    }
    // call when dot be seleted 
    scaleDots() {
        this.scene.tweens.add({
            targets: this,
            scale: {from: 0.55, to: 0.4},
            duration: 350,
            ease: 'Sine.easeInOut'
        });
    }
    // call when make a loop
    scaleDot() {
        this.scene.tweens.add({
            targets: this,
            scale: {from: 0.55, to: 0.4},
            duration: 350,
            ease: 'Sine.easeInOut'
        }).setCallback('onComplete', () => {
            this.scene.endSelected();
        }, []);
    }
}