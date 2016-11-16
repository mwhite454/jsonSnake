grid = new Grid();
snake = new Snake();
food = new Food();
scoreBoard = new ScoreBoard();
game = new Game();
var fr = 5;
var score = 0;
var myCanvas;




function setup() {
  grid.borderColor = color(129, 247, 132);
  grid.borderStroke = 1;
  grid.edgeFlash1 = color(214, 226, 81);
  grid.edgeFlash2 = color(129, 247, 132);
  grid.edgeDeadSnake = color(133, 28, 50);
  snake.stripe1 = color(200, 200, 200);
  snake.stripe2 = color(180, 180, 180);
  frameRate(fr);
  restart();
  myCanvas = createCanvas(grid.width, grid.height+100);
  grid.buildGrid();
  food.pickLocation();
}

function draw() {
  background(65, 65, 65);
  grid.show();
  food.show();
  frameRate(fr);
  if(!game.isPaused){
    if(!snake.isDead){
      scoreBoard.update();
      snake.update();
      snake.show();
    } else {
      showDeath();
    }
  }

  scoreBoard.show();

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ScoreBoard(){
  this.scoreMsg = "SCORE: ";
  this.lvlMsg = "LEVEL: ";
  this.scoreBoardMsg = "";
  this.x = 0;
  this.y = grid.height;
  this.update = function(){
    this.scoreBoardMsg = this.scoreMsg + score + '\n' + this.lvlMsg + snake.lvl + '\n' + 'Frame Rate: ' + fr;
  };
  this.show = function(){
    fill(65, 65, 65);
    stroke(129, 247, 132);
    strokeWeight(5);
    rect(this.x, this.y, grid.width, grid.height);
    // score mesage display
    textSize(12);
    noStroke();
    fill(255);
    text(this.scoreBoardMsg, this.x + 15, this.y + 15);
  };

}

function showDeath() {
  this.x = floor(grid.width/6);
  this.y = floor(grid.height/6);
  fill(65, 65, 65);
  stroke(129, 247, 132);
  strokeWeight(5);
  rect(this.x, this.y, this.x*4, this.y*4);
  //image(deathImg, this.x + 100, this.y + 100);
  noStroke();
  textSize(14);
  fill(129, 247, 132);
  text("You Have Died. Your Final Score Was: " + score + "\nPress Space to begin again.", this.x + 20, this.y + 20);
  noLoop();
}

function Game(){
  this.isPaused = false;
  this.frRate = 5;
  this.pause = function(){
    this.isPaused = true;
  };
  this.unPause = function(){
    this.isPaused = false;
  }
}

function restart() {
  score = 0;
  fr = 5;
  snake.tail = 0;
  snake.currentColumn = 2;
  snake.currentRow = 2;
  snake.dir = 2;
  snake.speed = 1;
  snake.isDead = false;
}

function keyPressed(){
  if(keyCode == LEFT_ARROW){
    snake.dir = 1;
    snake.speed = 1;

  } else if (keyCode == RIGHT_ARROW){
    snake.dir = 2;
    snake.speed = 1;
  }else if (keyCode == UP_ARROW){
    snake.dir = 3;
    snake.speed = 1;
  }else if (keyCode == DOWN_ARROW){
    snake.dir = 4;
    snake.speed = 1;
  } else if (keyCode == 32 && snake.isDead === true){
    restart();
  } else if (keyCode == 32 && snake.isDead === false && game.isPaused === false){
    game.pause();
  } else if (keyCode == 32 && snake.isDead === false && game.isPaused === true){
    game.unPause();
  }
  console.log('key pressed, direction now: ' + snake.dir);
}


function Snake(){
  this.x = 0;
  this.y = 0;
  this.currentColumn = 2;
  this.currentRow = 2;
  this.speed = 1;
  this.dir = 2;
  this.snakeSize = 20;
  this.tail = 0;
  this.isDead = false;
  this.lvl = 1;
  this.stripe1,
  this.stripe2,
  this.snakeSteer = function(){

  };

  this.update = function(){
    if(this.dir==1){
      this.currentColumn = this.currentColumn - this.speed;
    } else if(this.dir==2){
      this.currentColumn = this.currentColumn + this.speed;
    }else if(this.dir==3){
      this.currentRow = this.currentRow - this.speed;
    }else if(this.dir==4){
      this.currentRow = this.currentRow + this.speed;
    }
  };
  this.show = function(){
    var coName = this.currentColumn + "-" + this.currentRow;
    for(var i=0; i<grid.blockCount; i++){
      if(grid.coordinates[i].name == coName){
        this.x = grid.coordinates[i].x;
        this.y = grid.coordinates[i].y;
//check if we are eating, running over ourself or running into edge
        if(grid.coordinates[i].hasFood===true){
          this.eat(i);
          console.log(grid.coordinates[i]);
        } else if(grid.coordinates[i].isEdge===true){
          this.die();
          console.log(grid.coordinates[i]);
        } else if(grid.coordinates[i].hasSnake===true){
          this.die();
          console.log(grid.coordinates[i]);
        }
//if you haven't died, keep on trucking and grow tail if you ate.
        if(this.tail>0){
          grid.coordinates[i].hasSnake = true;
          grid.coordinates[i].snakeCountDown = this.tail;
        }

        break;
      }
    }
    fill(255);
    rect(this.x, this.y, this.snakeSize, this.snakeSize);
  };

  this.eat = function(i){
    score+= 1;
    this.tail+= 1;
    food.pickLocation();
    this.levelUp();
    grid.coordinates[i].hasFood = false;
    grid.coordinates[i].hasSnake = true;
    grid.coordinates[i].snakeCountDown = this.tail;
  };
  this.die = function(){
    this.speed = 0;
    this.isDead = true;
  }
  this.levelUp = function(){
    this.oldLvl = this.lvl;
    this.lvl = (floor(this.tail/10));
    if(this.lvl > this.oldLvl){
      fr = fr + this.lvl;
      frameRate(fr);
    }

  }

}

function Grid() {
  // basic form
  this.width = 600;
  this.height = 600;
  this.blockSize = 20;
  this.showBorder = false;
  this.showCoordinates = false;
  this.columnCount = this.width / this.blockSize;
  this.rowCount = this.height / this.blockSize;
  this.coordinates = [];
  this.blockCount = 0;
  // visual component styles
  this.borderColor,
  this.borderStroke,
  this.edgeFlash1,
  this.edgeFlash2,
  this.edgeDeadSnake,
  this.buildGrid = function(){
    for(var i=1; i<=this.rowCount; i++){
      for(var j=1; j<=this.columnCount; j++){
        var block = {};
        block.name = j + "-" + i;
        block.column = j;
        block.row = i;
        block.hasFood = false;
        block.hasSnake = false;
        block.snakeCountDown = 0;
        if(i===1 || i===this.rowCount || j===1 || j===this.columnCount){
            block.isEdge = true;
          }else{
            block.isEdge = false;
          };
        block.isEdge
        block.x = (j * this.blockSize) - this.blockSize;
        block.y = (i * this.blockSize) - this.blockSize;
        this.coordinates.push(block);
      }
    }
    this.blockCount = this.coordinates.length;
  };
  this.show = function(){
    for(var i=0; i<this.blockCount; i++){
      if(this.showBorder === true){
        stroke(this.borderColor);
        strokeWeight(this.borderStroke);
      } else {
        noStroke
      }

      if(this.coordinates[i].isEdge === true){
        if(snake.isDead){
          fill(this.edgeDeadSnake);
          this.coordinates[i].hasSnake = false;
          this.coordinates[i].hasFood = false;
        } else {
          if(frameCount%2 == 0) {
            fill(this.edgeFlash1);
          } else {
            fill(this.edgeFlash2);
          }
        }
      } else {
        if(this.coordinates[i].hasSnake === true){
          if(this.coordinates[i].snakeCountDown%2 == 0){
            fill(snake.stripe1);
          } else {
            fill(snake.stripe2);
          }

          this.coordinates[i].snakeCountDown-=1;
          if(this.coordinates[i].snakeCountDown == 0){
            this.coordinates[i].hasSnake = false;
          }
        } else {
          noFill();
        }

      }
      rect(this.coordinates[i].x, this.coordinates[i].y, this.blockSize, this.blockSize);
      if(this.showCoordinates===true){
        noStroke();
        fill(this.borderColor);
        textSize(6);
        text(this.coordinates[i].name, this.coordinates[i].x + 2, this.coordinates[i].y + 10);
      }
    }
  };
  this.update = function(){
    for(var i=0; i<this.blockCount; i++){
      if(this.showBorder === true){
        stroke(129, 247, 132);
        strokeWeight(1);
      }

      if(this.coordinates[i].isEdge === true){
        if(snake.isDead){
          fill(133, 28, 50);
          this.coordinates[i].hasSnake = false;
          this.coordinates[i].hasFood = false;
        } else {
          if(frameCount%2 == 0) {
            fill(129, 247, 132);
          } else {
            fill(214, 226, 81);
          }
        }
      } else {
        if(this.coordinates[i].hasSnake === true){
          if(this.coordinates[i].snakeCountDown%2 == 0){
            fill(200, 200, 200);
          } else {
            fill(220, 220, 220);
          }

          this.coordinates[i].snakeCountDown-=1;
          if(this.coordinates[i].snakeCountDown == 0){
            this.coordinates[i].hasSnake = false;
          }
        } else {
          noFill();
        }

      }
      rect(this.coordinates[i].x, this.coordinates[i].y, this.blockSize, this.blockSize);
      if(this.showCoordinates===true){
        noStroke();
        fill(100, 100, 100);
        textSize(6);
        text(this.coordinates[i].name, this.coordinates[i].x + 2, this.coordinates[i].y + 10);
      }
    }
  }
}

function Food(){
  this.currentRow = 0;
  this.currentColumn = 0;
  this.pickLocation = function(){
    this.currentRow = getRandomInt(2, grid.rowCount - 1);
    this.currentColumn = getRandomInt(2, grid.columnCount - 1);
  };
  this.show = function(){
    var coName = this.currentColumn + "-" + this.currentRow;
    for(var i=0; i<grid.blockCount; i++){
      if(grid.coordinates[i].name == coName){
        this.x = grid.coordinates[i].x;
        this.y = grid.coordinates[i].y;
        if(!grid.coordinates[i].hasSnake){
          grid.coordinates[i].hasFood = true;
          break;
        } else {
          i = 1;
          this.pickLocation();
          coName = this.currentColumn + "-" + this.currentRow;
        }

      }
    }
    fill(99, 213, 238);
    rect(this.x, this.y, snake.snakeSize, snake.snakeSize);
  };
}
