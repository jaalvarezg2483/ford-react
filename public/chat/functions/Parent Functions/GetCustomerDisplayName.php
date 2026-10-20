<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetCustomerDisplayName($Session_Key, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_customer_display_name.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_customer_display_name.php');  

	return  get_customer_display_name($Session_Key, $HomeDir);
}

$ajax->export("GetCustomerDisplayName", "page->GetCustomerDisplayName");	//	Export function

?>