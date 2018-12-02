let inputImg;
let statusMsg;
let transferBtn;
let style1;

let resultImage;
let styledImage;
let fadingImage;
let penWeight;
let strokeColor;

var stylePaths = ['models/sakura','models/yue','models/spring','models/katara'];

var pathsToOriginal = {'models/sakura':'img/originals/sakura2.jpg',
'models/yue':'img/originals/roses.jpg',
'models/spring':'img/originals/spring.jpg',
'models/katara':'img/originals/katara.jpg',

};


var currentStyle;

var currentStyleIndex = 0;

var nextStyleIndex;

let prevCanvasState;


var mouseDown = 0;





var styles = [];

let resizedContext;
let resizedCanvas;


var styleTransferMode = false;




function preload() {
 	soundFormats('mp3');
	vista_sound = loadSound('sound/vista-sound.mp3');
	mousedown_1 = loadSound('sound/mousedown-1.mp3');
	mousedown_2 = loadSound('sound/mousedown-2.mp3');
	mouseup = loadSound('sound/mouseup-1.mp3');
	song = loadSound('sound/audio_performance_mixdown.mp3');
	vista_shutdown = loadSound('sound/vista-shutdown.mp3');
}

function setup() {


  var canvasP5 = createCanvas(200,200);
  canvasP5.parent('paint-UI');
  background(255);
  canvas.style.width = "412px";
  canvas.style.height = "412px";
  prevCanvasState = JSON.stringify(canvas.toDataURL());

//Placeholder canvas with smaller resolution
  	resizedCanvas = document.createElement("canvas");
	resizedContext = resizedCanvas.getContext("2d");
	resizedCanvas.height = "80";
	resizedCanvas.width = "80";


   // // Create two Style methods with different pre-trained models

   for (var i=0; i<stylePaths.length; i++){

   	var thisStyle =  ml5.styleTransfer(stylePaths[i], modelLoaded);
   	styles.push(thisStyle);
   }

	resultImage = document.getElementById('resultImage');
	styledImage = document.getElementById('styledImage');
	fadingImage = document.getElementById('fadingImage');

	resizedContext.drawImage(canvas, 0,0, 80, 80);
	var image = resizedCanvas.toDataURL();
	// var image = canvas.toDataURL();
	resultImage.src = image;
	penWeight = 1;
	strokeColor = 0;
}



function mouseDragged() 
{ 	
	strokeWeight(penWeight);
	stroke(strokeColor);
	line(mouseX, mouseY, pmouseX, pmouseY);
}

// A function to be called when the models have loaded

var allStylesReady = false;

function modelLoaded() {
  // Check if both models are loaded




  //Look through all the styles, check if they are all ready
  var numberReadyStyles = 0;
  for (var i=0;i<styles.length;i++){
  	if (styles[i].ready){
  		allStylesReady ++;
  	}
  }
  if (numberReadyStyles = styles.length){
  	allStylesReady = true;
  }

}


let updateHighDef;
let updateIndex;
setInterval(function() {
		if (allStylesReady && styleTransferMode){



			var currentCanvasState = JSON.stringify(canvas.toDataURL());
			// console.log("TRIGGER INTERVAL");


			if (currentCanvasState !== prevCanvasState){
				$("#textarea").addClass("activated");
				$("#textarea").html("Transferring the style now...");

				//We notice that the canvas has changed since the last interval
				prevCanvasState = currentCanvasState;

			 		//Check that textbox isnt active AND paint is open
					currentStyle = styles[currentStyleIndex];
			 		//If we are currently drawing, use a lower resolution
			 		if(mouseDown){
			 			// console.log("mouseDown");
						resizedCanvas.height = "90";
						resizedCanvas.width = "90";
						resizedContext.drawImage(canvas, 0,0, 90, 90);
						var image = resizedCanvas.toDataURL();
						// var image = canvas.toDataURL();
						resultImage.src = image;
						transferImages(currentStyle); 
						updateHighDef = true;
						updateIndex =0;
					} else {
						resizedCanvas.height = "150";
						resizedCanvas.width = "150";
						resizedContext.drawImage(canvas, 0,0,150, 150);
						var image = resizedCanvas.toDataURL();
						resultImage.src = image;
						// transferImages(currentStyle); 
						updateHighDef = true;
						updateIndex =0;

					}

			} else {

				if (updateHighDef ==true){
					var dimensions = ['90','110','120','130','150'];
					currentStyle = styles[currentStyleIndex];
	
			
					var thisDimension = dimensions[updateIndex];
					var dimensionInt = parseInt(thisDimension);
					resizedCanvas.height = thisDimension;
					resizedCanvas.width = thisDimension;
					resizedContext.drawImage(canvas, 0,0,dimensionInt,dimensionInt);
					var image = resizedCanvas.toDataURL();
					resultImage.src = image;
					transferImages(currentStyle); 

					if (updateIndex == (dimensions.length-1)){
						updateHighDef = false;
						$("#textarea").html("Go ahead and draw! :)");
					}else{
						updateIndex++;

					}
					 

							

						
				}
				


		}

			

		}
		

	},200);

