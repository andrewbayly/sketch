
function setup() {
  createCanvas(1000, 1000);
  frameRate(30);
  colorMode(HSB);
  f = 0; 
}

function draw() {
  background(255);
  f = f + 1; 
  
  if(f == 100)
    f = 0; 

/**  
  drawHex(6.5, 6.5);
  drawHex(6.5, 9.5);
  drawHex(6.5, 12.5);
**/

var t = 0; 
var t2 = 0; 
if(f < 50){ 
  t = f / 50; 
  t2 = 0; 
}
else{ 
  t = 1;    
  t2 = (f - 50) / 50
}
  
//var t = f / 100.0;   
  
var arr = [  
   [3.5 - t * 0.5 - t2 * 1.0, 6.5 + t * 0.5 + t2 * 1.0], 
   [5 - t * 1.0 - t2 * 0.5,   5 + t * 1.0 + t2 * 0.5], 
   [6.5 - t * 1.5 - t2 * 0.0, 3.5 + t * 1.5 + t2 * 0.0], 

   [6.5, 6.5 - t * 1 - t2 * 2],
   [6.5, 9.5 - t * 2 - t2 * 1],
   [6.5, 12.5 - t * 3 - t2 * 0],

   [5 + t * 0.5 + t2 * 1.0, 11 + t * 0.5 + t2 * 1.0],
   [3.5 + t * 1.0 + t2 * 0.5, 9.5 + t * 1.0 + t2 * 0.5],
   [2 + t * 1.5 + t2 * 0.0, 8 + t * 1.5 + t2 * 0.0]
  ] ; 

if(f >= 50)  
  arr.push(arr.shift()); 
  
  drawBoxes(arr); 
}

function drawBoxes(arr){ 
  arr.push(arr[0].slice());
  
  arr[0].push(2); 
  arr[0].push(2);
  
  arr[arr.length-1].push(0); 
  arr[arr.length-1].push(1); 
  
  for(var i = 0; i < arr.length; i++){ 
    drawHex.apply(null, arr[i]);  
  }
}  
/**  
  drawHex(3.5, 6.5, 2, 2);
  drawHex(5, 5);
  drawHex(6.5, 3.5);

  drawHex(6.5, 6.5);
  drawHex(6.5, 9.5);
  drawHex(6.5, 12.5);

  drawHex(5, 11);
  drawHex(3.5, 9.5);
  drawHex(2, 8);
  
  drawHex(3.5, 6.5, 0, 1);
**/

//will require more arguments and modifications
//to draw only some faces
function drawHex(x, y, min, max){ 

  if(typeof min == 'undefined'){ 
    min = 0; 
    max = 2; 
  }  
  
  var q = [ [1, 0, 1, 2, 0, 3, 0, 1],
            [1, 2, 2, 3, 1, 4, 0, 3], 
            [1, 0, 1, 2, 2, 3, 2, 1] ] ;
  
  var color = [ [100, 90, 40], 
                [100, 90, 70], 
                [100, 90, 100] ] ;  
               
  
  for(var i = min; i <= max; i++){ 
    var arr = []; 
    var p = 0; 
    for(var j = 0; j < q[i].length; j++){ 
      arr.push(q[i][j] + (p == 0 ? x : y) );
      p = p == 0 ? 1 : 0; 
    }
    
    fill.apply(null, color[i]); 
        
    drawQuad(arr); 
  }  
  
}  

function drawQuad(q){ 

  var xSize = 87; 
  var ySize = 50; 
  
  var v = []; 
  var p = 0; 
  for(var i = 0; i < q.length; i++){ 
    v.push( q[i] * (p == 0 ? xSize : ySize) ); 
    p = p == 0 ? 1 : 0; 
  }  
  
  quad.apply(null, v); 
}  