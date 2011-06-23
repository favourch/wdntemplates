var UNL_Balloons = (function() {
	var $; // Will set to our jQuery variable once it's available on the callback so we can use $
	
	var balloonBatch = 10; // Number of balloons to release each time
	var maxBalloons = 55; // Max number of balloons before balloon overdose
	var clickActive = true; // Set to false when maxBalloons has been reached
	var balloonRegistry = new Array(); // Keep track of what balloons are currently on screen
	
	var interval = new Object(); // setInterval variable for interval.move and interval.hadEnough
	var moveTimeSpan = 30; // Time span for move interval
	var moveDistance = 1; // Pixel distance to move
	
	return {
		init : function() {
			$ = WDN.jQuery;
			
			

			$('#footer').prepend('<div id="releasetheballoons"><img id="releasetheballoons-img" src="splash/releasetheballoons.png" alt="Click to Release the Balloons" /></div>');
			
			$('#releasetheballoons-img').click(function() {
				if (!clickActive) {
					return;
				}

				if (balloonRegistry.length > maxBalloons) {
					clickActive = false;
					$('#okclicksomemore').remove();
					$('<div class="balloon-message" id="ithinkyouvehadenough">I think you\'ve clicked it enough, we\'re running out of balloons! Give us a second to get some more...</div>').insertAfter('#footer_floater');
					interval.hadEnough = setInterval('UNL_Balloons.checkMaxBalloons();', 1000);
				} else {
					UNL_Balloons.addBalloons();
					WDN.log(balloonRegistry);
					if (interval.move == null) {
						WDN.log('Release the balloons!');
						UNL_Balloons.startBalloons();
					}
				}
			});
			
			//Let's just go ahead and release some beloons on page load
			window.onload = function() {
				$('#releasetheballoons-img').click();
			};
		},
		
		addBalloons : function() {
			var lastIndex = (balloonRegistry.length ? balloonRegistry.length-1 : 0);
			var lastBalloon = (balloonRegistry[lastIndex] ? balloonRegistry[lastIndex] : 0);

			var centerPosition = (window.innerWidth/2)-35;
			var footerPosition = $('#footer').offset().top;
			
			var i;
			for (i=lastBalloon+1;i<=lastBalloon+balloonBatch;i++) {
				$('body').append('<img class="balloon" id="balloon'+i+'" src="splash/balloon.png" alt="Red Balloon" />');
				$('#balloon'+i).css({'left' : centerPosition+'px', 'top' : footerPosition+'px'});
				WDN.log('Added balloon'+i);
				balloonRegistry.push(i);
			}
		},
		
		startBalloons : function() {
			interval.move = setInterval('UNL_Balloons.moveBalloons();', moveTimeSpan);
		},
		
		moveBalloons : function() {
			if (balloonRegistry.length < 1) {
				clearInterval(interval.move);
				interval.move = null;
				WDN.log('Move interval cleared!');
			}

			// Start at the back of the array so items can be removed without screwing up the indices
			var i;
			for (i=balloonRegistry.length-1;i>=0;i--) {
				var currentBalloon = $('#balloon'+balloonRegistry[i]);
				var offset = currentBalloon.offset();

				// Get the last digit of the balloon id, i.e. 9 for balloon59
				var sigFig = balloonRegistry[i].toString().substr(-1);
				sigFig = parseInt(sigFig);
			
				// Do some stuff with random numbers to try to get some different flow amongst balloons
				// Basically this was the result of trial and error,
				// Not ideal but I'm not going to write a whole damn balloon physics engine (like I'd know how anyway)
				var moveVertical = (Math.floor(Math.random()*10)/(sigFig+1) > .3 ? moveDistance : 0);
				var moveHorizontal = ((Math.floor(Math.random()*100)+1)/(sigFig+2) < 2.5 ? -(moveDistance) : 0);

				// Try to keep half of them on each side of the screen,
				// again, not ideal but who do I look like, Professor Tim Gay???
				if (sigFig%2) {
					moveHorizontal = Math.abs(moveHorizontal);
				}

				// Actually move the balloon
				currentBalloon.css({'left' : offset.left+moveHorizontal+'px', 'top' : offset.top-moveVertical+'px'});
				
				// If the balloon has exited the top of the view port, remove from the DOM and the registry
				if (offset.top < -80) {
					currentBalloon.remove();
					WDN.log('Removed balloon key: '+i+' Balloon id:'+currentBalloon.attr('id'));
					balloonRegistry.splice(i, 1);
					WDN.log(' Registry is now: '+balloonRegistry);
				}
			};
		},

		checkMaxBalloons : function() {
			if (balloonRegistry.length < maxBalloons) {
				clearInterval(interval.hadEnough);
				clickActive = true;
				$('#ithinkyouvehadenough').remove();
				$('<div class="balloon-message" id="okclicksomemore">Ok, we inflated some more balloons, you can click again!</div>').insertAfter('#footer_floater');
				WDN.log('User no longer in danger of balloon overdose.');
			}
		}
	};
})();

WDN.loadCSS('splash/releasetheballoons.css');
WDN.loadJQuery(UNL_Balloons.init);
