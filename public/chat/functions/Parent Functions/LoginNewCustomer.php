<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function LoginNewCustomer($username, $password, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/login.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/login.php');  

	return  login($username, $password, $HomeDir);
}

$ajax->export("LoginNewCustomer", "page->LoginNewCustomer");	//	Export function

?>