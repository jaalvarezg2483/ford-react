<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function AddEmailAddress($Session_Key, $CustomerID, $EmailAddress, $HomeDir)
{
	if(!CheckHomeDir($HomeDir,"functions/Soap Functions/add_email_address.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/add_email_address.php');  

	return  add_email_address($Session_Key, $CustomerID, $EmailAddress, $HomeDir);
}

$ajax->export("AddEmailAddress", "page->AddEmailAddress");	//	Export function

?>