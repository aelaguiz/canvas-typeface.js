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

function pixelCopy(source, destCtx, sw, sh, dx, dy, dw, dh) {
	var rawSource= source.getImageData(0, 0, sw, sh),
		rawDest = destCtx.createImageData(dw, dh),
		destX,
		destY,
		srcIndex,
		destIndex;
	
	for(var x = 0; x < rawSource.width; x++) {
		for(var y = 0; y < rawSource.height; y++) {
			destX = x;
			destY = y;
			srcIndex = (y*sw*4) + (x*4);
			destIndex = (destY*dw*4)+(destX*4);
				
			//for(var i = 0, max = 4; i < max; i++) {
				
			rawDest.data[destIndex] = rawSource.data[srcIndex];
			rawDest.data[destIndex+1] = rawSource.data[srcIndex+1];
			rawDest.data[destIndex+2] = rawSource.data[srcIndex+2];
			rawDest.data[destIndex+3] = rawSource.data[srcIndex+3];
			//}
		}
	}
	
	
	destCtx.putImageData(rawDest, dx, dy);
	
	delete rawDest;
}

function loop(canvas) {
	var graphics = canvas.getContext('2d');
	
	graphics.save();
	
    /*
     * Render canvas
     */
    graphics.clearRect(0, 0, canvas.width, canvas.height);
  
	
  	var curY = 0;
  	var curX = 0;

	for(var size = 12; size < 100; size*=1.25) {
  		curY += size;
  		
  		var surface = Typeface.render("ab cd ef ghi jkl", {fontFamily: "Helvetiker", color: "#AADDAA", fontSize: size}, graphics);

		graphics.save();
  		pixelCopy(surface.context, graphics, surface.canvas.width, surface.canvas.height, curX, curY, canvas.width, canvas.height);
  		
  		//graphics.transform(1, 0, 0.5, 0.5, 0, 0);
  		//graphics.translate(0, 100);  		
  		
  		//graphics.drawImage(surface.canvas, 0, 0, surface.canvas.width, surface.canvas.height);
  		//graphics.restore();
			
		delete surface.canvas;
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
