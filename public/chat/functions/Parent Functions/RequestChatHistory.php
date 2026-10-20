<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function RequestChatHistory($contact_id, $email, $session_key, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/request_chat_history.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/request_chat_history.php');
	$result = request_chat_history($contact_id, $email, $session_key, $HomeDir);

	return $result;
}

$ajax->export("RequestChatHistory", "page->RequestChatHistory");	//	Export function

?>