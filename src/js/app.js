require('../css/style.css')

let tiles = 35; // number of rows and columns of the grid

// get canvas properties
// gWidth: dimension of every tile
let canvas = document.getElementById('canvas'),
         c = canvas.getContext('2d'),
   cWidth  = canvas.width,
   gWidth = cWidth/tiles;

let score = document.getElementById('score');
let combo = document.getElementById('combo');

let dir = [
 {x : -1, y :  0, opp: 'r'},
 {x :  0, y : -1, opp: 'd'},
 {x :  1, y :  0, opp: 'l'},
 {x :  0, y :  1, opp: 'u'}
]

const colors = ['rgba(45,168,137,1)',
                'rgba(44,166,15,1)',
                'rgba(5,12,66,1)',
                'rgba(2,132,168,1)',
                'rgba(2,190,196,1)',
                'rgba(169,232,220,1)',
                'rgba(225,247,231,1)',
                'rgba(166,4,30,1)',
                'rgba(242,8,69,1)',
                'rgba(255,188,103,1)'
]

let snake = [];
let player;
let food;
let comboTimer;
let colorSelect;
let moved;

/**
* @params: e: event
* @params: moved: boolean | monitors if the snkaes has moved and avoids bumping
* of snake[0] and snake[2]. For example, it is possible to press the right and
* down buttons in succession at very small amount of time (the snake has not moved yet).
**/

window.addEventListener('keydown', (e) => {
  // left->tiop->right->bottom: 37->38->39->40
  let opposite = snake[0].way.opp;
  if (moved) {
    switch (e.keyCode) {
      case 37:
        if (opposite !== 'l') { // avoids turning to the opposite direction
          snake[0].way = dir[0];
        }
        break;
      case 38:
        if (opposite !== 'u') {
          snake[0].way = dir[1];
        }
        break;
      case 39:
        if (opposite !== 'r') {
          snake[0].way = dir[2];
        }
        break;
      case 40:
        if (opposite !== 'd') {
          snake[0].way = dir[3];
        }
        break;
    }
    moved = false;
  }
})

let animate = () => {
  setTimeout( () => {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, cWidth, cWidth);

    // moves each block
    for (let i = 0; i < snake.length; i++) {
      snake[i].draw();
    }

    // updates direction of every block
    for (let i = 1; i < snake.length; i++) {
      snake[snake.length - i].way = snake[snake.length - (i + 1)].way;
    }

    food.draw();
    moved = true; // flag that the snake has moved and ready to change direction

    // check collision between head (snake[0]) and its body
    for (let i = 1; i < snake.length; i++) {
      if (touch(snake[0], snake[i]) && snake[0].x + snake[i].x !== 0 && snake[0].y + snake[i].y !== 0) {
        init();
      }
    }

    /**
    * @params food: object | Food
    * @params snake[0]: objeck | Head
    * checks collision with food
    **/
    if (touch(food, snake[0])) {
      //
      const audio = document.querySelector('.audio');
      audio.currentTime = 0;
      audio.play();

      // update properties
      snake[0].isHead = false;
      food.isFood = false;

      snake.unshift(food); // insert the 'food' as new head

      // update directions
      food.way = snake[1].way;
      food.x += snake[0].s*snake[0].way.x;
      food.y += snake[0].s*snake[0].way.y;

      // update score
      player.score += 1;
      score.innerHTML = player.score;


      resolveBorder(food); // avoids bug when the food is spawned at the border

      snake[0].isHead = true; // update property

      // set loc for new food
      let loc =  {
        x: gWidth*random(0, tiles-1),
        y: gWidth*random(0, tiles-1)
      };

      // avoid spawning on snake's surface
      for(let i = 0; i < snake.length; i++) {
        if (touch(loc, snake[i])) {
          loc.x = gWidth*random(0, tiles-1);
          loc.y = gWidth*random(0, tiles-1);
          i = -1; // reset loop
        }
      }

      // spawn new food
      food = new Food(loc.x, loc.y, gWidth, {x : 0, y : 0}, true);
    }
  }, 1000/20);
}

let init = () => {
  player = new Player(0);
  score.innerHTML = player.score;
  snake = [];
  colorSelect = random(0, colors.length);

  // initital properties
  let init_dir = dir[random(0, 3)];
  let init_loc = {
    x: gWidth*random(0, tiles-1),
    y: gWidth*random(0, tiles-1)
  };

  // spawn head
  snake.push(new Food(init_loc.x, init_loc.y, gWidth, init_dir, false));
  snake[0].isHead = true;

  food =  new Food(gWidth*random(0, tiles-1), gWidth*random(0, tiles-1),
                       gWidth, {x : 0, y : 0}, true);
}

let random = (min, max) => {
  return Math.floor(Math.random()* (max - min) + min);
}

// resolve collision with border
let resolveBorder = (obj) => {
  if(obj.x > cWidth - gWidth) {
    obj.x = 0;
  } else if(obj.x < 0) {
    obj.x = gWidth*(tiles-1);
  } else if(obj.y > cWidth - gWidth) {
    obj.y = 0;
  } else if(obj.y < 0) {
    obj.y = gWidth*(tiles-1);
  }
}

let touch = (obj1, obj2) => {
  return (obj1.x === obj2.x && obj1.y === obj2.y);
}


class Player {
  constructor (score) {
    this.score = score;
  }
}

class Food {
  constructor(x, y, s, way, isFood) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.way = way;
    this.isFood = isFood;
    this.isHead = false;
    this.color = colors[colorSelect];
  }

  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    if (this.isFood) {
      c.fillStyle = 'rgba(191,182,27,1)';
    }
    if (this.isHead) {
      c.fillStyle = 'rgba(52,72,4,1)';
    }
    c.strokeStyle = 'black';
    c.strokeRect(this.x, this.y, this.s, this.s);
    c.fillRect(this.x, this.y, this.s, this.s);
    this.update();
  }

  update() {
    this.x += this.s*this.way.x;
    this.y += this.s*this.way.y;
    resolveBorder(this);
  }
}

/**PROGRAM FLOW**/
init();
animate();
