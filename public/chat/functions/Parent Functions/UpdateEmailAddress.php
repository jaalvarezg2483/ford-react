<?php

	//	Avaya  Contact Center Multimedia 
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved 

function UpdateEmailAddress($email_address,$session_key, $customer_id, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_customer_email.php"))
		return "-1";

	//	Get ID of default email
	require_once($HomeDir.'functions/Soap Functions/get_customer_email.php');
	$email_id = get_customer_email($customer_id,$session_key, $HomeDir);

	//	Update default email
	require_once($HomeDir.'functions/Soap Functions/update_default_email.php');
	$result = update_default_email($email_address,$email_id, $session_key, $HomeDir);

	return $result;
}

$ajax->export("UpdateEmailAddress", "page->UpdateEmailAddress");	//	Export function

?>