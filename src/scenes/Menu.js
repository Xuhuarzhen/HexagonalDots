class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }
    
    create(){
        numRows = 5;
        numColumns = 5;
        numColors = 3;
        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background').setOrigin(0)
        //UI
        let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '40px',
            color: '#F645FF',
            stroke: '#FFFFFF', 
            strokeThickness: 5,
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        //menu text UI
        let centerX = game.config.width/2;
        let centerY = game.config.height/2;
        let textSpacer = 64;
        let menu1Config = {
            fontFamily: 'Courier',
            fontSize: '32px',
            color: '#000000',
            stroke: '#FFFFFF', 
            strokeThickness: 3,
            padding: {top: 5,bottom: 5,},
            fixedWidth: 0}
        this.add.text(centerX, centerY - textSpacer*2, 'HEX DOTS', menuConfig).setOrigin(0.5);
        this.add.text(centerX, centerY - textSpacer, '(Press ENTER to Start)', menuConfig).setOrigin(0.5);
        this.rowInputText = this.add.text(centerX, centerY + textSpacer, `Row Size (3-10):   ${numRows}   `, menu1Config).setOrigin(0.5);
        this.colInputText = this.add.text(centerX, centerY + textSpacer*2, `Column Size (3-10):   ${numColumns}   `, menu1Config).setOrigin(0.5);
        this.colorInputText = this.add.text(centerX, centerY + textSpacer*3, `Color size (2-8):   ${numColors}   `, menu1Config).setOrigin(0.5);
            
        //button
        this.rowPlus = this.add.sprite(centerX + 120, centerY + textSpacer, 'plus').setScale(0.1).setInteractive().on('pointerdown', () => {
            if (numRows >= 3 && numRows < 10) {
                numRows++;
                this.rowInputText.setText('Row Size (3-10):   ' + numRows + '   ');
            }
        });
        this.colPlus = this.add.sprite(centerX + 145, centerY + textSpacer*2, 'plus').setScale(0.1).setInteractive().on('pointerdown', () => {
            if (numColumns >= 3 && numColumns< 10) {
                numColumns++;
                this.colInputText.setText('Coluumn Size (3-10):   ' + numColumns + '   ');
            }
        });
        this.colorPlus = this.add.sprite(centerX + 120, centerY + textSpacer*3, 'plus').setScale(0.1).setInteractive().on('pointerdown', () => {
            if (numColors >= 2 && numColors < 8) {
                numColors ++;
                this.colorInputText.setText('Color size (2-8):   ' + numColors + '   ');
            }
        });
        this.rowMinus = this.add.sprite(centerX + 190, centerY + textSpacer, 'minus').setScale(0.12).setInteractive().on('pointerdown', () => {
            if (numRows > 3 && numRows <= 10) {
                numRows--;
                this.rowInputText.setText('Row Size (3-10):   ' + numRows + '   ');
            }
        });
        this.colMinus = this.add.sprite(centerX + 225, centerY + textSpacer*2, 'minus').setScale(0.12).setInteractive().on('pointerdown', () => {
            if (numColumns > 3 && numColumns <= 10) {
                numColumns--;
                this.colInputText.setText('Coluumn Size (3-10):   ' + numColumns + '   ');
            }
        });
        this.colorMinus = this.add.sprite(centerX + 190, centerY + textSpacer*3, 'minus').setScale(0.12).setInteractive().on('pointerdown', () => {
            if (numColors > 2 && numColors <= 8) {
                numColors--;
                this.colorInputText.setText('Color size (2-8):   ' + numColors + '   ');
            }
        });
      
        this.enterTime = 0;
        this.inputNum = 0;
        
        keyENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    }

    update(){
        if(Phaser.Input.Keyboard.JustDown(keyENTER)){
            this.scene.start("playScene");
        }

    }
}