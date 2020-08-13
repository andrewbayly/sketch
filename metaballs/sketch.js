
blob = []; 

function Blob2(position, velocity, radius){ 
  this.position = position; 
  this.velocity = velocity;
  this.radius = radius; 
}

Blob2.prototype.update = function(){ 
  this.position = p5.Vector.add(this.position, this.velocity); 
  if(this.position.x <= 0 || this.position.x >= width)
    this.velocity.x *= -1; 
  if(this.position.y <= 0 || this.position.y >= height)
    this.velocity.y *= -1; 
}

Blob2.prototype.show = function(){ 
  ellipse(this.position.x, this.position.y, this.radius, this.radius); 
} 

function setup() {
  createCanvas(1000, 1000);
  colorMode(HSB);
  
  var n = 10; 
  var r = 100; 
  
  for(var i = 0; i < n; i++){ 
    blob.push(new Blob2(createVector(random(0, width), random(0, height)),
                       createVector(random(0, 10), random(0, 10) ), r) ) ;  
  }
  
}

var minSum = 150; 
var maxSum = 160; 

function draw() {
  background(0);
  
  strokeWeight(1);
  
  loadPixels();
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      let sum = 0;
      for (i = 0; i < blob.length; i++) {
        let xdif = x - blob[i].position.x;
        let ydif = y - blob[i].position.y;
        let d = sqrt((xdif * xdif) + (ydif * ydif));
        sum += 50 * blob[i].radius / d;
      }
      if(sum > minSum && sum < maxSum){  
        set(x, y, color((sum - minSum)*20, 255, 255));
      }  
    }
  }
  updatePixels();

  
  for(var i = 0; i < blob.length; i++){ 
    blob[i].update(); 
    //blob[i].show(); 
  } 

  
}

