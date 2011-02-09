$(document).ready(function(){
	var canvas = document.getElementById("canvas1");
	
	//setInterval(function(){
        loop(canvas);
    //}, 1000 / 30);
    
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

function loop(canvas) {
	var graphics = canvas.getContext('2d');
	
	graphics.save();
	
    /*
     * Render canvas
     */
    graphics.clearRect(0, 0, canvas.width, canvas.height);
  
  	var curY = 10;
  	var size = 24;
  	for(var size = 12; size < 78; size+=4) {
  		graphics.translate(0, size+2);
  		
  		Typeface.render("test text", {fontFamily: "Helvetiker", color: "#FF0000", fontSize: size}, graphics);
  	}
    graphics.restore();
}


var mouseX = undefined;
var mouseY = undefined;

function onDocumentMouseMove(event){
	if(undefined !== mouseX) {
		var deltaX = event.offsetX - mouseX;
		var deltaY = event.offsetY - mouseY;
		
	}
	
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function onDocumentMouseDown(event){

}

function onDocumentMouseUp(event){
    
}

function onDocumentMouseWheel(event) {

}
