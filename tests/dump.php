<?php
include 'config.inc.php';

// Make a MySQL Connection
mysql_connect($server, $user, $pass) or die(mysql_error());
mysql_select_db($db) or die(mysql_error());

$testID = mysql_real_escape_string($_POST['testID']);
$startTime = mysql_real_escape_string($_POST['startTime']);
$endTime = mysql_real_escape_string($_POST['endTime']);
$testOrder = mysql_real_escape_string($_POST['testOrder']);
$userType = mysql_real_escape_string($_POST['userType']);

mysql_query(
	"INSERT INTO nav_tests (testID, startTime, endTime, testOrder, userType) VALUES('$testID', $startTime, $endTime, $testOrder, '$userType' ) "
) or die(mysql_error());  

echo 'success';
