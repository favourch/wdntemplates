var startTime, stopTime;
var counter = 0;

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
			store.save(testID, startTime, stopTime, ui.testComplete);
		}
	};
}();

store = function() {
	return {
		setup: function(){
			if (!window.openDatabase){
				WDN.jQuery('#testing .status').text('You are not using a browser that will support this test. Please use Chrome or Safari.');
				return false;
			};
			this.db = openDatabase('usertests', '1.0', 'All user testing storage', 8697);
			this.db.transaction(function(tx){
				tx.executeSql("create table if not exists " +
						"tests(id integer primary key asc, testID varchar, startTime integer, endTime integer, completed boolean, testOrder integer)",
				[],
				function(){console.log('table setup');},
				store.onError
				);
			});
		},
		
		save : function(testID, startTime, endTime, callback){
			store.db.transaction(function(tx){
				tx.executeSql("insert into tests (testId, startTime, endTime, completed, testOrder) values (?,?,?,?,?);",
				[testID, startTime, endTime, 1, counter],
				callback,
				store.onError);
			});
		},
		
		onError: function(tx,error){
			console.log("Error occurred: ", error.message);
		}
	};
}();

ui = function() {
	
	var variations = [1,2,3,4];
	
	var variationsSeen = [];
	
	return {
		
		type : function(){
			return(WDN.jQuery('#navigation').attr('class'));
		},
		
		setup : function(){
			WDN.jQuery('.test').hide();
			if (counter != 4){
				do {
					currentRandom = ui.random();
					i = WDN.jQuery.inArray(currentRandom, variationsSeen);
				}
				while (i > -1); 
				//console.log(currentRandom);
				variationsSeen.push(currentRandom);
				counter++;
				//console.log(counter);
				ui.startTest(currentRandom); //Now we have a random number never used.
			} else {
				ui.endTests();
			}
		},
		
		random : function(){
			thisVariation = variations[Math.floor(Math.random()*variations.length)];
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
			target = WDN.jQuery('#navigation a.'+ui.type()).text();
			WDN.jQuery('#test'+id).show().find('h3 > span').text(counter);
			WDN.jQuery('#test'+id+' li span').text(target);
			WDN.jQuery('#navigation a.'+ui.type()).click(function(){
				timer.stop(ui.type()+'_'+id);
				return false;
			});
			WDN.jQuery('#testing').show();
		},
		
		testComplete : function() {
			WDN.jQuery('#testing .status').text('Great job! Here\'s your next exercise.');
			ui.setup();
		},
		
		endTests : function(){
			WDN.jQuery('#testing .status').text('Thanks for your help making unl.edu awesome!');
			WDN.jQuery('#testing .begin').hide();
			WDN.jQuery('#testing').show();
			WDN.jQuery('#testing .final').show();
		}
	};
}();

window.onload = function(){
	ui.setup();
	store.setup();
	WDN.jQuery('document').ready(function(){
		//invalidate all the links on the page so our user doesn't navigate away.
		WDN.jQuery('a').attr({'href' : '#'});
		WDN.jQuery('button.begin').click(function(){
			WDN.jQuery('#testing').hide();
			timer.start();
			return false;
		});
	});
};