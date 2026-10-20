<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function RegisterNewCustomer($firstName, $lastName, $email, $password, $contactNumberIntCode, $contactNumberAreaCode, $contactNumber, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/reqister_new_customer.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/reqister_new_customer.php');  

	return  register($firstName, $lastName, $email, $password, $contactNumberIntCode, $contactNumberAreaCode, $contactNumber, $HomeDir);
}

$ajax->export("RegisterNewCustomer", "page->RegisterNewCustomer");	//	Export function

?>