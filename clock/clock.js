// Get the current drawing context

let canvas = new DrawContext();



// Set the size of the canvas (adjust as needed)

//canvas.setSize(50, 50);



// Set the line color

canvas.setStrokeColor(new Color("#FF0000"));
canvas.setFillColor(new Color("#FF0000"));



// Draw a square by holding shift while dragging

canvas.fillRect(new Rect(0, 0, 100, 100)); // (x, y, width, height) 



// Present the canvas

//canvas.preview(); 


//widget.addText('hello 44')








image = canvas.getImage()

widget.backgroundImage = image

