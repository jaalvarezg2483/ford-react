<?php

//	Avaya Contact Center Multimedia
//	Copyright � 2010 - 2014 Avaya Inc.

function GetAndUpdateAnonymousCustomerID($session_key, $AnonymousUserID, $EmailAddress, $PhoneNumber, $FirstName, $LastName, $Title, $AddressLine1, $AddressLine2, $AddressLine3, $AddressLine4, $AddressLine5, $AddressCounty, $AddressZipCode, $HomeDir)
{
	$HomeDir = getcwd(); $HomeDir = (basename($HomeDir) != "chat")? $HomeDir . "/chat/" : $HomeDir . "/";

	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_and_update_anonymous_customer_id.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_and_update_anonymous_customer_id.php');
	$result = get_and_update_anonymous_customer_id($session_key, $AnonymousUserID, $EmailAddress, $PhoneNumber, $FirstName, $LastName, $Title, $AddressLine1, $AddressLine2, $AddressLine3, $AddressLine4, $AddressLine5, $AddressCounty, $AddressZipCode, $HomeDir);

	return $result;
}

$ajax->export("GetAndUpdateAnonymousCustomerID", "page->GetAndUpdateAnonymousCustomerID");	//	Export function

?>