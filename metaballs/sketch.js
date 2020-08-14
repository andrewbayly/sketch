
var blobShader;


var blob = []; 
var n = 20; 


function Blob2(position, velocity, radius){ 
  this.position = position; 
  this.velocity = velocity;
  this.radius = radius; 
}

Blob2.prototype.update = function(){ 
  this.position = p5.Vector.add(this.position, this.velocity); 
  if(this.position.x <= this.radius || this.position.x >= (width - this.radius))
    this.velocity.x *= -1; 
  if(this.position.y <= this.radius || this.position.y >= (height - this.radius))
    this.velocity.y *= -1; 
}

Blob2.prototype.show = function(){ 
  ellipse(this.position.x, this.position.y, this.radius, this.radius); 
} 

function preload() {
	blobShader = getShader(this._renderer);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  shader(blobShader); 
  
  colorMode(HSB);
  
  for(var i = 0; i < n; i++){ 
    blob.push(new Blob2(createVector(width/2, height/2),
                       createVector(random(0, 10), random(0, 10) ), random(10, 100)) ) ;  
  }
  
}

var minSum = 150; 
var maxSum = 160; 

function draw() {

  var data = []; 

  for(var i = 0; i < blob.length; i++){ 
    blob[i].update(); 
    data.push(blob[i].position.x, blob[i].position.y, blob[i].radius)
  } 
  
  blobShader.setUniform("metaballs", data); 
  rect(0, 0, width, height); 

}


//shader code copied from:
//  https://www.openprocessing.org/sketch/838276

function getShader(_renderer) {
	const vert = `
		attribute vec3 aPosition;
		attribute vec2 aTexCoord;

		varying vec2 vTexCoord;

		void main() {
		  vTexCoord = aTexCoord;

		  vec4 positionVec4 = vec4(aPosition, 1.0);
		  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

		  gl_Position = positionVec4;
		}
	`;

	const frag = `
		precision highp float;

		varying vec2 vTexCoord;

		uniform vec3 metaballs[${n}];

		const float WIDTH = ${windowWidth}.0;
		const float HEIGHT = ${windowHeight}.0;

		vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
		  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
		  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}

		void main() {
		  float x = vTexCoord.x * WIDTH;
		  float y = vTexCoord.y * HEIGHT;
		  float v = 0.0;

		  for (int i = 0; i < ${n}; i++) {
		 	vec3 ball = metaballs[i];
			float dx = ball.x - x;
			float dy = ball.y - y;
			float r = ball.z;
			v += r * r / (dx * dx + dy * dy);
		  }

		  if (0.9 < v && v < 1.1) {
			float a = (v - 0.9) * 4.;
			gl_FragColor = vec4(hsv2rgb(vec3(a, 1., 1.)), 1.0);
		  } else gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	`;
	
	return new p5.Shader(_renderer, vert, frag);
}










