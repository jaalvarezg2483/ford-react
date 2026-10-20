<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function RemoveContactFromQueue($Session_key, $Contact_id, $Comments, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/remove_from_queue.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/remove_from_queue.php');  
	$result = remove_from_queue($Session_key, $Contact_id, $Comments, $HomeDir);

	return $result;
}

$ajax->export("RemoveContactFromQueue", "page->RemoveContactFromQueue");	//	Export function

?>