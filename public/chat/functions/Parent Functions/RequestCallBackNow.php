<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function RequestCallBackNow($CallerName, $CallerNumber, $Subject, $SkillsetID, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/reqister_new_customer.php"))
		return "-1";

	$firstName 	= "Anonymous";
	$lastName 	= "Web Call-Back";
	$Username 	= time()."@.";
	$password 	= time();
	$number	= $CallerNumber;

	require_once($HomeDir.'functions/Soap Functions/reqister_new_customer.php');
	register(	$firstName,
		$lastName,
		$Username,
		$password,
		"",
		"",
		$number,
		$HomeDir);

	//	Log in the client
	$CallerName = "Given Name: " . $CallerName; 

	require_once($HomeDir.'functions/Soap Functions/login.php');  
	$session_key = login($Username, $password, $HomeDir);

	require_once($HomeDir.'functions/Soap Functions/GetCustomerID.php');
	$cust_id = GetCustomerID($session_key , $Username, $HomeDir);

	require_once($HomeDir."functions/Soap Functions/request_callback_now.php");
	$result = request_call_now($session_key, $cust_id, $SkillsetID, $CallerName, $Subject, $HomeDir);

	if($result == "-1")
		return "-1";
	else
		return $Username; 
}

$ajax->export("RequestCallBackNow", "page->RequestCallBackNow");	//	Export function

?>