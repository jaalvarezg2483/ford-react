<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetCustomerByPhoneNumber($Session_Key, $PhoneNo, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_customer_by_phone_number.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_customer_by_phone_number.php');  

	return  get_customer_by_phone_number($Session_Key, $PhoneNo, $HomeDir);
}

$ajax->export("GetCustomerByPhoneNumber", "page->GetCustomerByPhoneNumber");	//	Export function

?>