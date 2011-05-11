var startTime, stopTime;
var counter = 0;
var types = ['flag','mega'];
var userType = 'Other';

timer = function() {
	return {
		start : function(){
			startTime = new Date().getTime();
			console.log(startTime);
		},
		
		difference : function(){
			time = (stopTime - startTime)/1000;
			return time;
		},
		
		stop : function(testID){
			stopTime = new Date().getTime();
			console.log(stopTime);
			ui.testComplete(testID, startTime, stopTime, timer.difference(), counter);
		}
	};
}();

store = function() {
	return {
		setup: function(){
			
		},
		
		save : function(testID, startTime, endTime, difference, testOrder){
			WDN.post('dump.php', {'testID' : testID, 'startTime' : startTime, 'endTime' : endTime, 'testOrder' : testOrder, 'userType' : 'student'}, function(data){
				WDN.log(data);
			});
		}
	};
}();

ui = function() {
	
	var variations = [1,2,3,4,5];
	
	var variationsSeen = [];
	
	return {
		
		type : function(){
			return(WDN.jQuery('#navigation').attr('class'));
		},
		
		setup : function(){
			WDN.jQuery('.test').hide();
			WDN.jQuery('#exercise').empty();
			WDN.log(variationsSeen);
			do {
				currentRandom = ui.random(variations);
				i = WDN.jQuery.inArray(currentRandom, variationsSeen);
			}
			while (i > -1); 
			//console.log(currentRandom);
			variationsSeen.push(currentRandom);
			counter++;
			//console.log(counter);
			ui.startTest(currentRandom); //Now we have a random number never used.
		},
		
		chooseTest : function(){
			WDN.log(counter);
			if (counter == 5){ //we need to switch to the other type
				WDN.log('changing to other navgition type '+counter);
				ui.toggleType(secondType);
			} else {
				if (counter < 10){
					ui.setup();
				} else {
					ui.endTests();
				}
			}
		},
		
		toggleType : function(newType) {
			variationsSeen.length = 0;
			WDN.jQuery("#navigation").removeAttr('class').addClass(newType);
			WDN.log('navigation type toggled');
			ui.setup();
		},
		
		changeTypeTest : function(){ //resets
			
		},
		
		random : function(theArray){
			thisVariation = theArray[Math.floor(Math.random()*theArray.length)];
			return thisVariation;
		},
		
		startTest : function(id){ //determine which section to run and setup the test
			WDN.jQuery('#navigation').empty().load(
				'navigation/'+id+'.html',
				function(){
					ui.update(id);
				}
			);
		},
		
		update : function(id) {
			WDN.initializePlugin('navigation');
			WDN.jQuery('#test'+id).show().find('h3 > span').text(counter);
			WDN.log('ui.update id= '+id);
			if (id != 5){ //test 5 is a multistep, so we need a bit more logic.
				WDN.jQuery('#test'+id+' li span').text(WDN.jQuery('#navigation a.'+ui.type()).eq(0).text());
				WDN.jQuery('#navigation a.'+ui.type()).eq(0).click(function(){
					timer.stop(ui.type()+'_'+id);
					return false;
				});
			} else {
				WDN.log('Setup the two step test');
				WDN.jQuery('#test'+id+' li span').eq(0).text(WDN.jQuery('#navigation a.'+ui.type()).eq(1).text());
				WDN.jQuery('#test'+id+' li span').eq(1).text(WDN.jQuery('#navigation a.'+ui.type()).eq(0).text());
				stepOneComplete = false;
				WDN.jQuery('#navigation a.'+ui.type()).eq(1).click(function(){
					stepOneComplete = true;
					WDN.jQuery("#exercise ol li").eq(0).css({'text-decoration' : 'line-through', 'opacity' : '0.5'});
					return false;
				});
				WDN.jQuery('#navigation a.'+ui.type()).eq(0).click(function(){
					if(stepOneComplete){
						timer.stop(ui.type()+'_'+id);
					}
					return false;
				});
			}
			WDN.jQuery('#test'+id).clone().appendTo('#exercise');
			WDN.jQuery('#exercise .test').removeAttr('id');
			WDN.jQuery('#testing').show();
		},
		
		testComplete : function(testID, startTime, endTime, difference, testOrder) {
			WDN.jQuery('#testing .status').html('Great job! Here\'s your next exercise. <span>'+ timer.difference() + '</span>');
			ui.chooseTest();
			store.save(testID, startTime, endTime, difference, testOrder);
		},
		
		endTests : function(){
			WDN.jQuery('#testing .status').html('Thanks for your help making unl.edu awesome! <span>'+ timer.difference() + '</span>');
			WDN.jQuery('#testing .begin, #testing .test').hide();
			WDN.jQuery('#testing').show();
			WDN.jQuery('#testing .final').show();
		}
	};
}();

window.onload = function(){
	firstType = ui.random(types);
	if (firstType == 'flag'){
		secondType = 'mega';
	} else {
		secondType = 'flag';
	}
	ui.toggleType(firstType);
	WDN.jQuery('document').ready(function(){
		//invalidate all the links on the page so our user doesn't navigate away.
		WDN.jQuery('a').attr({'href' : '#'});
		WDN.jQuery('button.begin').click(function(){
			WDN.jQuery('#testing').hide();
			timer.start();
			return false;
		});
		WDN.jQuery('#hideTesting').click(function(){
			WDN.jQuery('#testing').hide();
			return false;
		});
		WDN.jQuery('#showTesting').click(function(){
			WDN.jQuery('#testing').show();
			return false;
		});
	});
};