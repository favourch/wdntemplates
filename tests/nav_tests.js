var startTime, stopTime;

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
		
		stop : function(){
			stopTime = new Date().getTime();
			console.log(stopTime);
			store.save('flag_1', startTime, stopTime, ui.testComplete);
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
				[testID, startTime, endTime, 1, 1],
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
	return {
		testComplete : function() {
			alert('Got it, thanks!');
		}
	};
}();

window.onload = function(){
	store.setup();
	WDN.jQuery('document').ready(function(){
		//invalidate all the links on the page so our user doesn't navigate away.
		WDN.jQuery('a').attr({'href' : '#'});
		WDN.jQuery('button.begin').click(function(){
			WDN.jQuery('#testing').hide();
			timer.start();
			return false;
		});
		WDN.jQuery('.target').click(function(){
			timer.stop();
			return false;
		});
	});
};