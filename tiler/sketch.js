/**
 Tiler
 TODO: 
   - shapeMode
     - drawing in shapeMode - DONE!
     - save/load originalTile & shapeMode - DONE!
     - mouseClick in shapeMode - DONE!
   - delete button
   - move canvas to the right and expand x-dir so it's really a landscape view
**/


function setup() {
  SIZE = 1000; 
  zoomFactor = 10
  offsetPosition = createVector(500, 500)
  shapeMode = true
  
  originalTile = []
  
  colorTable = [
    '#CCFFFF', 
    '#FFFF33', 
    '#CCCC33', 
    '#CCCCFF', 
    '#FFCCFF', 
    '#FFCC66',
    '#CC6633', 
    '#FF6666',
    '#660099',
    '#666600', 
  ]
  
  tiles = [new Tile(false, 0, createVector(0, 0), 0)]
  selected = -1
  
  createCanvas(SIZE, SIZE);
  frameRate(25);
  colorMode(HSB);
}

function draw() {
  background(255)
  drawGrid()

  if(shapeMode){ 
    var pos = []
    for(var i = 0; i < originalTile.length; i++){ 
      pos.push(createVector(originalTile[i].x, originalTile[i].y))
    }
  
    for(var i = 0; i < pos.length; i++){
      pos[i] = gridToScreen(pos[i])
    } 
    
    for(var i = 0; i < pos.length; i++){
      strokeWeight(5) 
      point(pos[i])
    } 
    for(var i = 0; i < pos.length-1; i++){ 
      strokeWeight(3)
      line(pos[i].x, pos[i].y, pos[i+1].x, pos[i+1].y)
    }
  } 
  else{  
    for(var i = 0; i < tiles.length; i++){ 
      tiles[i].draw(i == selected)
    }
  }
}  

function doSave(){ 
  console.log('saving...')
  var image = {tiles:[]}
  for(var i = 0; i < tiles.length; i++){ 
    image.tiles.push(tiles[i].toObj())
  }
  image.selected = selected
  
  image.originalTile = []
  for(var i = 0; i < originalTile.length; i++){ 
    image.originalTile.push([originalTile[i].x, originalTile[i].y])
  }
  image.shapeMode = shapeMode
  
  SAVE(image)
}

function LOAD(obj){ 
  //console.log(obj)
  
  selected = obj.selected
  
  tiles = []
  for(var i = 0; i < obj.tiles.length; i++){ 
    var t = new Tile()
    t.fromObj(obj.tiles[i])
    tiles.push(t)
  }
  
  shapeMode = obj.shapeMode
  originalTile = []
  for(var i = 0; i < obj.originalTile.length; i++){ 
    originalTile.push(createVector(obj.originalTile[i][0], obj.originalTile[i][1]))
  }
  console.log(originalTile)
}

function SAVE(obj){ 
  console.log('LOAD(' + JSON.stringify(obj) + ')' )
}

function drawGrid(){
  var max = 30
  
  strokeWeight(3)
   
  for(var x = -max; x <= max; x++){ 
    for(var y = -max; y <= max; y++){ 
      var pos = gridToScreen(createVector(x, y))
      //pos.mult(zoomFactor)
      //pos = p5.Vector.add(pos, offsetPosition)
      point(pos)
    }
  }
  
  strokeWeight(5)
  point(gridToScreen(createVector(0,0)))
}

function zoomIn(){ 
  zoomFactor += 5
}

function zoomOut(){ 
  if(zoomFactor >= 10)
    zoomFactor -= 5
}

function rotateClockwise(){
  if(selected >= 0) 
    tiles[selected].rotation++ 
}

function rotateCounterClockwise(){ 
  if(selected >= 0) 
    tiles[selected].rotation-- 
}

function left(){ 
  if(selected >= 0) 
    tiles[selected].position.x --
}

function right(){ 
  if(selected >= 0) 
    tiles[selected].position.x ++
}

function up(){ 
  if(selected >= 0) 
    tiles[selected].position.y --
}

