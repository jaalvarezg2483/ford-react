<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function RequestCallBackNowCustomerCheck($CallerName, $CallerNumber, $Subject, $CustomerID, $SessionKey, $SkillsetID, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/reqister_new_customer.php"))
		return "-1";	

	$firstName 	= "ContactCenter";
	$lastName 	= "Anonymous";
	$number		= $CallerNumber;
	$CallerName = "Given Name: " . $CallerName; 

	require_once($HomeDir.'functions/Soap Functions/get_customer_user_name_by_id.php');
	$Username = get_customer_user_name_by_id($SessionKey, $CustomerID, $HomeDir);

	require_once($HomeDir."functions/Soap Functions/request_callback_now.php");
	$result = request_call_now($SessionKey, $CustomerID, $SkillsetID, $CallerName, $Subject, $HomeDir);


	if($result == "-1")
		return "-1";
	else
		return $Username; 
}

$ajax->export("RequestCallBackNowCustomerCheck", "page->RequestCallBackNowCustomerCheck");	//	Export function

?>