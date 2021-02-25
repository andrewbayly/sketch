//tribar
tiny.load(`
  (define (setup)
    (createCanvas 1000 1000)
    (frameRate 30)
    (colorMode "hsb")
    (assign f 0)
  )

  (define (draw)
    (background 255)
    (assign f (+ f 1))
    
    (if (= f 100)
      (assign f 0)
    )  

    (assign t 0)
    (assign t2 0)
    (if (< f 50)
      (begin
        (assign t (/ f 50))
        (assign t2 0)
      )
      (begin
        (assign t 1)
        (assign t2 (/ (- f 50) 50))
      )
    )
  
    (var arr (array
               (array (-(- 3.5 (* t 0.5)) (* t2 1.0)) (+ 6.5 (* t 0.5) (* t2 1.0)))             
               (array (-(- 5 (* t 1.0)) (* t2 0.5)) (+ 5 (* t 1.0) (* t2 0.5)))             
               (array (-(- 6.5 (* t 1.5)) (* t2 0.0)) (+ 3.5 (* t 1.5) (* t2 0.0)))             
     
               (array 6.5 (- (- 6.5 (* t 1) ) (* t2 2))) 
               (array 6.5 (- (- 9.5 (* t 2) ) (* t2 1))) 
               (array 6.5 (- (- 12.5 (* t 3) ) (* t2 0))) 
    
               (array (+ 5 (* t 0.5) (* t2 1.0)) (+ 11 (* t 0.5) (* t2 1.0)))             
               (array (+ 3.5 (* t 1.0) (* t2 0.5)) (+ 9.5 (* t 1.0) (* t2 0.5)))             
               (array (+ 2 (* t 1.5) (* t2 0.0)) (+ 8 (* t 1.5) (* t2 0.0)))             
             )
    )
  
    (if (>= f 50)
      (call-method arr push (call-method arr shift))
    )
  
    (drawBoxes arr) 
  
  )
  
  (define (drawBoxes arr)
    (call-method arr push (call-method (access arr 0) slice))
    
    (call-method (access arr 0) push 2)
    (call-method (access arr 0) push 2)
  
    (call-method (access arr (- (access arr "length") 1)) push 0)
    (call-method (access arr (- (access arr "length") 1)) push 1)
    
    (var i 0)
    (while (< i (access arr "length"))
      (begin
        (call-method drawHex apply null (access arr i))    
        (assign i (+ i 1))
      )
    )
  )
  
  (define (drawHex x y min max)
    (if (= min undefined)
      (begin
        (assign min 0)
        (assign max 2)
      )
    )
    
    (var q (array 
             (array 1 0 1 2 0 3 0 1)
             (array 1 2 2 3 1 4 0 3) 
             (array 1 0 1 2 2 3 2 1)
           )
    )
  
    (var color (array
                 (array 100 90 40) 
                 (array 100 90 70) 
                 (array 100 90 100)
               )
    )
    
 
    (var i min)
    (while (<= i max)
     (begin
      (var arr (array))
      (var p 0)
      (var j 0)

      (while (< j (access q i "length"))
       (begin
        (call-method arr push (+ (access q i j) (if (= p 0) x y)))
        (assign p (if (= p 0) 1 0))  

        (assign j (+ j 1))
       ) 
      )
      
      (call-method fill apply null (access color i))
      
      (drawQuad arr)

      (assign i (+ i 1))
     ) 
    )
  )
  
  (define (drawQuad q)
    
    (var xSize 87)
    (var ySize 50)
    
    (var v (array))
    (var p 0)
    
    
    (var i 0)
    (while (< i (access q "length"))
     (begin
      (call-method v push (* (access q i) (if (= p 0) xSize ySize)))
      (assign p (if (= p 0) 1 0))   
       
      (assign i (+ i 1))
     ) 
    )
    
    (call-method quad apply null v)  

  )
  
`)





/**
tiny.load(`
  (print "Hello World")
  (var x (array 1 3 (array 2 5)))
  (print x)
  (print (access x 2 1))
  (assign (access x 2 1) 42)
  (print (call-method JSON stringify x))
`)
**/

