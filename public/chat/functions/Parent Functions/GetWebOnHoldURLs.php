<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetWebOnHoldURLs($sessionkey, $Tag, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_web_on_hold_urls.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_web_on_hold_urls.php');  
	$result = get_web_on_hold_urls($sessionkey, $Tag, $HomeDir);

	return $result;
}

$ajax->export("GetWebOnHoldURLs", "page->GetWebOnHoldURLs");	//	Export function

?>