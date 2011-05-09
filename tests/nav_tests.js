var startTime, stopTime;
var counter = 0;
var types = ['flag','mega'];

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
			store.save(testID, startTime, stopTime, timer.difference(), ui.testComplete);
		}
	};
}();

store = function() {
	return {
		setup: function(){
			if (!window.openDatabase){
				WDN.jQuery('#testing .status').text('You are not using a browser that will support this test. Please use Chrome or Safari.');
				WDN.jQuery('button.begin').remove();
				return false;
			};
			this.db = openDatabase('usertests', '1.0', 'All user testing storage', 8697);
			this.db.transaction(function(tx){
				tx.executeSql("create table if not exists " +
						"tests(id integer primary key asc, testID varchar, startTime integer, endTime integer, difference integer, completed boolean, testOrder integer)",
				[],
				function(){console.log('table setup');},
				store.onError
				);
			});
		},
		
		save : function(testID, startTime, endTime, difference, callback){
			store.db.transaction(function(tx){
				tx.executeSql("insert into tests (testId, startTime, endTime, difference, completed, testOrder) values (?,?,?,?,?,?);",
				[testID, startTime, endTime, difference, 1, counter],
				callback,
				store.onError);
			});
		},
		
		display : function(){
			store.db.transaction(function(tx){
				tx.executeSql('select * from tests order by id desc', [], function(tx, result){
					for(var i = 0; i < result.rows.length; i++) {
                        WDN.jQuery('#results tbody').append(
                        		'<tr>'
                        		+ '<td>' + result.rows.item(i)['id'] + '</td>'
                        		+ '<td>' + result.rows.item(i)['testID'] + '</td>'
                        		+ '<td>' + result.rows.item(i)['startTime'] + '</td>'
                        		+ '<td>' + result.rows.item(i)['endTime'] + '</td>'
                        		+ '<td>' + result.rows.item(i)['difference'] + '</td>'
                        		+ '<td>' + result.rows.item(i)['testOrder'] + '</td>'
                        		+ '</tr>'
                        );
                        
                        WDN.jQuery('#sqlStatement').append(
                        	'insert into tblUserTests(testId, startTime, endTime, testOrder) values ('+result.rows.item(i)['testID']+', '+result.rows.item(i)['startTime']+', '+result.rows.item(i)['endTime']+', '+result.rows.item(i)['testOrder']+'); '
                        );
                    }
				});
			});
		},
		
		empty : function(){
			areYouSure = confirm('Clearing the database will remove all records. Make sure you have backed up, don\'t be a fool! Are you sure you want to continue?');
			if(areYouSure){
				store.db.transaction(function(tx){
					tx.executeSql("drop table tests;", [], function(){
						WDN.jQuery('#results, #sqlStatement').hide();
					});
				});
			}
			else {return false;}
		},
		
		onError: function(tx,error){
			console.log("Error occurred: ", error.message);
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
		
		testComplete : function() {
			WDN.jQuery('#testing .status').html('Great job! Here\'s your next exercise. <span>'+ timer.difference() + '</span>');
			ui.chooseTest();
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