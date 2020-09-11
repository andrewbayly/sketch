/**
TODO: 
1. rounded corners for cubie faces.
2. don't show inner faces - show black instead. - DONE!
3. create Move sequence which can execute a sequence of moves.
4. solving the cube

**/

var cubes = []; 
var easycam;  
var SIZE = 50; 

var move = null ; //the current move
var moveQueue = []; 

var solver; 

/***
lowercase : counter-clockwise
uppercase : clockwise
  - as seen when rotating face
***/
var moveMap = { 
  'f' : new Move(0, 0, 1, -1), 
  'F' : new Move(0, 0, 1, 1),
  'B' : new Move(0, 0, -1, -1), 
  'b' : new Move(0, 0, -1, 1), 
  'd' : new Move(0, 1, 0, -1), 
  'D' : new Move(0, 1, 0, 1), 
  'U' : new Move(0, -1, 0, -1), 
  'u' : new Move(0, -1, 0, 1), 
  'r' : new Move(1, 0, 0, -1), 
  'R' : new Move(1, 0, 0, 1), 
  'L' : new Move(-1, 0, 0, -1), 
  'l' : new Move(-1, 0, 0, 1)
}

/*
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
*/

function makeMove(k){ 
  if(k in moveMap){ 
    moveQueue.unshift(moveMap[k]); 
    //move = moveMap[k];
    //move.start();
  }
}

function mixUp(){ 
  var keys = []; 
  for(var k in moveMap){ 
    keys.push(k);  
  }
  
  for(var i = 0; i < 30; i++){ 
    makeMove(random(keys));   
  }
}

var normals = [ 
  new p5.Vector(0, 0, 1),   //F
  new p5.Vector(0, 0, -1),  //B
  new p5.Vector(0, 1, 0),   //D
  new p5.Vector(0, -1, 0),  //U
  new p5.Vector(1, 0, 0),   //R
  new p5.Vector(-1, 0, 0),  //L
]

var faceList = [ 'F', 'B', 'D', 'U', 'R', 'L' ] ; 

/*
const U = 0; 
const D = 1; 
const L = 2; 
const R = 3; 
const F = 4; 
const B = 5; 
*/

const colors = [
  '#FFFFFF', //white  0
  '#FFFF00', //yellow 1
  '#FFA500', //orange 2
  '#FF0000', //red    3  
  '#00FF00', //green  4 
  '#0000FF'  //blue   5
];
  
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  for(var x = -1; x <= 1; x++){ 
    for(var y = -1; y <= 1; y++){ 
      for(var z = -1; z <= 1; z++){ 
        var qb = new Cubie(x, y, z); 
        cubes.push(qb); 
      }
    }
  }
  
  easycam = createEasyCam();
  
  solver = new Solver(); 
  
//  move = new Move(0, 0, 1, -1); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  
  if(move == null || (move.animating == false)){ 
    if(moveQueue.length > 0){ 
      move = moveQueue.pop(); 
      move.start(); 
    } else if(solver.solving){ 
      solver.step();  
    }
  }
  
  if(move != null){ 
    move.update();
  }  
  
  for(var i = 0; i < cubes.length; i++){ 
    push(); 
    
    if(move != null){ 
      if(abs(cubes[i].pos.z) > 0 && cubes[i].pos.z == move.z) { 
        rotateZ(move.angle);    
      } else if(abs(cubes[i].pos.x) > 0 && cubes[i].pos.x == move.x) { 
        rotateX(move.angle);    
      } else if(abs(cubes[i].pos.y) > 0 && cubes[i].pos.y == move.y) { 
        rotateY(move.angle);    
      }
    }  
    
    cubes[i].draw();
    pop(); 
  }
}

function turnZ(level, dir){ 
  for(var i = 0; i < cubes.length; i++){ 
    if(cubes[i].pos.z == level){
      cubes[i].turnZ(dir); 
    }
  }
}

function turnY(level, dir){ 
  for(var i = 0; i < cubes.length; i++){ 
    if(cubes[i].pos.y == level){
      cubes[i].turnY(dir); 
    }
  }
}

function turnX(level, dir){ 
  for(var i = 0; i < cubes.length; i++){ 
    if(cubes[i].pos.x == level){
      cubes[i].turnX(dir); 
    }
  }
}

function keyTyped() {
  if(key in moveMap){ 
    makeMove(key);   
  } else if(key == ' '){ 
    makeMove('f');  
    makeMove('u');  
  } else if(key == 's'){
    solver.solve(); 
  } else if(key == 'm'){
    mixUp(); 
  }
}


/******************************************************************************************
Cubie
******************************************************************************************/

