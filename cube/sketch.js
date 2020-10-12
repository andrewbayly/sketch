/**
TODO: 
1. rounded corners for cubie faces.
2. don't show inner faces - show black instead. - DONE!
3. create Move sequence which can execute a sequence of moves. - DONE!
4. solving the cube - DONE!

- show the cube  DONE!
- enable moves on the cube
  - faces - DONE
  - slices 

Note: currently, makeMove will take the global value of slice, but we want to also 
      allow that we specify the slice value to makeMove - some further thinking needed here.
      
use cases: 
  1. push one of the buttons - this makes a move with the global value of slice
  2. call the function with just 'f' - this makes the move with a slice value of 0
  3. call the function with 'f2' - this splits out the slice value      

- solve(3)
  - fix makeMoves - DONE!
  - solve needs to orient the faces first before it does anything else! - DONE!
  - fix reverse - DONE!
  
- scramble(general case) - DONE!
  - scramble needs to get the max slice and do random slices as well as faces
  
- solve(general case)

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


/**
 k is either 1 character or 2
**/
function makeMove(k){ 
  if(k.length == 1)
    k += '0'; 

  var m = k.charAt(0); 
  var s = k.charAt(1) - 0; 

  if(m in moveMap){ 
    var mv = moveMap[m].copy(); 
    mv.slice = s ;    
    moveQueue.unshift(mv); 
  }
}

function selectMove(k){ 
  makeMove( k + slice )
}

function mixUp(){ 
  var keys = []; 
  for(var k in moveMap){ 
    keys.push(k);  
  }
  
  var s = maxSlice() + 1 ; 
    
  for(var i = 0; i < 30; i++){ 
    makeMove(random(keys) + random(s));   
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

  createUI(); 
  
  initCube(); 
  
  easycam = createEasyCam();
  
  solver = new Solver(); 
}

function initCube() { 
  
  cubes = []; 
  
  var step = 2 / ( cubeSize - 1 ) 
  
  for(var x = -1; x <= 1; x += step ){ 
    for(var y = -1; y <= 1; y += step){ 
      for(var z = -1; z <= 1; z += step){ 
        if( matchValue(abs(x), 1) || matchValue(abs(y), 1) || matchValue(abs(z), 1)) { 
          var qb = new Cubie(x, y, z); 
          cubes.push(qb); 
        }
      }
    }
  }
}

function createUI(){ 
  button = createButton('Scramble');
  button.size(75,22);
  button.position(20, 20);
  button.mousePressed(function () {
    mixUp();
  });

  button = createButton('Solve');
  button.size(75,22);
  button.position(110, 20);
  button.mousePressed(function () {
    solver.solve();
  });


  var posY = 70; 
  var posX = 20; 
  var spacingY = 30; 

  createSideButton('Front(CC)', 'f', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Back(CC)', 'b', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Left(CC)', 'l', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Right(CC)', 'r', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Up(CC)', 'u', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Down(CC)', 'd', posX, posY); 
  posY += spacingY; 

  posY = 70; 
  posX = 110; 

  createSideButton('Front(C)', 'F', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Back(C)', 'B', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Left(C)', 'L', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Right(C)', 'R', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Up(C)', 'U', posX, posY); 
  posY += spacingY; 
  
  createSideButton('Down(C)', 'D', posX, posY); 
  posY += spacingY; 
  
  //size selector
  cubeSize = 3; 
  selectSize = createSelect();
  selectSize.position(200, 20);
  selectSize.size(35, 22);
  for(var s = 2; s <= 9; s++) { 
    selectSize.option(s);
  }  
  selectSize.selected(cubeSize);
  selectSize.changed(selectSizeEvent);

  createSliceSelector(1); 

}

function createSliceSelector(sliceMax){ 
  //slice selector
  slice = 0; 
  selectSlice = createSelect();
  selectSlice.position(200, 70);
  selectSlice.size(35, 22);
  for(var s = 0; s <= sliceMax; s++){ 
    selectSlice.option(s);
  }
  selectSlice.selected(slice);
  selectSlice.changed(selectSliceEvent);
}

function maxSlice(){ 
  return floor((cubeSize - 1) / 2) ; 
}

function selectSizeEvent() { 
  cubeSize = selectSize.value() - 0; 
  createSliceSelector(maxSlice()); 
  //alert('select size ' + size) 
  initCube(); 
  
}

function selectSliceEvent() { 
  slice = selectSlice.value() - 0; 
  //alert('select slice ' + slice) 
}

function createSideButton(label, move, posX, posY){ 
  button = createButton(label);
  button.size(75,22);
  button.position(posX, posY);
  button.mousePressed((function (m) {
    selectMove(m); 
  }).bind(null, move));
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
      if( matchValue(abs(move.z), 1) &&  matchValue(cubes[i].pos.z, level(move.z, move.slice) )) { 
        rotateZ(move.angle);    
      } else if(matchValue(abs(move.x), 1) &&  matchValue(cubes[i].pos.x, level(move.x, move.slice) )) { 
        rotateX(move.angle);    
      } else if(matchValue(abs(move.y), 1) &&  matchValue(cubes[i].pos.y, level(move.y, move.slice) )) { 
        rotateY(move.angle);    
      }
    }  
    
    cubes[i].draw();
    pop(); 
  }
}

