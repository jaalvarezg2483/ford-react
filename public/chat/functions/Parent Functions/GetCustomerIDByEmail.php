<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetCustomerIDByEmail($Session_Key, $EmailAddress, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_customerid_by_email.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_customerid_by_email.php');  

	return  get_customerid_by_email($Session_Key, $EmailAddress, $HomeDir);
}

$ajax->export("GetCustomerIDByEmail", "page->GetCustomerIDByEmail");	//	Export function

?>