function Cubie(x, y, z){ 
  this.pos = createVector(x, y, z) ; 
  this.faces = []; 
  
  this.colors = []; 
    
  for(var i = 0; i < 6; i++){
    if(match(normals[i], this.pos)){ 
      this.colors.push(i); 
      this.faces.push(new Face(colors[i], normals[i].copy(), i));
    }
  }
  
  this.colors.sort(); 
  this.colors = this.colors.join(''); 

  function match(n, p){ 
    var na = [n.x, n.y, n.z]; 
    var pa = [p.x, p.y, p.z]; 
  
    for(var i = 0; i < na.length; i++){ 
      if((na[i] != 0) && (na[i] != pa[i]))
        return false; 
    }
    
    return true ; 
  }
}

Cubie.prototype.getFaces = function(colors){ 
  var result = ''; 
  
  for(var i = 0; i < colors.length; i++){ 
    var colorIndex = colors.charAt(i) - 0; 
    
    //find the face that matches this color index
    var face = null;
    for(var j = 0; j < this.faces.length; j++){ 
      face = this.faces[j]; 
      if(face.i == colorIndex)
        break; 
    }
    
    for(var j = 0; j < normals.length; j++){ 
      if(normals[j].equals(face.normal))
        break; 
    }
    
    result += faceList[j]; 
  }
  
  return result; 
}

Cubie.prototype.turnZ = function(dir){
  this.pos.rotateZ(dir * HALF_PI); 
  for(var i = 0; i < this.faces.length; i++){ 
    this.faces[i].turnZ(dir);   
  }
}

Cubie.prototype.turnY = function(dir){
  this.pos.rotateY(dir * HALF_PI); 
  for(var i = 0; i < this.faces.length; i++){ 
    this.faces[i].turnY(dir);   
  }
}

Cubie.prototype.turnX = function(dir){
  this.pos.rotateX(dir * HALF_PI); 
  for(var i = 0; i < this.faces.length; i++){ 
    this.faces[i].turnX(dir);   
  }
}

Cubie.prototype.draw = function(){
  
  push(); 
  scale(50); 
  translate(this.pos);
  //translate(this.pos);
  fill(0); 
  box(0.999);
  
  for(var i = 0; i < this.faces.length; i++){ 
    this.faces[i].draw();  
  }
  
  pop();
}

/******************************************************************************************
Face
******************************************************************************************/

function Face(color, normal, i){ 
  this.color = color ; 
  this.normal = normal;
  this.i = i; 
}

Face.prototype.draw = function(){ 
  push(); 
  fill(this.color); 

  var n = this.normal.copy();
  n.mult(0.5); 

  translate(n); 

  if(abs(this.normal.x) > 0.5)
    rotateY(HALF_PI); 
  else if(abs(this.normal.y) > 0.5)
    rotateX(HALF_PI);
  
  square(-0.45, -0.45, 0.9); 
  
  pop(); 
}

Face.prototype.turnZ = function(dir){
  this.normal.rotateZ(dir * HALF_PI);  
}

Face.prototype.turnY = function(dir){
  this.normal.rotateY(dir * HALF_PI);  
}

Face.prototype.turnX = function(dir){
  this.normal.rotateX(dir * HALF_PI);  
}

/******************************************************************************************
Vector
******************************************************************************************/

p5.Vector.prototype.rotateZ = function(angle){ 
  var x = this.x; 
  var y = this.y;
  
  var st = Math.sin(angle); 
  var ct = Math.cos(angle);
  
  this.x = Math.round(x * ct - y * st) ; 
  this.y = Math.round(x * st + y * ct) ; 
}

p5.Vector.prototype.rotateY = function(angle){ 
  var z = this.z; 
  var x = this.x;
  
  var st = Math.sin(angle); 
  var ct = Math.cos(angle);
  
  this.z = Math.round(z * ct - x * st) ; 
  this.x = Math.round(z * st + x * ct) ; 
}

p5.Vector.prototype.rotateX = function(angle){ 
  var y = this.y; 
  var z = this.z;
  
  var st = Math.sin(angle); 
  var ct = Math.cos(angle);
  
  this.y = Math.round(y * ct - z * st) ; 
  this.z = Math.round(y * st + z * ct) ; 
}

/******************************************************************************************
Move
******************************************************************************************/

function Move(x, y, z, dir){ 
  this.x = x ; 
  this.y = y ;
  this.z = z ; 
  this.dir = dir; 
  this.angle = 0; 
  this.animating = false; 
}

Move.prototype.start = function(){ 
  this.animating = true; 
  //this.startTime = new Date(); 
}

Move.prototype.update = function(){ 
  if(this.animating){ 
    this.angle += this.dir * 0.1 ; 
    //this.angle += this.dir * HALF_PI ; 
    
    if(Math.abs(this.angle) >= HALF_PI){ 
      this.angle = 0; 
      this.animating = false ; 
      
      if(abs(this.z) > 0){ 
        turnZ(this.z, this.dir);
      } else if(abs(this.x) > 0){ 
        turnX(this.x, this.dir);
      } else if(abs(this.y) > 0){ 
        turnY(this.y, this.dir);
      }
      
      //var elapsed = new Date() - this.startTime ; 
      //console.log(elapsed); 
    }
  }
}


