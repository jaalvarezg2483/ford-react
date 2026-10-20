<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function RequestCallBackLaterCustomerCheck($CallerName, $CallerNumber, $Subject, $SkillsetID, $CustomerID, $SessionKey, $Milliseconds, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/reqister_new_customer.php"))
		return "-1";

	$firstName 	= "ContactCenter";
	$lastName 	= "Anonymous";
	$number		= $CallerNumber;
	$CallerName = "Given Name: " . $CallerName; 

	require_once($HomeDir.'functions/Soap Functions/get_customer_user_name_by_id.php');
	$Username = get_customer_user_name_by_id($SessionKey, $CustomerID, $HomeDir);

	require_once($HomeDir.'functions/Soap Functions/request_callback_later.php');
	$result = request_call_later($SessionKey, $CustomerID, $SkillsetID, $CallerName, $Subject, $Milliseconds, $HomeDir); 

	if($result == "-1")
		return "-1";
	else
		return $Username; 
}

$ajax->export("RequestCallBackLaterCustomerCheck", "page->RequestCallBackLaterCustomerCheck");	//	Export function

?>