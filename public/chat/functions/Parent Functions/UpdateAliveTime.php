<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function UpdateAliveTime($session_key, $contact_id, $isTyping, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/update_alive_time.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/update_alive_time.php');
	$result1 = update_alive_time($session_key, $contact_id, $isTyping, $HomeDir);

	require_once($HomeDir.'functions/Soap Functions/get_server_time.php');
	$result2 = get_server_time($HomeDir);

	if($result1 < 0)
	{
		//	No agent on other end, or agent disconnected
		return $result1;
	}

	return (($result2 - $result1)/ 1000);
}

$ajax->export("UpdateAliveTime", "page->UpdateAliveTime");	//	Export function

?>