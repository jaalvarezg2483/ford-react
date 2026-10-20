<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function GetHistory($session_key, $contact_id, $LastReadTime, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_history_since.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_history_since.php');
	$result = get_history_since($session_key, $contact_id, $LastReadTime, $HomeDir);

	return $result;
}

$ajax->export("GetHistory", "page->GetHistory");	//	Export function

?>