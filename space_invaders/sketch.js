/**
  Space Invaders
**/

var images = {}; 
var fleet; 

function preload(){ 
  loadImages(); 
}

function loadImages(){ 
  for(var i = 1; i <= 7; i++){ 
    var name = "space" + i; 
    images[name] = loadImage('images/' + name + '.png');
    //console.log(images[name]); 
  }
}

function setup() {
  createCanvas(2000, 1000); 
  fleet = new Fleet(); 
}

function draw() {
  background(0); 
  
  fleet.update(); 
  fleet.show(); 
}  

function Fleet(){

  //these are just initial positions
  this.posX = 200; 
  this.posY = 200; 
  this.spacingX = 120; 
  this.spacingY = 100; 
   
  this.ships = []; 
  for(var i = 0; i < 5; i++){ 
    var row = []; 
    for(var j = 0; j < 11; j++){ 
      var i1 = {0:1, 1:1, 2:3, 3:3, 4:5}[i]; 
      var i2 = {0:2, 1:2, 2:4, 3:4, 4:6}[i]; 
    
      row.push(new Ship(images["space" + i1], images["space" + i2], this.posX + this.spacingX * j, this.posY + this.spacingY * i )); 
    }
    this.ships.push(row); 
  }
  
  //rate is the number of frames to wait before update does anything
  this.rate = 30; 
  this.frame = 0; 
}

Fleet.prototype.update = function(){ 
  this.frame = (this.frame + 1) % this.rate; 
  if(this.frame != 0)
    return; 

  for(var i = 0; i < 5; i++){ 
    for(var j = 0; j < 11; j++){
      this.ships[i][j].update();     
    }
  } 
  
  //check for collision with left/right boundary
  var minX = this.ships[0][0].posX;   
  var maxX = this.ships[0][0].posX; 
  
  for(var i = 0; i < 5; i++){ 
    for(var j = 0; j < 11; j++){
      var ship = this.ships[i][j]; 
      if(!ship.destroyed){ 
        minX = Math.min(minX, ship.posX - ship.width / 2); 
        maxX = Math.max(maxX, ship.posX + ship.width / 2);
      } 
    }
  }
  
  
  var left = 100; 
  var right = 1900 ; 
  var stepY = 20; 
  var maxRate = 5; 
    
  if(minX < left || maxX > right){ 
    for(var i = 0; i < 5; i++){ 
      for(var j = 0; j < 11; j++){
        var ship = this.ships[i][j];
        ship.velocity *= -1; 
        ship.posY += stepY;  
      }
    }   
    this.rate = Math.max(maxRate, (this.rate-1));  
  } 
       
}

Fleet.prototype.show = function(){ 
  for(var i = 0; i < 5; i++){ 
    for(var j = 0; j < 11; j++){
      this.ships[i][j].show();  
    }
  } 
}


function Ship(image1, image2, posX, posY){ 
  this.images = [ image1, image2 ] ;
  this.posX = posX; 
  this.posY = posY;
  this.width = this.images[0].width; 
  this.height = this.images[0].height;
  //console.log(this.images[0].width); 
  //console.log(this.width); 

  this.imageIndex = 0;  
  this.velocity = 10; 
  this.destroyed = false; 
}

Ship.prototype.show = function(){
  if(!this.destroyed)
    image(this.images[this.imageIndex], this.posX - this.width / 2, this.posY - this.height / 2);  
}

Ship.prototype.update = function(){
  this.imageIndex = 1 - this.imageIndex ; 
  this.posX = this.posX + this.velocity;   
}




