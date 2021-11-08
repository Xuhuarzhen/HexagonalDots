class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }
    
    create() {
        score = 0;
        time = 4.00;
        this.numRows = numRows;
        this.numColumns = numColumns;
        this.numColors = numColors;
        this.gameOver = false;
        this.isSelected = false;
        this.canTween = false;
        this.canReload = false; 
        this.isLoop = false;
        this.targetGroup = new Array();
        this.columnToChange = new Array();  // to detect the columns that need to be checked
        this.spawnDotPosArray = new Array();    // to detect new dots that need to be added
        this.haveTweenArray = new Array();
        // set
        this.background = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'background').setOrigin(0).setDepth(-2);
        this.ScoreText = this.add.text(60, 20, `Score: ${score}`, { 
            //backgroundColor: '#000000',
            fontFamily: 'Helvetica', 
            fontSize: '30px', 
            color: '#FF0000' , 
            stroke: '#000000', 
            strokeThickness: 3});
        this.TimerText= this.add.text(600, 20, `Timer: ${time}`, { 
            //backgroundColor: '#000000',
            fontFamily: 'Helvetica', 
            fontSize: '30px', 
            color: '#FFFFFF' , 
            stroke: '#000000', 
            strokeThickness: 3});    
        // lines
        this.graphics = this.add.graphics();
        this.lines = this.add.graphics();
        // bg board
        this.width = canvasWidth - 50;
        this.height = canvasHeight - 100;
        let ratio = (this.numColumns+0.5) / this.numRows; 
        this.height = 45* this.numRows;
        this.width = 45*(this.numColumns+1/2); 
        this.height * ratio;
        // dots distance
        this.dotDisX = 45;
        this.dotDisY = 45;
        this.dotScale = 0.4;
        // key set
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).on('down', () => {
            if (this.gameOver)  this.scene.start('menuScene');
        });
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).on('down', () => {
            if (this.gameOver)  this.scene.restart(this.level);
        });
        // Store the color of each dot
        this.dotColorArray = new Array(this.numRows).fill(null).map(function() { 
            return new Array(); 
        });
        // grid set
        this.hexGrid = new Array(this.numRows).fill(null).map(function() { 
            return new Array(); 
        });
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numColumns; j++) {
                let dotX = centerX - this.width/2 + this.dotDisX * (j);
                let dotY = centerY + 150*this.dotScale - this.height/2 + this.dotDisY * i;
                if (i % 2 == 1) {
                    dotX += this.dotDisX/2;
                }
                this.hexGrid[i][j] = {x: dotX, y: dotY };
                this.dotColorArray[i][j] = {color: null, colorNum: null};
                //console.log(this.hexGrid[i][j]);
                this.hexBG = this.add.sprite(dotX, dotY, 'hex').setScale(1.55 * this.dotScale).setDepth(-2);
            }
        }
        // set dot group
        this.dotGroup = this.add.group({
            classType: Dot,
            createCallback: (dot) => {
                dot.group = this.dotGroup;
                dot.setScale(this.dotScale);
                dot.on('pointerdown', () => {
                    if (!this.gameOver) this.dotClicked(dot);
                });
          
                dot.on('pointermove', () => {
                    if (!this.gameOver) this.dotExtend(dot);
                });
            }
        });
        this.input.on('pointerup', () => {
            if (!this.gameOver) this.selectedEnd()
        });
        //fill dots to the grid
        this.hexGrid.forEach((row, i) => { 
            row.forEach((colum, j) => {
                this.setDots(i, j);
            });
        });
        // timer
        this.Timer = this.time.addEvent({ 
            delay: 30000, 
            loop: false
        });
    
    } 
    // set dot to row i, col j in the grid
    setDots(i, j) {
        let dot = this.dotGroup.get(this.hexGrid[i][j].x, this.hexGrid[i][j].y);
        //console.log(dot);
        this.setDotValue(dot, i, j, Phaser.Math.Between(0,this.numColors-1));
        this.dotColorArray[i][j].color = dot.color;
        this.dotColorArray[i][j].colorNum = dot.colorNum;
        this.hexGrid[i][j].dot = dot;
        dot.spawnDots();
    }
    
    setDotValue(dot, i, j, colorNum){
        dot.setActive(true);
        dot.setVisible(true);
        dot.setPos(i, j);
        dot.setColor(colorNum);
    }

    dotClicked(clickedDot) {
        if (!this.isSelected) {
            this.isSelected = true;
            clickedDot.scaleDots();
            this.selectedDot = clickedDot;
        }
    }
    
    dotExtend(nextDot) {
        if(this.isSelected) {
            this.startDrawLine(this.selectedDot);
            // check that the next dot matches the prev dot
            if (this.targetGroup != null && nextDot.color == this.selectedDot.color && 
                ((this.selectedDot.row % 2 == 0 && ((nextDot.row == this.selectedDot.row + 1 && (nextDot.column == this.selectedDot.column - 1 || nextDot.column == this.selectedDot.column))
                || (nextDot.row == this.selectedDot.row - 1 && (nextDot.column == this.selectedDot.column - 1 || nextDot.column == this.selectedDot.column))
                || (nextDot.row == this.selectedDot.row && (nextDot.column == this.selectedDot.column + 1 || nextDot.column == this.selectedDot.column - 1)))
                )||
                (this.selectedDot.row % 2 == 1 && ((nextDot.row == this.selectedDot.row + 1 && (nextDot.column == this.selectedDot.column + 1 || nextDot.column == this.selectedDot.column))
                || (nextDot.row == this.selectedDot.row - 1 && (nextDot.column == this.selectedDot.column + 1 || nextDot.column == this.selectedDot.column))
                || (nextDot.row == this.selectedDot.row && (nextDot.column == this.selectedDot.column + 1 || nextDot.column == this.selectedDot.column - 1))
                )))){
                    // the dot(start point for line) 
                    if (!this.targetGroup.includes(this.selectedDot)) {
                        this.targetGroup.push(this.selectedDot);
                    } 
                    // dots that have never been chosen
                    if (!this.targetGroup.includes(nextDot)) {
                        this.selectedDot = nextDot;
                        nextDot.scaleDots();
                        this.targetGroup.push(nextDot);
                        this.connectLine(nextDot);  
                    } else if (this.targetGroup.length >= 2) {
                        // if make a loop, auto-complete the player selection
                        if(!this.isLoop && nextDot == this.targetGroup[0]) {
                            this.isLoop = true;
                            this.connectLine(nextDot);
                            nextDot.scaleDot();
                        }
                    }           
                }
        }
    }
    
    endSelected() {
        this.graphics.clear();
        this.lines.clear();
        if (this.targetGroup.length > 1) {
                // Update Score
                this.updateScore(this.targetGroup.length);
                // Set the dot to invisible
                this.targetGroup.forEach((removableDot) => {
                    if (!this.columnToChange.includes(removableDot.column)) this.columnToChange.push(removableDot.column);
                    removableDot.setActive(false);
                    removableDot.setVisible(false);
                });
                this.columnToChange.sort();
            }
            this.canTween = true;
            this.isSelected = false;
    }
    
    selectedEnd() {
        if (this.isSelected && !this.isLoop) {
            this.endSelected();
        }   
    }
   
    startDrawLine(dot) { 
        this.graphics.clear();
        if (!this.isLoop) {
            this.graphics.lineStyle(6 ,dot.color);
            this.graphics.setDepth(-1);
            this.graphics.beginPath();
            this.graphics.moveTo(dot.x, dot.y);
            this.graphics.lineTo(this.input.activePointer.position.x, this.input.activePointer.position.y);
            this.graphics.stroke();
            this.lines.lineStyle(6 ,dot.color);
            this.lines.setDepth(-1);
            this.lines.beginPath()
            this.lines.moveTo(dot.x, dot.y);
        }
    }
    
    connectLine(nextDot) {
        this.lines.lineTo(nextDot.x, nextDot.y);
        this.lines.stroke();
    }
    
    updateDots() {
        // find null dot from left to right;
        while (this.columnToChange.length > 0){
            var thisColNum = this.columnToChange.pop();
            // find null dot from bottom to top row
            var dotsToTweenArray = new Array();
            for (var rowNum = this.numRows-1; rowNum >= 0; rowNum--) {
                if (!this.hexGrid[rowNum][thisColNum].dot.active) { //get the lowest null dot
                    dotsToTweenArray.push(this.hexGrid[rowNum][thisColNum].dot);
                }
            }
            //get new dots position 
            for (var dotR = 0; dotR < dotsToTweenArray.length; dotR++) {
                var pos = [dotR , thisColNum];
                this.spawnDotPosArray.push(pos);
            }
            //check row by row in same col, from bottom row
            for (var row = this.numRows-1; row >= 0; row--) { 
                // if: Not all the paths in this column are found, keep to find new path
                if (!this.rowToCheck(dotsToTweenArray, thisColNum) && !this.hexGrid[row][thisColNum].dot.active) { 
                    for (var r = row; r >= 0; r--) { 
                        // find the active dot above this dot
                        if (this.hexGrid[r][thisColNum].dot.active) {
                            this.tweenDots(row, thisColNum, r);
                            // Be sure to wait until tween is done
                            if (!this.haveTweenArray.includes(this.hexGrid[r][thisColNum].dot)) this.haveTweenArray.push(this.hexGrid[r][thisColNum].dot);
                            break;
                        }
                    }
                } 
                
                if (row == 0 && this.columnToChange.length == 0){
                    // if no dot need to fall, update the color array, set the selected dots' color to null
                    if (this.haveTweenArray.length == 0) {
                        this.targetGroup.forEach((dot) => { 
                            this.dotColorArray[dot.row][dot.column].color = null;
                            this.dotColorArray[dot.row][dot.column].colorNum = null;
                        });
                    }
                    this.canReload = true;
                }
            }
        }
        
        if (this.canReload && this.spawnDotPosArray.length > 0) {
            // When all the points have dropped, update the data in the grid
            if (this.haveTweenArray.length == 0 || this.haveTweenArray.every(v => v.isTween === true)) {
                this.reloadGrid();
                console.log("全都spawn了");
            
                //reset data
                this.targetGroup.splice(0,this.targetGroup.length);
                this.spawnDotPosArray.splice(0,this.spawnDotPosArray.length);
                this.haveTweenArray.splice(0,this.haveTweenArray.length);
                this.canReload = false;
                this.canTween = false;
                this.isLoop = false;
            }
        }
    }
    
    // Make sure found every dot that need to tween
    rowToCheck (dotsArray, colNumber) {
        var isChecked = 0;
        for (var r =  0; r < dotsArray.length; r++ ) { 
            if (!this.hexGrid[r][colNumber].dot.active) isChecked ++;
        }
        if (isChecked == dotsArray.length) {
            return true;
        } else {
            return false;
        }
    }
    
    reloadGrid() {
        this.dotGroup.clear();
        this.hexGrid.forEach((row, i) => { 
            row.forEach((col, j) => {
                let dot = this.dotGroup.get(col.x , col.y);
                // reset rest of the dots in the gird 
                if (this.dotColorArray[i][j].color != null) {
                    this.setDotValue(dot, i, j, this.dotColorArray[i][j].colorNum);
                    this.hexGrid[i][j].dot.destroy();
                    this.hexGrid[i][j].dot = dot;
                } else {
                    //add new dots
                    this.setDotValue(dot, i, j, Phaser.Math.Between(0,this.numColors-1));
                    this.hexGrid[i][j].dot.destroy();
                    this.hexGrid[i][j].dot = dot;
                    dot.spawnDots();
                    this.setDotColorArray(i, j, dot.color, dot.colorNum);
                }
            });
        });
    }
    
    tweenDots(targetDotRow, column, startDotRow) {
        var follower = this.hexGrid[startDotRow][column].dot;
        let path = new Phaser.Curves.Path(follower.x, follower.y);
        var step = targetDotRow - startDotRow; //step to get the target position
        // find its path from the actived dot to the deactived dot
        for (var s = 1; s <= step; s++){
            var nextX = this.hexGrid[startDotRow+s][column].x;
            var nextY = this.hexGrid[startDotRow+s][column].y;
            path.lineTo(nextX, nextY);
        }
        follower.tween(path);
        // when it arrived, active the deactived dot && update the color array
        this.hexGrid[targetDotRow][column].dot = follower;
        this.setDotColorArray(targetDotRow, column, follower.color, follower.colorNum);
        this.hexGrid[startDotRow][column].dot.active = false;
        this.setDotColorArray(startDotRow, column, null, null);
    }    
    
    setDotColorArray(r,c, color, colorNum) {
        this.dotColorArray[r][c].color = color;
        this.dotColorArray[r][c].colorNum = colorNum;
    }
    
    updateScore(number) {
        if (this.isLoop) {
           score += number * 2;
        }
        else {
            score += number;
        }
        console.log(score);
        this.ScoreText.setText('Score: ' + score);
    }
    
    update() {
        if (!this.gameOver) {
            time = ((30000 - this.Timer.getElapsed()) / 1000).toFixed(2);
            this.TimerText.setText('Timer : ' + time);
            // time is up
            if (time == 0) {
                this.selectedEnd();
                this.gameOver = true;
            }
            // dots can fall
            if (this.canTween) {
                this.updateDots();
            } 
        } else {
            this.gameEnd();
        }
    }
    
    gameEnd() {
        this.dotGroup.clear();
        this.ScoreText.destroy();
        this.TimerText.destroy();
        // check for high score in local storage
        if (localStorage.getItem('highScore') != null){
            let storedScore = parseInt(localStorage.getItem('highScore'));
            // see if current score is higher than stored score
            if(score > storedScore) {
                localStorage.setItem('highScore', score.toString());
                highScore = score;
                newHighScore = true;
            } else {
                highScore = parseInt(localStorage.getItem('highScore'));
                newHighScore = false;
            }
        } else {
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
            newHighScore = true;
        }
         // Prints out New HighScore!
        if(newHighScore) {
            this.newHighScoreText = this.add.text(centerX, centerY -10, `Congratulation! New Hi-Score!!` , {
                backgroundColor: '#000000',
                fontFamily: 'Helvetica', 
                fontSize: '40px', 
                color: '#F645FF',
                strokeThickness: 3 
                }).setOrigin(0.5);
        }
        this.add.text(centerX, centerY - 120, `You score is: ${score}` , { 
            backgroundColor: '#000000',
            fontFamily: 'Helvetica', 
            fontSize: '34px', 
            color: '#F645FF', 
            strokeThickness: 3 
        }).setOrigin(0.5);
        this.add.text(centerX, centerY - 80, `Your Hi-Score: ${highScore}`, { 
            backgroundColor: '#000000',
            fontFamily: 'Helvetica', 
            fontSize: '34px', 
            color: '#F645FF',
            strokeThickness: 3 
        }).setOrigin(0.5);
        
        this.clock = this.time.delayedCall(4000, () => { 
            this.add.text(centerX, centerY + 60, `Press (R) to restart the game.`, { 
                backgroundColor: '#000000',
                fontFamily: 'Helvetica', 
                fontSize: '34px', 
                color: '#F645FF',
                strokeThickness: 3 
            }).setOrigin(0.5);
            this.add.text(centerX, centerY + 100, `Press (Q) to go back to main menu.`, { 
                backgroundColor: '#000000',
                fontFamily: 'Helvetica', 
                fontSize: '34px', 
                color: '#F645FF', 
                strokeThickness: 3 
            }).setOrigin(0.5);
        }, null, this);
    }
    
}
