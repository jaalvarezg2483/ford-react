<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function UpdateDefault($sessionKey, $phoneNumberID, $isDefault, $homeDir)
{
	if(!CheckHomeDir($homeDir, "functions/Soap Functions/update_default.php"))
		return "-1";

	require_once($homeDir.'functions/Soap Functions/update_default.php');  
	$result = update_default($sessionKey, $phoneNumberID, $isDefault, $homeDir);

	return $result;
}

$ajax->export("UpdateDefault", "page->UpdateDefault");	//	Export function

?>