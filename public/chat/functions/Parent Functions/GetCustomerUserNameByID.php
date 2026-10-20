<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetCustomerUserNameByID($session_key, $customer_id, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_customer_user_name_by_id.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_customer_user_name_by_id.php');
	$username = get_customer_user_name_by_id($session_key, $customer_id, $HomeDir);

	return $username;
}

$ajax->export("GetCustomerUserNameByID", "page->GetCustomerUserNameByID");	//	Export function

?>