/**
tiny.load(`
  (print "Hello World")

  (print (* 3 4 5))

  (print (- 10 5))

  (print (/ 10 5))

  (print (+ 3 4 5))

  (print (+ 3 (* 4 5) 2))
  
  (print (> 3 4))
  (print (< 3 4))
  (print (= 3 4))
  (print (<= 3 4))
  (print (>= 3 4))
  (print (!= 3 4))

  (print (and true true))
  (print (or true false))
  (print (expt 2 3))
  
  (print (if (> 2 3) (+ 2 2) (+ 3 3)))
  
  (assign x 42)
  (print x)  

  (var y 21)
  (print y)
  
  (var k (new Array))  
  (call-method k push 5)
  (call-method k push 6)
  (call-method k push (+ 2 7))
  (print (call-method k toString))
  
  (print (call-method k getValue 2))
  
  (print (if (< 2 3) (+ 2 2)))
`)
**/


/**
//sierpinski-zoom
tiny.load(`

  (define (setup)  
    (assign SIZE 500)
    (createCanvas SIZE SIZE)
    (frameRate 25)
    (assign f 0)
      
    (assign r (pow 3 0.01))
  )
  
  (define (draw)  
    (background 0)
    (assign f (+ f 1))
    (if (= f 100)
      (assign f 0)
    )
    (assign size (* SIZE (pow r f)))
    (drawSquare 0 0 size)  
  )

  (define (drawSquare x1 y1 size) 
      (if (and (> size 5)
               (< x1 SIZE)
               (< y1 SIZE))
        (begin
          (fill 255)
          (var x 0)
          (while (< x 3)
            (begin
              (var y 0)  
              (while (< y 3)
                (begin
                  (if (and (= x 1) (= y 1))
                        (square (+ x1 (* size (/ x 3))) (+ y1 (* size (/ y 3))) (/ size 3) )  
                        (drawSquare (+ x1 (* size (/ x 3))) (+ y1 (* size (/ y 3))) (/ size 3) )
                  )
                  (assign y (+ y 1))
                )  
              )
              (assign x (+ x 1))
            )  
          )
        )
      )  
  )
  
`);
**/

/**
//factorial
tiny.load(`
  (define (fact x)
    (if (= x 1)
        1
        (* x (fact (- x 1)))
    )
  )
  
  (print (fact 4))
`);
**/

/**
//reverse array
tiny.load(`
  (define (reverse arr)
    (if (= (call-method arr getValue "length") 1)
        arr
        (begin
           (var x (call-method arr shift))
           (assign arr (reverse arr))
           (call-method arr push x)
           arr        
        )
    )
  )
  
  (var arr (new Array))
  
  (call-method arr push 1)
  (call-method arr push 2)
  (call-method arr push 3)
  
  (print (reverse arr))
`);
**/

/**
//merge-sort
tiny.load(`
  (define (merge-sort arr)
    (if (<= (call-method arr getValue "length") 1)
      arr
      (begin
        (var len (round (/ (call-method arr getValue "length") 2)))
        (var a (call-method arr slice 0 len))      
        (var b (call-method arr slice len))      
        
        (assign a (merge-sort a))
        (assign b (merge-sort b))

        (var result (new Array))
        (while (and
                 (> (call-method a getValue "length") 0)
                 (> (call-method b getValue "length") 0)
               ) 
          (call-method result push
            (if (< (call-method a getValue 0) (call-method b getValue 0) )
              (call-method a shift) 
              (call-method b shift) 
            )
          )
        )
        
        (assign result (call-method result concat a)) 
        (assign result (call-method result concat b)) 
        
        result
      )
    )  
  )

  (define (setup)
    (var arr (new Array))
  
    (call-method arr push 5)
    (call-method arr push 3)
    (call-method arr push 2)
    (call-method arr push 1)
    (call-method arr push 4)
  
    (print (merge-sort arr))
  )  
`);
**/

/**
//mouse-pressed demo
tiny.load(`
  (define (setup)
    (assign value 0)
  )

  (define (draw)
    (fill value)
    (rect 25 25 50 50)
  )

  (define (mousePressed)
    (assign value
      (if (= value 0)
        255
        0    
      )
    )
  )
`);
**/

/**
//sierpinski zoom(original JavaScript)
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
**/