//original shader code copied from: 
//https://p5js.org/reference/#/p5/createShader
//
//click and drag the mouse to create a zoom window
//
// the 'varying's are shared between both vertex & fragment shaders
let varying = 'precision highp float; varying vec2 vPos;';

// the vertex shader is called for each vertex
let vs =
  varying +
  'attribute vec3 aPosition;' +
  'void main() { vPos = (gl_Position = vec4(aPosition,1.0)).xy; }';

// the fragment shader is called for each pixel
let fs =
  varying +
  'uniform vec2 p;' +
  'uniform float r;' +
  'const int I = 500;' +
  'void main() {' +
  '  vec2 c = p + vPos * r, z = c;' +
  '  float n = 0.0;' +
  '  for (int i = I; i > 0; i --) {' +
  '    if(z.x*z.x+z.y*z.y > 4.0) {' +
  '      n = float(i)/float(I);' +
  '      break;' +
  '    }' +
  '    z = vec2(z.x*z.x-z.y*z.y, 2.0*z.x*z.y) + c;' +
  '  }' +
  '  gl_FragColor = vec4(0.5-cos(n*17.0)/2.0,0.5-cos(n*13.0)/2.0,0.5-cos(n*23.0)/2.0,1.0);' +
  '}';

let mandel;

let r ; 
let px ; 
let py ; 
let drawBox = false; 
let bDraw = true; 
let ax ; 
let bx ; 
let ay ; 
let by ; 

function setup() {
  createCanvas(1200, 1200, WEBGL);
  var gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST);
  
  // create and initialize the shader
  mandel = createShader(vs, fs);
  shader(mandel);
  noStroke();
  
  r = 2;
  px = 0; //-0.74364388703; 
  py = 0; // 0.13182590421; 
}

function draw() {

  if(bDraw || drawBox){   
    // 'p' is the center point of the Mandelbrot image
    mandel.setUniform('p', [px, py]);

    // 'r' is the size of the image in Mandelbrot-space
    //mandel.setUniform('r', 1.5 * exp(-6.5 * (1 + sin(millis() / 2000))));
  
    //console.log(r); 
    mandel.setUniform('r', r);
    quad(-1, -1, 1, -1, 1, 1, -1, 1);
    bDraw = false; 
  }  
  if(drawBox) { 
    stroke(255); 
    strokeWeight(2); 
//    fill(0); 
    
    rect(ax, ay, (bx - ax), (by - ay));
  }  
}

function mousePressed() {
  ax = mouseX - (width / 2); 
  ay = mouseY - (height / 2);
  bx = ax; 
  by = ay; 
  
  drawBox = true; 
}

function mouseDragged() {
  bx = mouseX - (width / 2); 
  by = mouseY - (height / 2); 
}

function mouseReleased() {
  drawBox = false;
  bDraw = true ; 

  var centerX = ax + (bx - ax) / 2;  
  var centerY = ay + (by - ay) / 2;  
  
  var mx = ( centerX ) * 2 / width ; 
  var my = ( centerY ) * 2 / height ; 
  
  px += mx * r  ; 
  py -= my * r  ; 
  
  r *= Math.max((bx - ax), (by - ay)) / width ; 
  
}



