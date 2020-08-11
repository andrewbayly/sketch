
grid = [[0, 1, 0, 1], 
        [3, 2, 3, 2], 
        [0, 1, 0, 1], 
        [3, 2, 3, 2]]; 

f = 0; 

function setup() {
  createCanvas(400, 400);
}

function draw() {
  f = f + 1; 
  if(f == 50)
    f = 0; 
  
  background(200);
  
  for(var i = 0; i < 4; i++){ 
    for(var j = 0; j < 4; j++){ 
      drawSquare(i, j, grid[j][i]);  
    }
  }
  
  
}

function mouseClicked() {
  console.log(mouseX); 
  console.log(mouseY);
  var y = Math.floor(mouseY / 100); 
  var x = Math.floor(mouseX / 100); 
  
  grid[y][x] = (grid[y][x] + 1) % 4; 
  
}

function drawSquare(i, j, value){ 
  var xOrigin = i * 100; 
  var yOrigin = j * 100;
  
  for(var k = 0; k < 3; k++){ 
    var x = (100 / 3) * k + (f * 2 / 3); 
    var y = (100 / 3) * k + (f * 2 / 3);
    
    if(value == 0){ 
      line(xOrigin + x, yOrigin, xOrigin, yOrigin + y);  
      line(xOrigin + 100, yOrigin + y , xOrigin + x, yOrigin + 100);
    }  
    else if(value == 2){ 
      line(xOrigin + 100 - x, yOrigin, xOrigin, yOrigin + 100 - y);  
      line(xOrigin + 100, yOrigin + 100 - y , xOrigin + 100 - x, yOrigin + 100);
    } 
    else if(value == 1){ 
      line(xOrigin + 100 - x, yOrigin, xOrigin + 100, yOrigin + y);  
      line(xOrigin, yOrigin + y , xOrigin + 100 - x, yOrigin + 100);
    }  
    else if(value == 3){ 
      line(xOrigin + x, yOrigin, xOrigin + 100, yOrigin + 100 - y);  
      line(xOrigin, yOrigin + 100 - y , xOrigin + x, yOrigin + 100);
    } 
    
  }
  
}
