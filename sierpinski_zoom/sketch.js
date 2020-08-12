/**
  Sierpinski Zoom
**/

function setup() {
  SIZE = 500; 
  
  createCanvas(SIZE, SIZE);
  frameRate(25);
  colorMode(HSB);
  f = 0; 
  
  r = Math.pow(3, 0.01); 
}

function draw() {
  background(0);
  f = f + 1; 
  
  if(f == 100)
    f = 0; 

  var size = SIZE * Math.pow(r, f); 
  
  drawSquare(0, 0, size);   
}  

function drawSquare(x1, y1, size){ 
  if(size < 5)
    return; 
    
  if( x1 > SIZE || y1 > SIZE)
    return; 
    
  fill(255);
  for(var x = 0; x < 3; x++){ 
    for(var y = 0; y < 3; y++){ 
      if(x == 1 && y == 1){ 
        square(x1 + size*x/3, y1 + size*y/3, size/3);     
      }
      else{
        drawSquare(x1 + size*x/3, y1 + size*y/3, size/3);     
      }
      
    }
  }
}

