//original bouncing bubbles code copied from:
//https://p5js.org/examples/motion-bouncy-bubbles.html

let numBalls = 20;
let spring = 0.10;
let gravity = 0.02;
let friction = -0.9;
let balls = [];

let permissionGranted = false; 

function setup() {
  createCanvas(windowWidth, windowHeight);

  if(typeof(DeviceOrientationEvent) != 'undefined' 
     && typeof(DeviceOrientationEvent.requestPermission) == 'function'){ 
  
  DeviceOrientationEvent.requestPermission()
    .catch(() => {
      let button = createButton("click to allow access to sensors"); 
      button.style('font-size', '24px'); 
      button.center(); 
      button.mousePressed(requestAccess); 
      throw error; 
    })
    .then(() => {
      permissionGranted = true; 
    }) 
  
  } 
  
  
  for (let i = 0; i < numBalls; i++) {
    balls[i] = new Ball(
      random(width),
      random(height),
      random(30, 100),
      i,
      balls
    );
  }
  noStroke();

}

function requestAccess(){ 
  DeviceOrientationEvent.requestPermission()
    .then(response => { 
       permissionGranted = (response == 'granted') ; 
   })
   .catch(console.error); 
  
  this.remove(); 
}


function draw() {
  if(!permissionGranted) 
    return;
  
  background(0);
  balls.forEach(ball => {
    ball.collide();
    ball.move();
    ball.display();
  });
}


class Ball {
  constructor(xin, yin, din, idin, oin) {
    this.x = xin;
    this.y = yin;
    this.rot = 0; 
    this.vrot = 0.01; 
    this.vx = 0;
    this.vy = 0;
    this.diameter = din;
    this.id = idin;
    this.others = oin;
  }

  collide() {
    for (let i = this.id + 1; i < numBalls; i++) {
      // console.log(others[i]);
      let dx = this.others[i].x - this.x;
      let dy = this.others[i].y - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
      //   console.log(distance);
      //console.log(minDist);
      if (distance < minDist) {
        //console.log("2");
        let angle = atan2(dy, dx);
        let targetX = this.x + cos(angle) * minDist;
        let targetY = this.y + sin(angle) * minDist;
        let ax = (targetX - this.others[i].x) * spring;
        let ay = (targetY - this.others[i].y) * spring;
        this.vx -= ax;
        this.vy -= ay;
        this.others[i].vx += ax;
        this.others[i].vy += ay;
      }
    }
  }

  move() {
    const rotX = constrain(rotationY, -3, 3); 
    const rotY = constrain(rotationX, -3, 3); 

    this.vx += gravity * rotX; 
    this.vy += gravity * rotY; 
    this.x += this.vx;
    this.y += this.vy;
    this.vrot = (this.vx + this.vy ) / 20; 
    this.rot += this.vrot; 
    if (this.x + this.diameter / 2 > width) {
      this.x = width - this.diameter / 2;
      this.vx *= friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      this.vx *= friction;
    }
    if (this.y + this.diameter / 2 > height) {
      this.y = height - this.diameter / 2;
      this.vy *= friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      this.vy *= friction;
    }
  }

  display() {
    fill(255, 204);
    ellipse(this.x, this.y, this.diameter, this.diameter);
    fill(0);
    ellipse(this.x + cos(this.rot) * this.diameter / 6, this.y - sin(this.rot) * this.diameter / 6,
            this.diameter/10, this.diameter/10);
    
    ellipse(this.x - sin(this.rot) * this.diameter / 6, this.y - cos(this.rot) *this.diameter / 6,
            this.diameter/10, this.diameter/10);

/**
    ellipse(this.x  + sin(this.rot - PI/4) * this.diameter / 6 , this.y + cos(this.rot - PI/4) * this.diameter / 6,
            this.diameter/5, this.diameter/5);
**/ 
    
    push();
    // translate to where you want the center of the ellipse to be
    translate(this.x  + sin(this.rot - PI/4) * this.diameter / 6 , this.y + cos(this.rot - PI/4) * this.diameter / 6);
    // rotate using the frameCount (increases by one on each frame)
    rotate(-this.rot + PI/4);
    // draw the ellipse at the origin
    ellipse(0, 0, this.diameter/3, this.diameter/10);
    pop();
    
    
    
  }
}



