<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function ReadCustomer($sessionKey, $customerID, $homeDir)
{
	if(!CheckHomeDir($homeDir, "functions/Soap Functions/read_customer.php"))
		return "-1";

	require_once($homeDir.'functions/Soap Functions/read_customer.php');  
	$result = read_customer($sessionKey, $customerID, $homeDir);

	return $result;
}

$ajax->export("ReadCustomer", "page->ReadCustomer");	//	Export function

?>