setInterval(function() {
	//The thing switches to a new style. But we display then fade out the previous style
	 if (styleTransferMode){
					var image = resizedCanvas.toDataURL();
		// var image = canvas.toDataURL();
		resultImage.src = image;
		transferImages(currentStyle); 
		$(fadingImage).show();
		currentStyleIndex = (currentStyleIndex+1) % stylePaths.length;
		var currentStyleImgPath = pathsToOriginal[stylePaths[currentStyleIndex]];
		$("#styleImg").attr("src",currentStyleImgPath);
		transferImagesFading(currentStyle);
		$(fadingImage).fadeOut(1000);
		
	}
},60000);


function transferImages(style) {
	style.transfer(document.getElementById("resultImage"), function(err, result) {
    	styledImage.src = result.src;
    	$("#styledImage").show();
  });
}


function transferImagesFading(style) {
	style.transfer(document.getElementById("resultImage"), function(err, result) {
		fadingImage.src = result.src;
  });
}

function erase(){
	strokeColor = 255;
	penWeight = 30;
	$("#paint-ui-img.erase").show();
	$("#paint-ui-img.draw").hide();

}


function pen(){
	strokeColor = 0;
	penWeight = 1;
	$("#paint-ui-img.erase").hide();
	$("#paint-ui-img.draw").show();

}
$(document).ready(function(){
	$(document).mousedown(function(){
		var i = Math.round(Math.random());
		if (i == 0){
			mousedown_1.play();
		} else {
			mousedown_2.play();
		}
	});

	$(document).mouseup(function(){
		mouseup.play();
	});

	$("#paint-icon").dblclick(function(){
		$("#paint-UI").show();
		$("#paint-UI").addClass("visible");
	});



	$("#folder-icon").dblclick(function(){

		$("#photos-ui").show();

	});


	$("#photos-ui").dblclick(function(){
		$("#photos-ui").hide();
		$("#image-preview-container").show();
		$("#image-preview-container").addClass("visible");
	});



	document.body.onkeyup = function(e){
		//~ / ` Key
	    if(e.keyCode == 192){
	        song.play();
	    }


	    //Spacebar
     	if(e.keyCode == 32){
     		if ($("#intro").hasClass("visible")){
     			 $("#intro").delay(100).fadeOut(600);
	    		$("#intro").removeClass("visible");
	    		vista_sound.play();
     		}
	    }



	    //Enter
     	if(e.keyCode == 13){
     		if ($("#textarea").html()){

     			//Begin style transfer
     			styleTransferMode = true;
     		}
	    }
	}

	$("#fake-start-button").click(function(){
		$("#start-menu").toggle();
		$("#start-menu").addClass("visible");
		
	});


	$("#start-menu").click(function(){
		$("#log-off").toggle();
		
	});


	$("#log-off").click(function(){
		setTimeout(function(){ 
			$("#outro").fadeIn(1000);
			vista_shutdown.play();

		 }, 1000);

				setTimeout(function(){ 
			$("#outro p").fadeIn(1000);
			

		 }, 7000);
		
		
	});



//Detect if Mousedown (1 for mouseDown, 0 for mouseUp)

document.body.onmousedown = function() { 
  ++mouseDown;
}
document.body.onmouseup = function() {
  --mouseDown;
}


	





});