function down(){ 
  if(selected >= 0) 
    tiles[selected].position.y ++
}

function flip(){ 
  if(selected >= 0) 
    tiles[selected].reflected = ! tiles[selected].reflected 
}

function clone(){ 
  if(selected >= 0) { 
    tiles.push(tiles[selected].copy())
    selected = tiles.length-1  
  } 
}

function doDelete(){ 
  if(selected >= 0) { 
    tiles.splice(selected, 1)
    selected = -1  
  } 
}

function num(k){ 
  if(selected >= 0) { 
    tiles[selected].color = k
  } 
}

function mouseClicked() {
  var pos = screenToGrid( createVector(mouseX, mouseY) )
  
  if(shapeMode){ 
    if(originalTile.length > 0 && originalTile[0].equals(pos)){ 
      shapeMode = false
    }
    else { 
      originalTile.push(pos)     
    }
  }
  else { 
    selected = -1
    for(var i = 0; i < tiles.length; i++){ 
      if(tiles[i].position.equals(pos)){ 
        selected = i; 
      }
    }
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    left()
  } else if (keyCode === RIGHT_ARROW) {
    right()
  } else if (keyCode === UP_ARROW) {
    up()
  } else if (keyCode === DOWN_ARROW) {
    down()
  } else if (key === 'z') {
    zoomIn()
  } else if (key === 'Z') {
    zoomOut()
  } else if (key === 'R') {
    rotateClockwise()
  } else if (key === 'r') {
    rotateCounterClockwise()
  } else if (key === 'f') {
    flip()
  } else if (key === 'c') {
    clone()
  } else if (key === 's') {
    doSave()
  } else if (key === 'd') {
    doDelete()
  } else if (!isNaN(key-0)){
    num(key-0)
  }
}

function Tile(reflected, rotation, position, color){ 
  this.reflected = reflected
  this.rotation = rotation
  this.position = position
  this.color = color
}

Tile.prototype.copy = function(){ 
  return new Tile(this.reflected, this.rotation, createVector(this.position.x, this.position.y), this.color)
}

function gridToScreen(p){ 
  var result = createVector(p.x, p.y)
  result.mult(zoomFactor)
  result.add(offsetPosition)
  return result
}

function screenToGrid(p){ 
  var result = createVector(p.x, p.y)
  result.sub(offsetPosition)
  result.mult(1/zoomFactor)
  
  result = createVector(round(result.x), round(result.y))
  
  return result
}

Tile.prototype.toObj = function(){ 
  var obj = []; 
  obj.push( this.reflected ); 
  obj.push( this.rotation )
  obj.push( [this.position.x, this.position.y] )
  obj.push( this.color)

  return obj
}

Tile.prototype.fromObj = function(obj){ 
  this.reflected = obj.shift(); 
  this.rotation = obj.shift()
  var pos = obj.shift()
  this.position = createVector(pos[0], pos[1])
  this.color = obj.shift()
}

Tile.prototype.draw = function(bSelect){ 
  var pos = []
  for(var i = 0; i < originalTile.length; i++){ 
    pos.push(createVector(originalTile[i].x, originalTile[i].y))
  }
  
  for(var i = 0; i < pos.length; i++){ 
    pos[i].x = pos[i].x * (this.reflected ? -1 : 1)
    pos[i].rotate(HALF_PI * this.rotation) 
    pos[i].add(this.position)
    pos[i] = gridToScreen(pos[i]) 
  }
 
  //fill interior 
  fill(colorTable[this.color])
  strokeWeight(1)
  beginShape()
  for(var i = 0; i < pos.length; i++){ 
    vertex(pos[i].x, pos[i].y)
  }  
  endShape(CLOSE)
  
  //outline
  strokeWeight(bSelect ? 5 : 3)
  for(var i = 0; i < pos.length; i++){ 
    line(pos[i].x, pos[i].y, pos[(i+1)%pos.length].x, pos[(i+1)%pos.length].y)
  }
  
  //point at center
  strokeWeight(3)
  point(gridToScreen(this.position))
}




