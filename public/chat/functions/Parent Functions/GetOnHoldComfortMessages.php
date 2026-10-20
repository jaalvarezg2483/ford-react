<?php

	//	Avaya Contact Center Multimedia
  //	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetOnHoldComfortMessages($contact_id, $session_key, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_on_hold_comfort_messages.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_on_hold_comfort_messages.php');
	$result = get_on_hold_comfort_messages($contact_id, $session_key, $HomeDir);

	return $result;
}

$ajax->export("GetOnHoldComfortMessages", "page->GetOnHoldComfortMessages");	//	Export function

?>