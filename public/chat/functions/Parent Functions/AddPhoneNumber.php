<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function AddPhoneNumber($Session_Key, $CustomerID, $PhoneNumber, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/add_phone_number.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/add_phone_number.php');  

	return  add_phone_number($Session_Key, $CustomerID, $PhoneNumber, $HomeDir);
}

$ajax->export("AddPhoneNumber", "page->AddPhoneNumber");	//	Export function

?>