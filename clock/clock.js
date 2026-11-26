

widget.backgroundColor = new Color("#111")

// midnight today
const midnight = new Date()
midnight.setHours(0, 0, 0, 0)

const clock = widget.addDate(midnight)
clock.applyTimerStyle()          // counts up: HH:MM:SS since midnight = current time
clock.font = Font.boldMonospacedSystemFont(36)
clock.textColor = Color.white()
clock.centerAlignText()

// ask iOS to rebuild the widget just after next midnight so it resets to 0:00:00
const nextMidnight = new Date(midnight)
nextMidnight.setDate(nextMidnight.getDate() + 1)
widget.refreshAfterDate = nextMidnight


/**

// Get the current drawing context

let canvas = new DrawContext();



// Set the size of the canvas (adjust as needed)

//canvas.setSize(50, 50);



// Set the line color

canvas.setStrokeColor(new Color("#00FF00"));
canvas.setFillColor(new Color("#00FF00"));



// Draw a square by holding shift while dragging

canvas.fillRect(new Rect(0, 0, 100, 100)); // (x, y, width, height) 



// Present the canvas

//canvas.preview(); 


//widget.addText('hello 44')








image = canvas.getImage()

widget.backgroundImage = image

**/