function turnZ(level, dir){ 
  for(var i = 0; i < cubes.length; i++){ 
    if(matchValue(cubes[i].pos.z, level)){
      cubes[i].turnZ(dir); 
    }
  }
}

function turnY(level, dir){ 
  for(var i = 0; i < cubes.length; i++){ 
    if(matchValue(cubes[i].pos.y, level)){
      cubes[i].turnY(dir); 
    }
  }
}

function turnX(level, dir){ 
  for(var i = 0; i < cubes.length; i++){ 
    if(matchValue(cubes[i].pos.x, level)){
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
      if((na[i] != 0) && (! matchValue(na[i], pa[i])))
        return false; 
    }
    
    return true ; 
  }
  
}

function matchValue(a, b) { 
  return Math.abs(a - b) < 0.01; 
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
      if(normals[j].matchValue(face.normal))
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
  
  var f = 2 / ( cubeSize - 1 )  ; 
  
  box(0.999 * f);
  
  for(var i = 0; i < this.faces.length ; i++){ 
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
  var f = 2 / ( cubeSize - 1 )  ; 

  push(); 
  fill(this.color); 

  var n = this.normal.copy();
  n.mult(0.5 * f); 

  translate(n); 

  if(abs(this.normal.x) > 0.5)
    rotateY(HALF_PI); 
  else if(abs(this.normal.y) > 0.5)
    rotateX(HALF_PI);
  
  
  square(-0.45 * f, -0.45 * f, 0.9 * f); 
  
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

p5.Vector.prototype.matchValue = function(b){ 
  return ( matchValue(this.x, b.x) && matchValue(this.y, b.y) &&  matchValue(this.z, b.z) )
}

p5.Vector.prototype.rotateZ = function(angle){ 
  var x = this.x; 
  var y = this.y;
  
  var st = Math.sin(angle); 
  var ct = Math.cos(angle);
  
  this.x = x * ct - y * st ; 
  this.y = x * st + y * ct ; 
}

p5.Vector.prototype.rotateY = function(angle){ 
  var z = this.z; 
  var x = this.x;
  
  var st = Math.sin(angle); 
  var ct = Math.cos(angle);
  
  this.z = z * ct - x * st ; 
  this.x = z * st + x * ct ; 
}

p5.Vector.prototype.rotateX = function(angle){ 
  var y = this.y; 
  var z = this.z;
  
  var st = Math.sin(angle); 
  var ct = Math.cos(angle);
  
  this.y = y * ct - z * st ; 
  this.z = y * st + z * ct ; 
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
  this.slice = 0; 
}

Move.prototype.copy = function(){ 
  var m = new Move(this.x, this.y, this.z, this.dir); 
  return m; 
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
        turnZ(level(this.z, this.slice), this.dir);
      } else if(abs(this.x) > 0){ 
        turnX(level(this.x, this.slice), this.dir);
      } else if(abs(this.y) > 0){ 
        turnY(level(this.y, this.slice), this.dir);
      }
      
      //var elapsed = new Date() - this.startTime ; 
      //console.log(elapsed); 
    }
  }
}

function level(axis, slice){ 
  var step = (2 / (cubeSize - 1)) * slice ; 
  
  step = step * ( (axis == 1) ? -1 : 1 ) ; 
    
  return axis + step ;  
}


