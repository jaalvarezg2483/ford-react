<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetAnonymousCustomerID($session_key, $AnonymousUserID, $EmailAddress, $PhoneNumber, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_anonymous_customer_id.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_anonymous_customer_id.php');  
	$result = get_anonymous_customer_id($session_key, $AnonymousUserID, $EmailAddress, $PhoneNumber, $HomeDir);

	return $result;
}

$ajax->export("GetAnonymousCustomerID", "page->GetAnonymousCustomerID");	//	Export function

?>