$(document).ready(function(){
	var canvas = document.getElementById("canvas1");
	
	setInterval(function(){
        loop(canvas);
    }, 1000 / 30);
    
    canvas.onmousemove = function(event){
		onDocumentMouseMove(event)
	};
	canvas.onmousedown = function(event){
		onDocumentMouseDown(event);
	};
	canvas.onmouseup = function(event){
		onDocumentMouseUp(event);
	};
	canvas.onmousewheel = function(event){
		onDocumentMouseWheel(event);
	};
});
var rotationX = 0;

var rotationY = 0;
function loop(canvas) {
	var graphics = canvas.getContext('2d');
	
	graphics.save();
	
    /*
     * Render canvas
     */
    graphics.clearRect(0, 0, canvas.width, canvas.height);
  
  	var curY = 10;
  	var size = 48;
  	//for(var size = 12; size < 78; size+=4) {
  		
  		graphics.translate(100, size+2);
  		
  		/*Typeface.render("LOL TEXT", {'rotationX': rotationX*Math.PI/180, 'rotationY': rotationY*Math.PI/180, eyeDistance: 20000, z: 300, fontFamily: "Helvetiker", color: "#FF0000", fontSize: size}, graphics);
  		
  		Typeface.render("LOL TEXT", {'rotationX': rotationX*Math.PI/180, 'rotationY': rotationY*Math.PI/180, eyeDistance: 20000, z: 200, fontFamily: "Helvetiker", color: "#FF0000", fontSize: size}, graphics);
  		
  		Typeface.render("LOL TEXT", {'rotationX': rotationX*Math.PI/180, 'rotationY': rotationY*Math.PI/180, eyeDistance: 20000, z: 100, fontFamily: "Helvetiker", color: "#FF0000", fontSize: size}, graphics);*/
  		
  		Typeface.render("LOL TEXT", {'rotationX': rotationX*Math.PI/180, 'rotationY': rotationY*Math.PI/180, eyeDistance: 20000, z: 0, fontFamily: "Helvetiker", color: "#FF0000", fontSize: size}, graphics);
  	//}
    graphics.restore();
}


var mouseX = undefined;
var mouseY = undefined;

var inc = 5;


function onDocumentMouseMove(event){
	if(undefined !== mouseX) {
		var deltaX = event.offsetX - mouseX;
		var deltaY = event.offsetY - mouseY;
		
		if(deltaX != 0) {
			if(deltaX >= 0) {
				rotationY +=inc;
			}
			else
				rotationY -= inc;
				
			if(rotationY < 0)
				rotationY = 0;
				
			else if(rotationY > 180)
				rotationY = 180;
		}
		
		if(deltaY != 0) {
			if(deltaY >= 0) {
				rotationX +=inc;
			}
			else
				rotationX -= inc;
				
			if(rotationX < 0)
				rotationX = 0;
				
			else if(rotationX > 180)
				rotationX = 180;
		}
	}
	
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function onDocumentMouseDown(event){

}

function onDocumentMouseUp(event){
    
}

function onDocumentMouseWheel(event) {
	if(event.wheelDelta > 0) {
		rotationY +=10;
	}
	else
		rotationY -= 10;
		
	if(rotationY < 0)
		rotationY = 0;
		
	else if(rotationY > 180)
		rotationY = 180;
}
